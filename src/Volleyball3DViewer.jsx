import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Line, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

const SCALE_3D = 1; // 1 unit in 3D = 1 meter

const Player3D = ({ position, name, color = "#3b82f6" }) => (
  <group position={[position.x, 0.9, position.z]}>
    {/* Simplified Player Body */}
    <mesh castShadow>
      <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <Text
      position={[0, 1.2, 0]}
      fontSize={0.4}
      color="black"
      anchorX="center"
      anchorY="middle"
    >
      {name}
    </Text>
  </group>
);

const Ball3D = ({ position }) => (
  <mesh position={[position.x, 0.25, position.z]} castShadow>
    <sphereGeometry args={[0.2, 16, 16]} />
    <meshStandardMaterial color="#facc15" />
  </mesh>
);

const Arrow3D = ({ start, end, rad, color = "black" }) => {
  // Calculate a midpoint with height for a 3D arc
  const midX = (start.x + end.x) / 2;
  const midZ = (start.z + end.z) / 2;
  const midY = 1.5 + Math.abs(rad) * 2; // Arcs go upward in 3D

  return (
    <QuadraticBezierLine
      start={[start.x, 0.5, start.z]}
      end={[end.x, 0.5, end.z]}
      mid={[midX, midY, midZ]}
      color={color}
      lineWidth={2}
    />
  );
};

const Court3D = () => (
  <group>
    {/* Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[18, 9]} />
      <meshStandardMaterial color="#ffedcc" side={THREE.DoubleSide} />
    </mesh>
    {/* Net */}
    <mesh position={[0, 1.2, 0]}>
      <planeGeometry args={[0.1, 9.5]} rotation={[0, Math.PI / 2, 0]} />
      <meshStandardMaterial color="white" opacity={0.5} transparent />
    </mesh>
    <gridHelper args={[20, 20]} position={[0, 0.01, 0]} />
  </group>
);

const Volleyball3DViewer = () => {
  const [drillData, setDrillData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
      setDrillData(JSON.parse(f.target.result));
    };
    reader.readAsText(file);
  };

  const sceneObjects = useMemo(() => {
    if (!drillData) return [];
    
    // Map IDs for arrow lookups
    const objMap = {};
    drillData.objects.forEach(obj => {
      objMap[obj.id] = { x: obj.x, z: -obj.y }; // Flip Y to Z for 3D ground plane
    });

    return drillData.objects.map((obj) => {
      if (obj.type === 'player') {
        return <Player3D key={obj.id} position={objMap[obj.id]} name={obj.name} />;
      }
      if (obj.type === 'ball') {
        return <Ball3D key={obj.id} position={objMap[obj.id]} />;
      }
      if (obj.type === 'arrow') {
        const start = objMap[obj.from];
        const end = objMap[obj.to];
        if (!start || !end) return null;
        return <Arrow3D key={obj.id} start={start} end={end} rad={obj.rad} color={obj.line_color} />;
      }
      return null;
    });
  }, [drillData]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div className="p-4 bg-white flex justify-between items-center">
        <h1 className="font-bold text-lg">3D Drill Viewer</h1>
        <input type="file" accept=".json" onChange={handleFileUpload} className="text-sm" />
      </div>

      <div className="flex-1">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={50} />
          <OrbitControls makeDefault />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} castShadow />

          <Court3D />
          {sceneObjects}
          
          <color attach="background" args={['#202020']} />
        </Canvas>
      </div>
    </div>
  );
};

export default Volleyball3DViewer;
