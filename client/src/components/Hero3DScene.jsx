import { Canvas } from '@react-three/fiber';
import { Float, PresentationControls, ContactShadows, Environment, TorusKnot, Sphere, Icosahedron } from '@react-three/drei';
import { Suspense } from 'react';

function PremiumAbstractShapes() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Centerpiece: Premium Refractive Glass TorusKnot */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <TorusKnot args={[1.2, 0.4, 256, 64]} position={[0, 0.5, 0]}>
          <meshPhysicalMaterial 
            transmission={1}
            opacity={1}
            metalness={0.1}
            roughness={0.05}
            ior={1.5}
            thickness={2.5}
            specularIntensity={1}
            clearcoat={1}
            color="#ffffff"
          />
        </TorusKnot>
      </Float>

      {/* Floating Accent Sphere (Brand Yellow) */}
      <Float speed={3} rotationIntensity={2} floatIntensity={3} position={[-2, 2, -1]}>
        <Sphere args={[0.5, 64, 64]}>
          <meshPhysicalMaterial color="#facc15" roughness={0.1} metalness={0.8} clearcoat={1} />
        </Sphere>
      </Float>

      {/* Floating Accent Icosahedron (Emerald Green wireframe) */}
      <Float speed={2} rotationIntensity={2} floatIntensity={2} position={[2, -0.5, 1]}>
        <Icosahedron args={[0.6, 0]}>
          <meshPhysicalMaterial color="#10b981" roughness={0.2} metalness={0.8} wireframe />
        </Icosahedron>
      </Float>

      {/* Floating Accent Sphere (Rose Red Glass) */}
      <Float speed={4} rotationIntensity={1} floatIntensity={3} position={[-1.5, -1, 1.5]}>
        <Sphere args={[0.4, 64, 64]}>
          <meshPhysicalMaterial 
            color="#f43f5e" 
            roughness={0.1} 
            metalness={0.1} 
            transmission={0.8} 
            thickness={1}
            clearcoat={1} 
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Hero3DScene() {
  return (
    <div className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        
        {/* Environmental lighting for premium reflections */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <PremiumAbstractShapes />
          </PresentationControls>
          {/* Subtle contact shadow */}
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
