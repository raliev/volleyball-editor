import React from 'react';

export const Ball3D = ({ position }) => {
    return (
        <mesh position={[position.x, 0.25, position.z]} castShadow>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial color="#facc15" />
        </mesh>
    );
};

