// src/threeD/Arrow3D.jsx
import React, { useMemo } from 'react';
import { QuadraticBezierLine, Billboard, Text } from '@react-three/drei';
import { calculateBallTrajectory } from './trajectory';
import { BALL_LINE_WIDTH } from './constants';

export const Arrow3D = ({
                            start,
                            end,
                            rad,
                            color = "black",
                            style = "-",
                            isPlayerMove = false,
                            hitType,
                            startColor,
                            endColor,
                            label,
                            labelBgColor = "white"
                        }) => {
    const { startY, endY, midY } = useMemo(() =>
            calculateBallTrajectory(start, end, rad, isPlayerMove, hitType, startColor, endColor),
        [start, end, rad, isPlayerMove, hitType, startColor, endColor]);

    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;

    // Calculate the actual peak height of the curve to place the label exactly on the line
    const curvePeakY = (startY + 2 * midY + endY) / 4;

    const isDashed = style === '--';
    const isDotted = style === ':' || !isPlayerMove;

    return (
        <group>
            <QuadraticBezierLine
                start={[start.x, startY, start.z]}
                end={[end.x, endY, end.z]}
                mid={[midX, midY, midZ]}
                color={color}
                lineWidth={isPlayerMove ? 2 : BALL_LINE_WIDTH}
                dashed={isDashed || isDotted}
                dashScale={1}
                dashSize={isDashed ? 0.5 : 0.15}
                gapSize={isDashed ? 0.3 : 0.15}
            />

            // src/threeD/Arrow3D.jsx - Update the aerial label section
            {label && (
                <group position={[midX, isPlayerMove ? 0.15 : curvePeakY, midZ]}>
                    {isPlayerMove ? (
                        <group position={[0, 0.01, 0]}>
                            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                <circleGeometry args={[0.25, 32]} />
                                <meshStandardMaterial color={labelBgColor} />
                            </mesh>
                            <Billboard>
                                <Text fontSize={0.3} color="black" anchorX="center" anchorY="middle">
                                    {label}
                                </Text>
                            </Billboard>
                        </group>
                    ) : (
                        // Updated Case: Circular Billboard for Ball Path
                        <Billboard>
                            <mesh>
                                {/* Changed from planeGeometry to circleGeometry */}
                                <circleGeometry args={[0.25, 32]} />
                                <meshStandardMaterial color={labelBgColor} transparent opacity={0.9} />
                            </mesh>
                            <Text
                                fontSize={0.35}
                                color="black"
                                anchorX="center"
                                anchorY="middle"
                                position={[0, 0, 0.01]}
                            >
                                {label}
                            </Text>
                        </Billboard>
                    )}
                </group>
            )}

            <group
                position={[end.x, endY, end.z]}
                rotation={[0, Math.atan2(start.x - end.x, start.z - end.z), 0]}
            >
                <mesh rotation={[isPlayerMove ? Math.PI / 2 : (!isPlayerMove && endY < 1 ? -0.6 : 0), 0, 0]}>
                    <coneGeometry args={[0.12, 0.3, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        </group>
    );
};