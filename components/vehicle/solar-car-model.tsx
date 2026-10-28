'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { IconX } from '@tabler/icons-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { Panel, Pill } from '@/components/ui/surface';
import { TextLink } from '@/components/ui/text-link';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

import { STAGE_SIZE, STAGE_SURFACE, type HotspotLabels, type ViewerHotspot } from './types';

/**
 * The vehicle, shown in the team's own studio scene, with clickable parts.
 *
 * The scene is the Blender studio exported whole
 * (`scripts/blender/export-vehicle-scene.py` writes
 * `public/models/vehicle-scene-v1.glb`): car, battery pack, wheels,
 * platform, floor, LED strip, its lights, its cameras and its world colour.
 * The viewer adds no light, environment or backdrop of its own. Two things
 * glTF cannot carry are rebuilt from what the file describes:
 * - the studio's area lights, as RectAreaLights (the export writes each one
 *   as an empty whose extras hold its size, power, colour and direction);
 * - the platform's mirror-like coat, as a planar reflection of the scene
 *   over the platform top, so the car stands on its reflection as it does
 *   in the renders.
 * The first view is the file's own "Camara_inicial", with the same
 * horizontal field of view Blender gives it (sensor fit on the long side).
 *
 * Interaction:
 * - Each published part has a glowing marker on its surface
 *   (`.cdl-hotspot`), placed by MarkerProjector. It hides while the surface
 *   under it faces away from the camera.
 * - Selecting a part (marker or the list under the viewer) lights the
 *   matching materials in the area's colour, turns the camera towards the
 *   part and opens its specifications: an overlay at desktop, a panel under
 *   the viewer on phones, where an overlay would cover the car.
 * - The list is the accessible way in: real buttons with `aria-pressed`. The
 *   markers are a pointer shortcut and stay out of the tab order.
 */
const MODEL = '/models/vehicle-scene-v1.glb';
const START_CAMERA = 'Camara_inicial';
const REFLECTIVE_MATERIAL = 'Plataforma_superficie';

useGLTF.setDecoderPath('/draco/');

if (typeof window !== 'undefined') {
  RectAreaLightUniformsLib.init();

  // @react-three/fiber (through 9.8.2, the latest) still builds its frame
  // clock with THREE.Clock, which three r186 flags as deprecated. Nothing in
  // this project calls it and there is no upstream fix yet, so that one
  // message is dropped. Delete this once fiber moves to THREE.Timer.
  const warn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.Clock')) return;
    warn(...args);
  };
}

function rgbColor(rgb: string): string {
  return `rgb(${rgb.trim().split(/\s+/).join(', ')})`;
}

/** Undo the selection glow on a set of materials. */
function clearGlow(materials: THREE.MeshStandardMaterial[]) {
  for (const material of materials) {
    material.emissive.setRGB(0, 0, 0);
    material.emissiveIntensity = 1;
  }
}

function paintGlow(materials: THREE.MeshStandardMaterial[], color: THREE.Color, intensity: number) {
  for (const material of materials) {
    material.emissive.copy(color);
    material.emissiveIntensity = intensity;
  }
}

const DIRECT_CALL =
  'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );';

/**
 * three's `lights_fragment_begin` with the specular part of directional
 * lights taken out: around each one's contribution, the direct, clear-coat
 * and sheen specular are put back to what they were, so only its diffuse
 * light remains. That is Blender's "Glossy" ray visibility switched off,
 * which the studio's sun has. If three ever reshapes the chunk, it is
 * returned untouched and the sun simply renders with its highlight.
 */
function diffuseOnlyDirectionalChunk(): string {
  const chunk = THREE.ShaderChunk.lights_fragment_begin;
  const loop = chunk.indexOf('directionalLight = directionalLights[ i ];');
  const at = loop < 0 ? -1 : chunk.indexOf(DIRECT_CALL, loop);
  if (at < 0) return chunk;
  const kept = `{
		vec3 cdlSpecular = reflectedLight.directSpecular;
		#ifdef USE_CLEARCOAT
		vec3 cdlClearcoat = clearcoatSpecularDirect;
		#endif
		#ifdef USE_SHEEN
		vec3 cdlSheen = sheenSpecularDirect;
		#endif
		${DIRECT_CALL}
		reflectedLight.directSpecular = cdlSpecular;
		#ifdef USE_CLEARCOAT
		clearcoatSpecularDirect = cdlClearcoat;
		#endif
		#ifdef USE_SHEEN
		sheenSpecularDirect = cdlSheen;
		#endif
		}`;
  return chunk.slice(0, at) + kept + chunk.slice(at + DIRECT_CALL.length);
}

function renderDirectionalLightsDiffuseOnly(material: THREE.MeshStandardMaterial) {
  const chunk = diffuseOnlyDirectionalChunk();
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', chunk);
  };
  material.customProgramCacheKey = () => 'cdl-diffuse-only-sun';
  material.needsUpdate = true;
}

type AreaLight = {
  key: string;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  color: THREE.Color;
  width: number;
  height: number;
  intensity: number;
};

type Stage = {
  background: THREE.Color;
  areaLights: AreaLight[];
  start: { position: THREE.Vector3; direction: THREE.Vector3; tanHalfWidth: number } | null;
  /** What the first view frames and the orbit turns around: car and battery pack. */
  subject: THREE.Box3;
  mirror: THREE.Mesh | null;
};

/**
 * Reads what the viewer needs from the exported scene, besides its meshes.
 * Runs once per loaded file (the scene is cached and shared).
 */
function readStage(scene: THREE.Object3D, cameras: THREE.Camera[]): Stage {
  scene.updateMatrixWorld(true);

  const world = (scene.userData.cdl_background as [number, number, number] | undefined) ?? [0, 0, 0];
  const background = new THREE.Color().setRGB(world[0], world[1], world[2], THREE.LinearSRGBColorSpace);

  const areaLights: AreaLight[] = [];
  const subject = new THREE.Box3();
  let mirror: THREE.Mesh | null = null;
  let diffuseOnlySun = false;
  const materials = new Set<THREE.MeshStandardMaterial>();
  scene.traverse((node) => {
    if (node instanceof THREE.DirectionalLight) {
      const glossy = node.userData.cdl_glossy ?? node.parent?.userData.cdl_glossy;
      if (glossy === false) diffuseOnlySun = true;
    }
    const data = node.userData as {
      cdl_area_light?: boolean;
      power: number;
      color: [number, number, number];
      width: number;
      height: number;
      direction: [number, number, number];
      widthAxis: [number, number, number];
    };
    if (data.cdl_area_light) {
      // RectAreaLight shines along its local -Z with its width along local X.
      const x = new THREE.Vector3(...data.widthAxis).normalize();
      const z = new THREE.Vector3(...data.direction).normalize().negate();
      const y = new THREE.Vector3().crossVectors(z, x);
      areaLights.push({
        key: node.name,
        position: node.getWorldPosition(new THREE.Vector3()),
        quaternion: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)),
        color: new THREE.Color().setRGB(...data.color, THREE.LinearSRGBColorSpace),
        width: data.width,
        height: data.height,
        // Blender's power (W, one-sided Lambertian emitter) as radiance,
        // the unit RectAreaLight takes: P / (pi * area).
        intensity: data.power / (Math.PI * data.width * data.height),
      });
    }
    if (node instanceof THREE.Mesh) {
      if (/^(Carro|Bateria)/.test(node.name)) subject.expandByObject(node);
      for (const each of Array.isArray(node.material) ? node.material : [node.material]) {
        if (each instanceof THREE.MeshStandardMaterial) materials.add(each);
      }
      const material = node.material as THREE.Material;
      if (!Array.isArray(node.material) && material.name === REFLECTIVE_MATERIAL) mirror = node;
    }
  });

  // The file's directional light is its sun; Blender renders it diffuse only.
  if (diffuseOnlySun) for (const material of materials) renderDirectionalLightsDiffuseOnly(material);

  const source = cameras.find((camera) => camera.name === START_CAMERA) as THREE.PerspectiveCamera | undefined;
  const start = source
    ? {
        position: source.getWorldPosition(new THREE.Vector3()),
        direction: source.getWorldDirection(new THREE.Vector3()),
        // Blender fits the sensor to the long side: what it fixes is the
        // horizontal field of view at the authored aspect.
        tanHalfWidth: Math.tan(THREE.MathUtils.degToRad(source.fov) / 2) * source.aspect,
      }
    : null;

  return { background, areaLights, start, subject, mirror };
}

/** Hides the platform top that the planar reflection replaces. */
function hideMesh(mesh: THREE.Mesh | null) {
  if (mesh) mesh.visible = false;
}

/**
 * The platform's coat: a planar mirror of the scene laid over the platform
 * top, in its exact outline. `tint` darkens the reflection the way a dark
 * clear-coated surface does at the low angles the camera sees it from.
 */
function makeMirror(source: THREE.Mesh, resolution: number) {
  // Reflector mirrors across its own local XY plane (normal +Z, through its
  // origin). The platform top faces +Y at some height, so the geometry is
  // brought down to that plane and turned onto XY, and the mesh is turned
  // back and lifted to the top.
  const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld);
  geometry.computeBoundingBox();
  const top = geometry.boundingBox?.max.y ?? 0;
  geometry.translate(0, -top, 0).rotateX(Math.PI / 2);
  const mirror = new Reflector(geometry, {
    // Linear grey: the reflection comes out at 2 x this (overlay blend).
    color: new THREE.Color().setRGB(0.3, 0.3, 0.3, THREE.LinearSRGBColorSpace),
    textureWidth: resolution,
    textureHeight: resolution,
    clipBias: 0.003,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = top + 0.0005;
  return mirror;
}

function useStage() {
  const { scene, cameras } = useGLTF(MODEL);
  return { scene, stage: useMemo(() => readStage(scene, cameras), [scene, cameras]) };
}

function Studio({
  glow,
  reduce,
  reflectionSize,
}: {
  glow: { materials: string[]; rgb: string } | null;
  reduce: boolean;
  reflectionSize: number;
}) {
  const { scene, stage } = useStage();
  const root = useRef<THREE.Object3D>(null);
  // Everything below is read and written through refs inside the frame
  // loop: three.js objects are mutable by design, React state is not.
  const byName = useRef<Map<string, THREE.MeshStandardMaterial> | null>(null);
  const lit = useRef<{ key: string; list: THREE.MeshStandardMaterial[] }>({ key: '', list: [] });
  const color = useRef(new THREE.Color());

  const mirror = useMemo(
    () => (stage.mirror ? makeMirror(stage.mirror, reflectionSize) : null),
    [stage.mirror, reflectionSize],
  );
  useEffect(() => {
    hideMesh(stage.mirror);
    return () => mirror?.dispose();
  }, [stage.mirror, mirror]);

  // The loaded scene is cached and shared, so the glow is always undone.
  useEffect(() => {
    const current = lit;
    return () => clearGlow(current.current.list);
  }, []);

  useFrame(({ clock }) => {
    const model = root.current;
    if (!model) return;

    // First frame: index the materials by name.
    if (!byName.current) {
      const map = new Map<string, THREE.MeshStandardMaterial>();
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const list = Array.isArray(node.material) ? node.material : [node.material];
          for (const material of list) {
            if (material instanceof THREE.MeshStandardMaterial && material.name) map.set(material.name, material);
          }
        }
      });
      byName.current = map;
    }

    const key = glow ? `${glow.materials.join('|')}@${glow.rgb}` : '';
    if (key !== lit.current.key) {
      clearGlow(lit.current.list);
      const map = byName.current;
      lit.current = {
        key,
        list: glow
          ? glow.materials.map((name) => map.get(name)).filter((m): m is THREE.MeshStandardMaterial => Boolean(m))
          : [],
      };
      if (glow) color.current.set(rgbColor(glow.rgb));
    }

    if (lit.current.list.length === 0) return;
    paintGlow(lit.current.list, color.current, reduce ? 0.45 : 0.32 + 0.22 * Math.sin(clock.elapsedTime * 3.2));
  });

  return (
    <>
      {/* The world colour, on a dome rather than as the clear colour, so it
          goes through the same AgX view transform as everything else. */}
      <mesh scale={150}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color={stage.background} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <primitive ref={root} object={scene} />
      {stage.areaLights.map((light) => (
        <rectAreaLight
          key={light.key}
          args={[light.color, light.intensity, light.width, light.height]}
          position={light.position}
          quaternion={light.quaternion}
        />
      ))}
      {mirror ? <primitive object={mirror} /> : null}
    </>
  );
}

/**
 * The first view. The camera stands where the file's start camera stands
 * and turns to the car and battery pack, then steps along that line until
 * both fit the stage, whatever its shape. The field of view follows
 * Blender's: the start camera's horizontal angle on landscape stages, the
 * same angle on the vertical on portrait ones (Blender's "auto" sensor fit).
 */
function StartView() {
  const { stage } = useStage();
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const size = useThree((state) => state.size);
  const placed = useRef(false);

  useEffect(() => {
    if (!controls || !stage.start || !size.width || !size.height) return;
    fitFov(camera, stage.start.tanHalfWidth, size.width / size.height);
    // Framed once; after that a resize only changes the lens, never a view
    // the visitor has turned to.
    if (placed.current) return;
    placed.current = true;
    frameSubject(camera, controls, stage.start.position, stage.subject);
  }, [camera, controls, stage, size.width, size.height]);

  return null;
}

function fitFov(camera: THREE.PerspectiveCamera, tanHalfWidth: number, aspect: number) {
  camera.aspect = aspect;
  const tanHalfHeight = aspect >= 1 ? tanHalfWidth / aspect : tanHalfWidth;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanHalfHeight));
  camera.updateProjectionMatrix();
}

/** Margin around the subject, as a share of the half-frame. */
const FRAME_FILL = 0.86;

function frameSubject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControlsImpl,
  from: THREE.Vector3,
  subject: THREE.Box3,
) {
  const center = subject.getCenter(new THREE.Vector3());
  const direction = from.clone().sub(center).normalize();
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(
    (i) =>
      new THREE.Vector3(
        i & 1 ? subject.max.x : subject.min.x,
        i & 2 ? subject.max.y : subject.min.y,
        i & 4 ? subject.max.z : subject.min.z,
      ),
  );
  const probe = new THREE.Vector3();
  const fits = (distance: number) => {
    camera.position.copy(center).addScaledVector(direction, distance);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    return corners.every((corner) => {
      probe.copy(corner).project(camera);
      return Math.abs(probe.x) <= FRAME_FILL && Math.abs(probe.y) <= FRAME_FILL && probe.z < 1;
    });
  };
  // Bisect between "too close" and "certainly far enough".
  let near = 0.5;
  let far = 40;
  for (let i = 0; i < 24; i++) {
    const mid = (near + far) / 2;
    if (fits(mid)) far = mid;
    else near = mid;
  }
  camera.position.copy(center).addScaledVector(direction, far);
  controls.target.copy(center);
  controls.update();
}

/**
 * Places the markers. They are ordinary buttons laid over the canvas (so
 * they are plain React, styled by CSS, and never steal a drag from the
 * orbit controls); every frame this projects each part's point to the
 * screen and moves its button there, and hides it while the surface under
 * it faces away from the camera. Writes go straight to the DOM through
 * refs, never through React state.
 */
function MarkerProjector({
  hotspots,
  markers,
  selectedKey,
}: {
  hotspots: ViewerHotspot[];
  markers: React.RefObject<Map<string, HTMLButtonElement>>;
  selectedKey: string | null;
}) {
  const size = useThree((state) => state.size);
  const { scene } = useStage();

  // Snap every marker onto the shell: cast a ray from outside the car back
  // along the authored normal and keep the first surface it meets, with that
  // face's own normal. The authored points then only need to be roughly
  // right, and a re-exported model keeps its markers on its surface.
  const points = useMemo(() => {
    scene.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    return hotspots.map((spot) => {
      const authored = new THREE.Vector3(...spot.position);
      const normal = new THREE.Vector3(...spot.normal).normalize();
      const inward = normal.clone().negate();
      raycaster.set(authored.clone().addScaledVector(normal, 3), inward);
      const hit = raycaster.intersectObject(scene, true)[0];
      if (!hit) return { key: spot.key, point: authored, normal };
      const faceNormal = hit.face
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
        : normal.clone();
      // Double-sided materials: make sure the normal points out of the car.
      if (faceNormal.dot(inward) > 0) faceNormal.negate();
      return { key: spot.key, point: hit.point.clone().addScaledVector(faceNormal, 0.004), normal: faceNormal };
    });
  }, [hotspots, scene]);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const toCamera = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    for (const { key, point, normal } of points) {
      const element = markers.current.get(key);
      if (!element) continue;
      toCamera.copy(camera.position).sub(point).normalize();
      const visible = key === selectedKey || toCamera.dot(normal) > 0.08;
      element.dataset.hidden = visible ? 'false' : 'true';
      projected.copy(point).project(camera);
      const x = ((projected.x + 1) / 2) * size.width;
      const y = ((1 - projected.y) / 2) * size.height;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });

  return null;
}

/**
 * Turns the camera around the target until it looks along the selected
 * part's normal, from a little above. The distance is kept, so a zoom the
 * visitor chose survives. Any drag cancels the move.
 */
function CameraRig({ focus, reduce }: { focus: ViewerHotspot | null; reduce: boolean }) {
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const camera = useThree((state) => state.camera);
  const goal = useRef<THREE.Vector3 | null>(null);
  const direction = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!focus || !controls) {
      goal.current = null;
      return;
    }
    goal.current = new THREE.Vector3(...focus.normal).normalize().add(new THREE.Vector3(0, 0.6, 0)).normalize();
    const stop = () => {
      goal.current = null;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [focus, controls]);

  useFrame((_, delta) => {
    if (!goal.current || !controls) return;
    const target = controls.target;
    const distance = camera.position.distanceTo(target);
    direction.copy(camera.position).sub(target).normalize();
    direction.lerp(goal.current, reduce ? 1 : 1 - Math.exp(-delta * 3.4)).normalize();
    camera.position.copy(target).addScaledVector(direction, distance);
    controls.update();
    if (direction.distanceTo(goal.current) < 0.002) goal.current = null;
  });

  return null;
}

function HotspotDetails({
  spot,
  labels,
  onClose,
  className,
}: {
  spot: ViewerHotspot;
  labels: HotspotLabels;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div aria-live="polite" className={className}>
      <Panel accent={spot.areaAccent} lit={false} className="flex max-h-full flex-col gap-3 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <span className="pt-1 text-base font-medium uppercase" style={{ color: spot.areaLabel }}>
            {spot.areaName}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            data-ripple=""
            className="cdl-press -mr-2 -mt-2 inline-flex size-12 shrink-0 items-center justify-center rounded-pill text-ink-muted hover:text-ink"
          >
            <IconX className="icon-brand" aria-hidden />
          </button>
        </div>
        <h3 className="font-titulo text-2xl font-bold leading-tight md:text-[2rem]">{spot.name}</h3>
        <p className="text-base text-ink-muted">{spot.body}</p>
        {spot.state ? (
          <Pill tone="outline" className="self-start">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: spot.state.color }} />
            {spot.state.label}
          </Pill>
        ) : null}
        {spot.rows.length > 0 ? (
          <dl className="flex flex-col">
            {spot.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 py-2 not-last:border-b not-last:border-hairline"
              >
                <dt className="text-base text-ink-muted">{row.label}</dt>
                <dd className="text-right text-base font-medium text-ink tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-base text-ink-faint">{labels.noSpecs}</p>
        )}
        {spot.provisional ? <p className="text-base text-ink-faint">{labels.provisional}</p> : null}
        <TextLink href={spot.href}>{labels.teamLink}</TextLink>
      </Panel>
    </div>
  );
}

export default function SolarCarModel({
  label,
  hint,
  hotspots = [],
  hotspotLabels,
}: {
  label: string;
  hint: string;
  hotspots?: ViewerHotspot[];
  hotspotLabels?: HotspotLabels;
}) {
  const reduce = usePrefersReducedMotion();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  // The reflection re-renders the scene, so phones get a smaller one.
  const [reflectionSize] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? 512 : 1024));
  const markers = useRef(new Map<string, HTMLButtonElement>());
  const selected = hotspots.find((spot) => spot.key === selectedKey) ?? null;

  const select = (key: string) => {
    setTouched(true);
    setSelectedKey((current) => (current === key ? null : key));
  };

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedKey(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const glow = useMemo(
    () => (selected && selected.materials.length > 0 ? { materials: selected.materials, rgb: selected.areaRgb } : null),
    [selected],
  );

  return (
    <div className="flex flex-col gap-3">
      <section
        aria-label={label}
        className={cn('cdl-stage relative w-full overflow-hidden rounded-block border border-hairline', STAGE_SIZE, STAGE_SURFACE)}
      >
        <Canvas
          aria-hidden
          dpr={[1, 1.75]}
          camera={{ position: [-2.8, 0.7, 1.3], fov: 37, near: 0.05, far: 200 }}
          // The studio was rendered through Blender's AgX view transform.
          gl={{ antialias: true, powerPreference: 'low-power', toneMapping: THREE.AgXToneMapping }}
          className="size-full"
          onPointerDown={() => setTouched(true)}
        >
          <Suspense fallback={null}>
            <Studio glow={glow} reduce={reduce} reflectionSize={reflectionSize} />
            <StartView />
            <MarkerProjector hotspots={hotspots} markers={markers} selectedKey={selectedKey} />
            <CameraRig focus={selected} reduce={reduce} />
          </Suspense>

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom
            zoomSpeed={0.8}
            minDistance={1.2}
            maxDistance={9}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={!reduce && !touched}
            autoRotateSpeed={0.6}
          />
        </Canvas>

        {/* Telemetry framing over the canvas, DOM only: the studio scene
            itself gets nothing added (see .cdl-hud in globals.css). */}
        <div aria-hidden className="cdl-hud pointer-events-none absolute inset-0 z-[5]">
          <span className="cdl-hud-corner" data-at="tl" />
          <span className="cdl-hud-corner" data-at="tr" />
          <span className="cdl-hud-corner" data-at="bl" />
          <span className="cdl-hud-corner" data-at="br" />
          <span className="cdl-hud-ruler" data-at="top" />
          <span className="cdl-hud-ruler" data-at="right" />
          <span className="cdl-hud-light" />
          <span className="cdl-hud-scan" />
        </div>

        {/* Markers: positioned every frame by MarkerProjector. Pointer
            shortcuts only; the list under the viewer is the accessible way in. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {hotspots.map((spot) => (
            <button
              key={spot.key}
              ref={(element) => {
                if (element) markers.current.set(spot.key, element);
                else markers.current.delete(spot.key);
              }}
              type="button"
              tabIndex={-1}
              onClick={() => select(spot.key)}
              data-hidden="true"
              data-selected={spot.key === selectedKey ? 'true' : 'false'}
              className="cdl-hotspot pointer-events-auto"
              style={{ '--hs-rgb': spot.areaRgb } as React.CSSProperties}
            >
              <span className="cdl-hotspot-label">{spot.name}</span>
            </button>
          ))}
        </div>

        <p className="pointer-events-none absolute bottom-3 left-4 max-w-[min(100%-2rem,40rem)] text-base text-neutro-100/72">
          {hint}
        </p>

        {selected && hotspotLabels ? (
          <HotspotDetails
            spot={selected}
            labels={hotspotLabels}
            onClose={() => setSelectedKey(null)}
            className="absolute bottom-3 right-3 top-3 z-30 hidden w-[24rem] flex-col justify-start md:flex"
          />
        ) : null}
      </section>

      {hotspots.length > 0 && hotspotLabels ? (
        <div className="flex flex-col gap-2">
          <p className="text-base text-ink-muted">{hotspotLabels.hint}</p>
          {/* A swipeable rail on phones, wrapped rows from tablet up. */}
          <div
            role="group"
            aria-label={hotspotLabels.title}
            className="-mx-[max(1.5rem,6.25vw)] flex gap-2 overflow-x-auto px-[max(1.5rem,6.25vw)] pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            {hotspots.map((spot) => {
              const pressed = spot.key === selectedKey;
              return (
                <button
                  key={spot.key}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => select(spot.key)}
                  data-light=""
                  data-ripple=""
                  className={cn(
                    'cdl-press cdl-light cdl-light-edge cdl-nav-item inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border px-3 text-base font-medium',
                    pressed ? 'border-accent' : 'border-hairline',
                  )}
                  style={{ '--cdl-light-rgb': spot.areaRgb, '--cdl-light-alpha': '0.16' } as React.CSSProperties}
                >
                  <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: spot.areaAccent }} />
                  {spot.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {selected && hotspotLabels ? (
        <HotspotDetails
          spot={selected}
          labels={hotspotLabels}
          onClose={() => setSelectedKey(null)}
          className="md:hidden"
        />
      ) : null}
    </div>
  );
}

useGLTF.preload(MODEL);
