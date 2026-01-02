import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import { NET_HEIGHT, NET_WIDTH, COURT_WIDTH, NET_MESH_SIZE } from './constants';

export const Net3D = () => {
    const topOfNet = NET_HEIGHT;
    const bottomOfNet = NET_HEIGHT - 1.0;
    const antennaHeight = 1.8;
    const antennaOverNet = 0.8;

    const meshLines = useMemo(() => {
        const h = []; const v = [];
        for (let y = bottomOfNet; y <= topOfNet; y += NET_MESH_SIZE) h.push(y);
        const halfWidth = NET_WIDTH / 2;
        for (let z = -halfWidth; z <= halfWidth; z += NET_MESH_SIZE) v.push(z);
        return { h, v };
    }, [bottomOfNet, topOfNet]);

    return (
        <group>
            {/* Столбы */}
            <mesh position={[0, 1.25, NET_WIDTH/2]}><cylinderGeometry args={[0.07, 0.07, 2.5, 16]} /><meshStandardMaterial color="#555" /></mesh>
            <mesh position={[0, 1.25, -NET_WIDTH/2]}><cylinderGeometry args={[0.07, 0.07, 2.5, 16]} /><meshStandardMaterial color="#555" /></mesh>

            {/* Ячейки сетки */}
            <group>
                {meshLines.h.map((y, idx) => (
                    <Box key={`h-${idx}`} args={[0.005, 0.005, NET_WIDTH]} position={[0, y, 0]}><meshStandardMaterial color="#ccc" transparent opacity={0.6} /></Box>
                ))}
                {meshLines.v.map((z, idx) => (
                    <Box key={`v-${idx}`} args={[0.005, 1.0, 0.005]} position={[0, (topOfNet + bottomOfNet) / 2, z]}><meshStandardMaterial color="#ccc" transparent opacity={0.6} /></Box>
                ))}
            </group>

            {/* Верхняя и нижняя ленты */}
            <Box args={[0.06, 0.08, NET_WIDTH]} position={[0, topOfNet, 0]}><meshStandardMaterial color="white" /></Box>
            <Box args={[0.04, 0.05, NET_WIDTH]} position={[0, bottomOfNet, 0]}><meshStandardMaterial color="white" /></Box>

            {/* Антенны */}
            {[COURT_WIDTH/2, -COURT_WIDTH/2].map((z, i) => (
                <group key={i} position={[0, NET_HEIGHT + antennaOverNet - antennaHeight/2, z]}>
                    <mesh><cylinderGeometry args={[0.01, 0.01, antennaHeight]} /><meshStandardMaterial color="white" /></mesh>
                    {[0, 0.2, 0.4, 0.6].map(offset => (
                        <mesh key={offset} position={[0, 0.5 + offset/2, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.1]} /><meshStandardMaterial color="red" />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

