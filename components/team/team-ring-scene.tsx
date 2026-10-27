'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import {
  frontIndex,
  RING_DEG_PER_SEC,
  RING_DISTANCE,
  RING_TILT_DEG,
  ringAngle,
  ringRadius,
  rotationFor,
  visibleWidth,
  type RingMotion,
} from './ring';

/**
 * The three.js side of the Team carousel: the seven 3D area logos standing
 * on a tilted ring. The ring turns as one piece, carrying the logos round,
 * and each logo also turns slowly on its own axis. One canvas for all seven
 * (a canvas per logo would be seven WebGL contexts, which phones do not
 * survive).
 *
 * Logos further back fade into the section colour through fog, which is how
 * the original carousel dims the faces turned away from the viewer.
 * Lighting is the same three lights as every other area logo on the site.
 */

useGLTF.setDecoderPath('/draco/');

export type RingLogo = { key: string; name: string };

const LIFT = 0.22;
const HOVER_LIFT = 0.06;
const SELECTED_SCALE = 1.12;
/** Turn of the selected logo on its own axis, rad/s: the speed the area logos always had. */
const SPIN = 0.35;

/**
 * Logos face the viewer like the cards of the original carousel; only the
 * selected one turns on its own axis. Deselected, it eases back to facing
 * front by the shortest way.
 */
function spun(angle: number, selected: boolean, reduce: boolean, delta: number, ease: number): number {
  if (selected) return reduce ? 0 : angle + Math.min(delta, 0.1) * SPIN;
  const turn = Math.PI * 2;
  const rest = Math.round(angle / turn) * turn;
  return Math.abs(rest - angle) < 0.002 ? rest : angle + (rest - angle) * ease;
}

function Logo({
  logo,
  index,
  count,
  selected,
  hovered,
  reduce,
  onPick,
  onHover,
  holder,
}: {
  logo: RingLogo;
  index: number;
  count: number;
  selected: boolean;
  hovered: boolean;
  reduce: boolean;
  onPick: (index: number) => void;
  onHover: (index: number | null) => void;
  holder: (index: number, node: THREE.Object3D | null) => void;
}) {
  const { scene } = useGLTF(`/models/areas/${logo.key}.glb`);
  const lift = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  // Own copy, scaled so the logo is 1 unit across whatever the export units.
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const size = new THREE.Box3().setFromObject(copy).getSize(new THREE.Vector3());
    copy.scale.setScalar(1 / (Math.max(size.x, size.y) || 1));
    return copy;
  }, [scene]);

  useFrame((_, delta) => {
    const group = lift.current;
    if (!group) return;
    const ease = 1 - Math.exp(-delta * 9);
    const goal = selected ? LIFT : hovered ? HOVER_LIFT : 0;
    group.position.y += (goal - group.position.y) * ease;
    const scale = group.scale.x + ((selected ? SELECTED_SCALE : 1) - group.scale.x) * ease;
    group.scale.setScalar(scale);
    if (spin.current) spin.current.rotation.y = spun(spin.current.rotation.y, selected, reduce, delta, ease);
  });

  const radius = ringRadius(count);
  const angle = THREE.MathUtils.degToRad(index * ringAngle(count));

  return (
    <group position={[radius * Math.sin(angle), 0, radius * Math.cos(angle)]} rotation-y={angle}>
      <group
        ref={(node) => {
          lift.current = node;
          holder(index, node);
        }}
      >
        <group ref={spin}>
          <Center>
            <primitive object={model} />
          </Center>
        </group>
        {/* Hit area: the logos are thin, full of holes and turning, so a
            click is taken on an invisible square around each one. */}
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            onPick(index);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(index);
          }}
          onPointerOut={() => onHover(null)}
        >
          <planeGeometry args={[1.15, 1.15]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/** Fits the lens to the stage: the whole ring on wide stages, the front logo on phones. */
function Lens({ count, narrow }: { count: number; narrow: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  useEffect(() => {
    if (!size.width || !size.height) return;
    fitLens(camera, count, narrow, size.width / size.height);
  }, [camera, count, narrow, size.width, size.height]);
  return null;
}

function fitLens(camera: THREE.PerspectiveCamera, count: number, narrow: boolean, aspect: number) {
  // Tall enough for a lifted logo above and its name below.
  const height = Math.max(visibleWidth(count, narrow) / aspect, 1.75);
  camera.aspect = aspect;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / 2 / RING_DISTANCE));
  camera.position.set(0, 0.25, RING_DISTANCE);
  camera.lookAt(0, -0.06, 0);
  camera.updateProjectionMatrix();
}

/**
 * One frame of ring motion: a drag moves it directly (the DOM layer writes
 * `rot`), a fling coasts and then snaps to the nearest logo, a pick eases to
 * its logo, and otherwise it turns on its own while `auto` is on. Returns the
 * logo a fling settled on, if one just did.
 */
function advanceRing(m: RingMotion, dt: number, count: number, reduce: boolean): number | null {
  if (m.dragging) return null;
  if (m.target !== null) {
    m.rot += (m.target - m.rot) * (reduce ? 1 : 1 - Math.exp(-dt * 6));
    if (Math.abs(m.target - m.rot) < 0.05) {
      m.rot = m.target;
      m.target = null;
    }
    return null;
  }
  if (!reduce && Math.abs(m.vel) > 8) {
    m.rot += m.vel * dt;
    m.vel *= Math.pow(0.94, dt * 60);
    return null;
  }
  if (m.settle) {
    // The fling has died: the logo nearest the front takes it.
    m.vel = 0;
    m.settle = false;
    const index = frontIndex(m.rot, count);
    m.target = rotationFor(index, count, m.rot);
    return index;
  }
  if (m.auto && !reduce) m.rot += RING_DEG_PER_SEC * dt;
  return null;
}

function turnRing(ring: THREE.Object3D | null, rot: number) {
  if (ring) ring.rotation.y = THREE.MathUtils.degToRad(rot);
}

function Driver({
  motion,
  ring,
  count,
  reduce,
  onSettle,
}: {
  motion: React.RefObject<RingMotion>;
  ring: React.RefObject<THREE.Group | null>;
  count: number;
  reduce: boolean;
  onSettle: (index: number) => void;
}) {
  useFrame((_, delta) => {
    const settled = advanceRing(motion.current, Math.min(delta, 0.1), count, reduce);
    turnRing(ring.current, motion.current.rot);
    if (settled !== null) onSettle(settled);
  });
  return null;
}

function placeLabel(
  element: HTMLElement | null,
  holder: THREE.Object3D | undefined,
  camera: THREE.Camera,
  size: { width: number; height: number },
  scratch: { point: THREE.Vector3; normal: THREE.Vector3; toCamera: THREE.Vector3 },
) {
  if (!element) return;
  if (!holder) {
    element.dataset.hidden = 'true';
    return;
  }
  const { point, normal, toCamera } = scratch;
  holder.localToWorld(point.set(0, -0.62, 0));
  normal.set(0, 0, 1).transformDirection(holder.matrixWorld);
  toCamera.copy(camera.position).sub(point).normalize();
  element.dataset.hidden = normal.dot(toCamera) > 0.35 ? 'false' : 'true';
  point.project(camera);
  const x = ((point.x + 1) / 2) * size.width;
  const y = ((1 - point.y) / 2) * size.height;
  element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 0)`;
}

/**
 * Moves the selected area's name under its logo, wherever the ring has taken
 * it, and hides it while the logo is on the far side. Writes straight to the
 * DOM.
 */
function LabelProjector({
  label,
  holders,
  selected,
}: {
  label: React.RefObject<HTMLElement | null>;
  holders: React.RefObject<Map<number, THREE.Object3D>>;
  selected: number | null;
}) {
  const size = useThree((state) => state.size);
  const point = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const toCamera = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const holder = selected === null ? undefined : holders.current.get(selected);
    placeLabel(label.current, holder, camera, size, { point, normal, toCamera });
  });
  return null;
}

export default function TeamRingScene({
  logos,
  motion,
  selected,
  reduce,
  narrow,
  fog,
  active,
  label,
  onPick,
  onSettle,
  onPointing,
}: {
  logos: RingLogo[];
  motion: React.RefObject<RingMotion>;
  selected: number | null;
  reduce: boolean;
  narrow: boolean;
  /** Section background, which the back of the ring fades into. */
  fog: string;
  /** False while the section is off screen: the loop stops. */
  active: boolean;
  label: React.RefObject<HTMLElement | null>;
  onPick: (index: number) => void;
  onSettle: (index: number) => void;
  onPointing: (pointing: boolean) => void;
}) {
  const ring = useRef<THREE.Group>(null);
  const holders = useRef(new Map<number, THREE.Object3D>());
  const [hovered, setHovered] = useState<number | null>(null);
  const count = logos.length;
  const radius = ringRadius(count);
  const tilt = THREE.MathUtils.degToRad(RING_TILT_DEG);
  const near = RING_DISTANCE - 0.6;

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.25, RING_DISTANCE], fov: 14, near: 1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      className="size-full"
    >
      <fog attach="fog" args={[fog, near, near + (2 * radius) / 0.62]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#FFF1D6" />
      <directionalLight position={[-4, 1, -3]} intensity={1.2} color="#C471EA" />
      <Lens count={count} narrow={narrow} />
      <group position={[0, 0, -radius]} rotation-x={tilt}>
        <group ref={ring}>
          {logos.map((logo, index) => (
            <Logo
              key={logo.key}
              logo={logo}
              index={index}
              count={count}
              selected={selected === index}
              hovered={hovered === index}
              reduce={reduce}
              onPick={onPick}
              onHover={(value) => {
                setHovered(value);
                onPointing(value !== null);
              }}
              holder={(i, node) => {
                if (node) holders.current.set(i, node);
                else holders.current.delete(i);
              }}
            />
          ))}
        </group>
      </group>
      <Driver motion={motion} ring={ring} count={count} reduce={reduce} onSettle={onSettle} />
      <LabelProjector label={label} holders={holders} selected={selected} />
    </Canvas>
  );
}
