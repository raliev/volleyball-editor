import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { VolleyballPlayer } from './threeD/VolleyballPlayer.jsx';
import { Arrow3D } from './threeD/Arrow3D';
import { Ball3D } from './threeD/Ball3D';
import { Court3D } from './threeD/Court3D';
import { ENV_BG_COLOR } from './threeD/constants';

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
                let playerTexture = "/models/texture-basic.png";

                return (
                    <VolleyballPlayer
                        key={obj.id}
                        pose={obj.pose}
                        position={{x: obj.x, z: -obj.y}}
                        name={obj.name}
                        rotationY={rotationY}
                        //texturePath={playerTexture} // Pass the specific texture here
                    />
                );
            }
            if (obj.type === 'ball') return <Ball3D key={obj.id} position={{x: obj.x, z: -obj.y}} />;
            if (obj.type === 'arrow') {
                const s = objMap[obj.from];
                const t = objMap[obj.to];
                if (!s || !t) return null;

                return (
                    <Arrow3D
                        key={obj.id}
                        start={{x: s.x3d, z: s.z3d}}
                        end={{x: t.x3d, z: t.z3d}}
                        rad={obj.rad}
                        color={obj.line_color}
                        style={obj.style}
                        isPlayerMove={obj.arrowType === 'player' || obj.style === '-'}
                        hitType={obj.hitType || 'auto'}
                        startColor={s.color}
                        endColor={t.color}
                        // ADD THESE TWO LINES:
                        label={obj.label}
                        labelBgColor={obj.labelBgColor}
                    />
                );
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
