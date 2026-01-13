import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function ProtectionShield() {
    const shieldRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (shieldRef.current) {
            const t = state.clock.getElapsedTime();
            // Rotate the shield
            shieldRef.current.rotation.y = t * 0.2;
            shieldRef.current.rotation.z = t * 0.1;

            // Mouse interaction (gentle tilt)
            const mouseX = state.mouse.x * 0.5;
            const mouseY = state.mouse.y * 0.5;
            shieldRef.current.rotation.x = THREE.MathUtils.lerp(shieldRef.current.rotation.x, mouseY, 0.1);
            shieldRef.current.rotation.y = THREE.MathUtils.lerp(shieldRef.current.rotation.y, mouseX + t * 0.2, 0.1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={shieldRef} args={[1, 100, 100]} scale={2.2}>
                <MeshDistortMaterial
                    color="#60a5fa"
                    attach="material"
                    distort={0.4}
                    speed={1.5}
                    roughness={0}
                    metalness={0.9}
                    transmission={0.5} // Glass-like
                    thickness={0.5}
                    clearcoat={1}
                    clearcoatRoughness={0}
                />
            </Sphere>
            {/* Core glowing sphere */}
            <Sphere args={[0.6, 32, 32]}>
                <meshBasicMaterial color="#93c5fd" transparent opacity={0.8} />
            </Sphere>

            {/* Lighting for the glass effect */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#f472b6" />
        </Float>
    );
}
