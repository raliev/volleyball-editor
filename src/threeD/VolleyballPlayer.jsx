// src/threeD/VolleyballPlayer.jsx
import React, { useMemo, useEffect } from 'react';
import { Text, useGLTF, Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const POSE_MODELS = {
    'attack': '/models/attack-pose.glb',
    'block': '/models/block-pose.glb',
    'serve': '/models/serve-pose.glb',
    'passing': '/models/passing-pose.glb',
    'auto': '/models/passing-pose.glb'
};
// Use a tiny transparent pixel as a fallback instead of the modelPath
const PADDING_TEXTURE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const VolleyballPlayer = ({
                                     position,
                                     name,
                                     texturePath,
                                     rotationY = 0,
                                     pose = "passing"
                                 }) => {
    const modelPath = POSE_MODELS[pose] || POSE_MODELS['passing'];
    const { scene } = useGLTF(modelPath);

    // FIX: Pass the padding texture if no texturePath is provided
    const texture = useTexture(texturePath || PADDING_TEXTURE);

    useEffect(() => {
        if (texture && texturePath) {
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
        }
    }, [texture, texturePath]);

    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // ГЛАВНОЕ ИЗМЕНЕНИЕ:
        // Если пропс texturePath не передан, мы просто возвращаем клон
        // со всеми его родными текстурами и настройками.
        if (!texturePath) return clone;

        // Если же путь передан, проходим по мешам и меняем карту цветов
        clone.traverse((child) => {
            if (child.isMesh) {
                // Клонируем материал, чтобы изменения одного игрока не влияли на других
                child.material = child.material.clone();
                child.material.map = texture;
                child.material.needsUpdate = true;
            }
        });
        return clone;
    }, [scene, texture, texturePath]);

    return (
        <group position={[position.x, 0, position.z]} rotation={[0, rotationY, 0]}>
            <primitive
                object={clonedScene}
                scale={[1, 1, 1]}
                position={[0, 0, 0]}
            />
            <Billboard position={[-0.2, 1.3 , -0.2]}>
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

useGLTF.preload('/models/passing-pose.glb');