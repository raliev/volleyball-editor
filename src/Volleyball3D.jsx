import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, QuadraticBezierLine, Box, Capsule, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURABLE PARAMETERS (METERS) ---
const COURT_WIDTH = 9;
const COURT_LENGTH = 18;
const ATTACK_LINE_DIST = 3;
const NET_HEIGHT = 2.10; // Female net height as requested
const NET_WIDTH = 9.5;    // Slightly wider than court
const PLAYER_HEIGHT = 1.8;
const BALL_LINE_WIDTH = 4;
const ENV_BG_COLOR = "#222";
const NET_MESH_SIZE = 0.15; // Размер ячейки сетки
/**
 * Logic to prevent ball from hitting the net.
 * Calculates the required peak height to clear the net.
 */
const calculateBallTrajectory = (start, end, rad, isPlayerMove) => {
    if (isPlayerMove) {
        return { startY: 0.15, endY: 0.15, midY: 0.15 };
    }

    const startY = 2.3; // Height of hands/contact point
    let endY = 0.3;     // Floor level for attacks

    // If it's a "Set" (curved and to another player/point), keep it high
    if (Math.abs(rad) > 0.5) {
        endY = 2.3;
    }

    // Check if the path crosses the net (X=0)
    const crossesNet = (start.x > 0 && end.x < 0) || (start.x < 0 && end.x > 0);

    let midY;
    if (crossesNet) {
        // Force the ball to go over the net height + clearance
        const clearance = 0.3;
        const peakHeight = Math.max(NET_HEIGHT + clearance, startY + Math.abs(rad) * 4);
        midY = peakHeight;
    } else {
        midY = Math.max(startY, endY) + Math.abs(rad) * 3;
    }

    return { startY, endY, midY };
};

const VolleyballPlayer = ({
                              position,
                              name,
                              color = "#3b82f6",
                              rotationY = 0
                          }) => {
    const skin = "#ffdbac";
    const shoe = "#1f2937";
    const kneePad = "#111827";
    const hair = "#2b1b12";

    // Scale factor: Original model was ~2.75 units tall.
    // We scale by ~0.65 to reach exactly 1.8m.
    const s = 0.654;

    return (
        <group position={[position.x, 0, position.z]} rotation={[0, rotationY, 0]} scale={[s, s, s]}>

            {/* === LEGS === */}
            <group>
                {/* Left Leg */}
                <group position={[-0.2, 0.9, 0]} rotation={[0.15, 0, 0]}>
                    <Capsule args={[0.085, 0.55, 6, 12]}>
                        <meshStandardMaterial color={skin} />
                    </Capsule>
                    <mesh position={[0, -0.32, 0]}>
                        <cylinderGeometry args={[0.095, 0.095, 0.08, 16]} />
                        <meshStandardMaterial color={kneePad} />
                    </mesh>
                    <group position={[0, -0.55, 0]} rotation={[-0.25, 0, 0]}>
                        <Capsule args={[0.075, 0.5, 6, 12]}>
                            <meshStandardMaterial color={skin} />
                        </Capsule>
                        <mesh position={[0, -0.38, 0.12]}>
                            <boxGeometry args={[0.12, 0.06, 0.28]} />
                            <meshStandardMaterial color={shoe} />
                        </mesh>
                    </group>
                </group>

                {/* Right Leg */}
                <group position={[0.2, 0.9, 0]} rotation={[0.15, 0, 0]}>
                    <Capsule args={[0.085, 0.55, 6, 12]}>
                        <meshStandardMaterial color={skin} />
                    </Capsule>
                    <mesh position={[0, -0.32, 0]}>
                        <cylinderGeometry args={[0.095, 0.095, 0.08, 16]} />
                        <meshStandardMaterial color={kneePad} />
                    </mesh>
                    <group position={[0, -0.55, 0]} rotation={[-0.25, 0, 0]}>
                        <Capsule args={[0.075, 0.5, 6, 12]}>
                            <meshStandardMaterial color={skin} />
                        </Capsule>
                        <mesh position={[0, -0.38, 0.12]}>
                            <boxGeometry args={[0.12, 0.06, 0.28]} />
                            <meshStandardMaterial color={shoe} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* === PELVIS & SHORTS === */}
            <group position={[0, 1.45, 0]}>
                <mesh>
                    <capsuleGeometry args={[0.22, 0.25, 8, 16]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* === TORSO / JERSEY === */}
            <group position={[0, 1.8, -0.03]} rotation={[0.12, 0, 0]}>
                <Capsule args={[0.24, 0.6, 8, 16]}>
                    <meshStandardMaterial color={color} />
                </Capsule>
            </group>

            {/* === SHOULDERS & ARMS === */}
            <group position={[0, 2.05, 0]}>
                <group position={[-0.38, 0, 0]} rotation={[-0.5, 0, 0.25]}>
                    <Capsule args={[0.065, 0.4, 6, 12]}>
                        <meshStandardMaterial color={skin} />
                    </Capsule>
                    <group position={[0, -0.42, 0.1]} rotation={[-0.9, 0, 0]}>
                        <Capsule args={[0.055, 0.38, 6, 12]}>
                            <meshStandardMaterial color={skin} />
                        </Capsule>
                        <Sphere args={[0.07, 16, 16]} position={[0, -0.32, 0.05]}>
                            <meshStandardMaterial color={skin} />
                        </Sphere>
                    </group>
                </group>
                <group position={[0.38, 0, 0]} rotation={[-0.5, 0, -0.25]}>
                    <Capsule args={[0.065, 0.4, 6, 12]}>
                        <meshStandardMaterial color={skin} />
                    </Capsule>
                    <group position={[0, -0.42, 0.1]} rotation={[-0.9, 0, 0]}>
                        <Capsule args={[0.055, 0.38, 6, 12]}>
                            <meshStandardMaterial color={skin} />
                        </Capsule>
                        <Sphere args={[0.07, 16, 16]} position={[0, -0.32, 0.05]}>
                            <meshStandardMaterial color={skin} />
                        </Sphere>
                    </group>
                </group>
            </group>

            {/* === HEAD & HAIR === */}
            <Capsule args={[0.06, 0.12, 6, 12]} position={[0, 2.28, 0]}>
                <meshStandardMaterial color={skin} />
            </Capsule>
            <Sphere args={[0.17, 24, 24]} position={[0, 2.5, 0.03]}>
                <meshStandardMaterial color={skin} />
            </Sphere>
            <group position={[0, 2.58, -0.1]}>
                <Sphere args={[0.18, 24, 24]}><meshStandardMaterial color={hair} /></Sphere>
                <Capsule args={[0.07, 0.45, 6, 12]} position={[0, -0.35, -0.25]} rotation={[0.6, 0, 0]}>
                    <meshStandardMaterial color={hair} />
                </Capsule>
            </group>

            {/* === NAME LABEL === */}
            <Text
                position={[0, 3.2, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                outlineWidth={0.04}
                outlineColor="black"
            >
                {name}
            </Text>
        </group>
    );
};
const Arrow3D = ({ start, end, rad, color = "black", style = "-", isPlayerMove = false }) => {
    const { startY, endY, midY } = useMemo(() =>
            calculateBallTrajectory(start, end, rad, isPlayerMove),
        [start, end, rad, isPlayerMove]);

    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;

    const isDashed = style === '--';
    const isDotted = style === ':';

    return (
        <group>
            <QuadraticBezierLine
                start={[start.x, startY, start.z]}
                end={[end.x, endY, end.z]}
                mid={[midX, midY, midZ]}
                color={color}
                lineWidth={isPlayerMove ? 2 : BALL_LINE_WIDTH}
                dashed={isDashed || isDotted}
                dashSize={isDashed ? 0.5 : 0.1}
                gapSize={isDashed ? 0.3 : 0.1}
            />
            <group position={[end.x, endY, end.z]} rotation={[0, Math.atan2(start.x - end.x, start.z - end.z), 0]}>
                <mesh rotation={[!isPlayerMove && endY < 1 ? -0.6 : 0, 0, 0]}>
                    <coneGeometry args={[0.12, 0.3, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        </group>
    );
};

const Net3D = () => {
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

const Court3D = () => {
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

export default function Volleyball3DApp({ initialData }) {
    const elements = useMemo(() => {
        if (!initialData || !initialData.objects) return null;
        const objMap = {};
        initialData.objects.forEach(o => { objMap[o.id] = { ...o, x3d: o.x, z3d: -o.y }; });

        return initialData.objects.map(obj => {
            if (obj.type === 'player') {
                const connected = initialData.objects.filter(o => o.type === 'arrow' && (o.from === obj.id || o.to === obj.id));
                let dx = 0, dz = 0;
                connected.forEach(l => {
                    const other = objMap[l.from === obj.id ? l.to : l.from];
                    if (other) {
                        const dist = Math.sqrt((other.x3d - obj.x)**2 + (other.z3d - (-obj.y))**2);
                        dx += (other.x3d - obj.x)/dist; dz += (other.z3d - (-obj.y))/dist;
                    }
                });
                const rotationY = (dx === 0 && dz === 0) ? (obj.x > 0 ? -Math.PI/2 : Math.PI/2) : Math.atan2(dx, dz);
                return <VolleyballPlayer key={obj.id} position={{x: obj.x, z: -obj.y}} name={obj.name} rotationY={rotationY} />;
            }
            if (obj.type === 'ball') return <mesh key={obj.id} position={[obj.x, 0.25, -obj.y]} castShadow><sphereGeometry args={[0.11, 24, 24]} /><meshStandardMaterial color="#facc15" /></mesh>;
            if (obj.type === 'arrow') {
                const s = objMap[obj.from]; const t = objMap[obj.to];
                if (!s || !t) return null;
                return <Arrow3D key={obj.id} start={{x: s.x3d, z: s.z3d}} end={{x: t.x3d, z: t.z3d}} rad={obj.rad} color={obj.line_color} style={obj.style} isPlayerMove={obj.style === ':'} />;
            }
            return null;
        });
    }, [initialData]);

    return (
        <div style={{ width: '100%', height: '100%', background: ENV_BG_COLOR }}>
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[12, 10, 15]} fov={45} />
                <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.1} />
                <ambientLight intensity={0.6} />
                <pointLight position={[0, 10, 0]} intensity={0.5} />
                <spotLight position={[10, 15, 10]} angle={0.3} intensity={1} castShadow />
                <Court3D />
                {elements}
                <color attach="background" args={[ENV_BG_COLOR]} />
            </Canvas>
        </div>
    );
}