import React from 'react';
import { Box } from '@react-three/drei';
import { COURT_LENGTH, COURT_WIDTH, ATTACK_LINE_DIST } from './constants';
import { Net3D } from './Net3D';

export const Court3D = () => {
    const boundaryColor = "white";
    const lineWidth = 0.05;

    return (
        <group>
            {/* Out of bounds area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[24, 15]} /><meshStandardMaterial color="#333" /></mesh>
            {/* Main Court */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[COURT_LENGTH, COURT_WIDTH]} /><meshStandardMaterial color="#d6824a" /></mesh>

            {/* Lines */}
            <Box args={[lineWidth, 0.01, COURT_WIDTH]} position={[0, 0.005, 0]}><meshStandardMaterial color={boundaryColor} /></Box> {/* Center */}
            <Box args={[lineWidth, 0.01, COURT_WIDTH]} position={[-ATTACK_LINE_DIST, 0.005, 0]}><meshStandardMaterial color={boundaryColor} /></Box>
            <Box args={[lineWidth, 0.01, COURT_WIDTH]} position={[ATTACK_LINE_DIST, 0.005, 0]}><meshStandardMaterial color={boundaryColor} /></Box>
            <Box args={[COURT_LENGTH, 0.01, lineWidth]} position={[0, 0.005, COURT_WIDTH/2]}><meshStandardMaterial color={boundaryColor} /></Box>
            <Box args={[COURT_LENGTH, 0.01, lineWidth]} position={[0, 0.005, -COURT_WIDTH/2]}><meshStandardMaterial color={boundaryColor} /></Box>
            <Box args={[lineWidth, 0.01, COURT_WIDTH]} position={[-COURT_LENGTH/2, 0.005, 0]}><meshStandardMaterial color={boundaryColor} /></Box>
            <Box args={[lineWidth, 0.01, COURT_WIDTH]} position={[COURT_LENGTH/2, 0.005, 0]}><meshStandardMaterial color={boundaryColor} /></Box>

            <Net3D />
        </group>
    );
};

