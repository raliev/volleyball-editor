// src/threeD/VolleyballPlayer.jsx
import React, { useMemo } from 'react';
// Added Billboard to the imports to fix the ReferenceError
import { Text, useGLTF, Billboard } from '@react-three/drei';

const POSE_MODELS = {
    'attack': '/models/attack-pose.glb',
    'block': '/models/block-pose.glb',
    'serve': '/models/serve-pose.glb',
    'passing': '/models/passing-pose.glb',
    'auto': '/models/passing-pose.glb'
};

export const VolleyballPlayer = ({
                                     position,
                                     name,
                                     color = "#3b82f6",
                                     rotationY = 0,
                                     pose = "stand"
                                 }) => {
    const modelPath = POSE_MODELS[pose] || POSE_MODELS['stand'];
    const { scene } = useGLTF(modelPath);

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    const heightOffset = 0;
    const jumpY =  0;

    return (
        <group position={[position.x, jumpY, position.z]} rotation={[0, rotationY, 0]}>
            <primitive
                object={clonedScene}
                scale={[1, 1, 1]} // Используем реальный размер из Blender
                position={[0, heightOffset, 0]}
                rotation={[0, 0, 0]}
            />
            {/* Now correctly defined, this ensures text always faces the viewer */}
            <Billboard position={[-0.2, heightOffset+1.3 , -0.2]}>
                <Text
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    outlineWidth={0.05}
                    outlineColor="black"
                >
                    {name}
                </Text>
            </Billboard>
        </group>
    );
};

useGLTF.preload('/models/attack-pose.glb');
