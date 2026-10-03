'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useReducedMotion } from 'motion/react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Schematic model of a Challenger-class solar vehicle.
 *
 * This is NOT a reconstruction of the vehicle Candelaria is building. No
 * reference image of the real car exists yet, so nothing here claims to be a
 * measurement: it is a massing study of the class the team is designing for
 * (single-seat monocoque, flat top array, four faired wheels). The caption on
 * the page says so in both languages.
 *
 * Built entirely from primitives and extruded profiles, with no external
 * asset: the whole model is a few kilobytes of code, which keeps the vehicle
 * page inside the performance budget the rest of the site holds to.
 *
 * Every part is a named child of the root group, so the model is explodable
 * and clickable if the page later needs hotspots.
 */

const BODY = '#2D0E3F';
const BODY_DARK = '#1E0A29';
const GOLD = '#FFB938';
const ARRAY_DARK = '#140720';
const TYRE = '#161016';

/** Plan-view outline of the shell: a teardrop, wide at the axle line. */
function bodyProfile(): THREE.Shape {
  const shape = new THREE.Shape();
  const halfWidth = 0.9;
  const nose = 2.6;
  const tail = -2.6;

  shape.moveTo(nose, 0);
  shape.bezierCurveTo(nose - 0.4, halfWidth * 0.55, 1.4, halfWidth, 0.2, halfWidth);
  shape.bezierCurveTo(-1.0, halfWidth, -2.0, halfWidth * 0.8, tail, halfWidth * 0.32);
  shape.lineTo(tail, -halfWidth * 0.32);
  shape.bezierCurveTo(-2.0, -halfWidth * 0.8, -1.0, -halfWidth, 0.2, -halfWidth);
  shape.bezierCurveTo(1.4, -halfWidth, nose - 0.4, -halfWidth * 0.55, nose, 0);

  return shape;
}

/** Fairing outline for a wheel pod. */
function fairingProfile(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0.52, 0);
  shape.bezierCurveTo(0.52, 0.3, 0.28, 0.42, 0, 0.42);
  shape.bezierCurveTo(-0.34, 0.42, -0.62, 0.26, -0.62, 0);
  shape.lineTo(0.52, 0);
  return shape;
}

/**
 * Procedural texture for the photovoltaic array. A canvas grid rather than an
 * image file: it keeps the "no external asset" rule and reads as cell edges at
 * every zoom level the orbit control allows.
 */
function arrayTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = ARRAY_DARK;
    ctx.fillRect(0, 0, size, size);

    const cell = size / 8;
    ctx.strokeStyle = 'rgba(166, 52, 218, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 8; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    // Busbars: two fine gold lines per cell row.
    ctx.strokeStyle = 'rgba(255, 185, 56, 0.28)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      for (const offset of [0.34, 0.66]) {
        const y = (i + offset) * cell;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.anisotropy = 4;
  return texture;
}

function Wheel({ position, flip }: { position: [number, number, number]; flip: boolean }) {
  const fairing = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(fairingProfile(), {
      depth: 0.34,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 3,
      curveSegments: 16,
    });
    geometry.center();
    return geometry;
  }, []);

  return (
    <group position={position} name="wheel-assembly">
      <mesh name="tyre" rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.18, 28]} />
        <meshStandardMaterial color={TYRE} roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh name="hub" rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, 0.2, 20]} />
        <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh
        name="fairing"
        geometry={fairing}
        position={[0, 0.12, flip ? -0.26 : 0.26]}
        rotation={[0, flip ? Math.PI : 0, 0]}
      >
        <meshStandardMaterial color={BODY} roughness={0.3} metalness={0.25} />
      </mesh>
    </group>
  );
}

function SolarCar({ spin }: { spin: boolean }) {
  const root = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);

  const shell = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(bodyProfile(), {
      depth: 0.3,
      bevelEnabled: true,
      bevelSize: 0.14,
      bevelThickness: 0.16,
      bevelSegments: 6,
      curveSegments: 48,
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.center();
    return geometry;
  }, []);

  const panel = useMemo(() => arrayTexture(), []);

  useFrame((_, delta) => {
    if (!spin) return;
    if (root.current) root.current.rotation.y += delta * 0.18;
    if (wheels.current) {
      for (const child of wheels.current.children) child.rotation.x -= delta * 1.6;
    }
  });

  return (
    <group ref={root} name="solar-car" position={[0, -0.1, 0]}>
      <mesh name="monocoque" geometry={shell} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3E1057" roughness={0.32} metalness={0.25} />
      </mesh>

      <mesh name="underbody" position={[0, 0.26, 0]}>
        <boxGeometry args={[4.6, 0.12, 1.5]} />
        <meshStandardMaterial color={BODY_DARK} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* The extruded shell spans y 0.11 to 0.73 once centred, so the array
          sits just above its top face rather than inside it. */}
      <mesh name="solar-array" position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.3, 1.42]} />
        <meshStandardMaterial map={panel} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Gold leading edge. The single accent on the model, per the brand
          manual's rule that gold stays an accent and never dominates. */}
      <mesh name="leading-edge" position={[2.2, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.04, 1.2, 4, 12]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.6} />
      </mesh>

      <mesh name="canopy" position={[-0.9, 0.74, 0]} scale={[1.25, 0.9, 1]}>
        <sphereGeometry args={[0.46, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#D4BCFA"
          roughness={0.06}
          metalness={0}
          transmission={0.82}
          thickness={0.3}
          ior={1.45}
          transparent
        />
      </mesh>

      <mesh name="canopy-ring" position={[-0.9, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.022, 10, 36]} />
        <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.75} />
      </mesh>

      <group ref={wheels} name="wheels">
        <Wheel position={[1.5, 0.3, 0.74]} flip={false} />
        <Wheel position={[1.5, 0.3, -0.74]} flip />
        <Wheel position={[-1.55, 0.3, 0.6]} flip={false} />
        <Wheel position={[-1.55, 0.3, -0.6]} flip />
      </group>
    </group>
  );
}

export default function SolarCarModel({ label, hint }: { label: string; hint: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      role="img"
      aria-label={label}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-block border border-hairline bg-surface"
    >
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'low-power', toneMappingExposure: 1.15 }}
        className="size-full"
      >
        <color attach="background" args={[BODY_DARK]} />
        <PerspectiveCamera makeDefault position={[5.4, 2.2, 5.2]} fov={36} />

        {/* Three lights, each with a job: a lavender hemisphere for ambient
            fill so the underside never goes to pure black, a gold key that
            reads as sunlight, and a violet rim that separates the silhouette
            from the background. */}
        <hemisphereLight args={['#D4BCFA', '#3E1057', 1.1]} />
        <directionalLight
          position={[5, 7, 4]}
          intensity={3.4}
          color="#FFF1D6"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight position={[-6, 2.5, -5]} intensity={1.6} color="#C471EA" />
        <directionalLight position={[0, -2, 6]} intensity={0.5} color="#FFB938" />

        <SolarCar spin={!reduce} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
          <circleGeometry args={[7, 48]} />
          <meshStandardMaterial color="#17061F" roughness={1} metalness={0} />
        </mesh>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
        />
      </Canvas>

      <p className="pointer-events-none absolute bottom-3 left-4 right-4 text-base text-ink-faint">
        {hint}
      </p>
    </div>
  );
}
