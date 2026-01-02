import {
    NET_HEIGHT,
    HANDS_HEIGHT,
    JUMP_HANDS_HEIGHT,
    NET_CLEARANCE
} from './constants';

export const calculateBallTrajectory = (start, end, rad, isPlayerMove, hitType, startColor, endColor) => {
    // Player movement is a flat line on the floor
    if (isPlayerMove) return { startY: 0.15, endY: 0.15, midY: 0.15 };

    let effectiveHit = hitType;
    if (hitType === 'auto') {
        // Simple logic: if passing to teammate (same color), it's defensive/high.
        // If passing to opponent side, it's offensive/flatter.
        effectiveHit = (startColor === endColor) ? 'defensive' : 'offensive';
    }

    // Determine start and end heights based on the type of hit
    // Offensive (Spikes/Jump Serves) start high. Defensive/Tactical start at standing reach.
    let startY = (effectiveHit === 'offensive') ? JUMP_HANDS_HEIGHT : HANDS_HEIGHT;
    let endY = (effectiveHit === 'defensive') ? HANDS_HEIGHT : 0.15;

    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // --- NEW: Arc Height Calculation ---
    // We define how much "extra height" the ball gains based on distance.
    // Offensive hits (power) have a flatter arc (factor 0.1).
    // Defensive/Tactical hits (lob/serve) have a higher arc (factor 0.2 - 0.3).
    const arcFactor = (effectiveHit === 'offensive') ? 0.12 : 0.25;
    const naturalArcHeight = distance * arcFactor;

    let midY = 0;
    const crossesNet = (start.x > 0 && end.x < 0) || (start.x < 0 && end.x > 0);

    if (crossesNet) {
        // Calculate 't' (0 to 1) where the ball crosses the net (x=0)
        const t = Math.abs(start.x) / (Math.abs(start.x) + Math.abs(end.x));
        const minHeightAtNet = NET_HEIGHT + NET_CLEARANCE;

        // Solve for P1 (midY) in the Bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
        // This ensures the ball is high enough to clear the net.
        const p1NeededForNet = (minHeightAtNet - Math.pow(1 - t, 2) * startY - Math.pow(t, 2) * endY) / (2 * (1 - t) * t);

        // midY is the maximum of:
        // 1. Height needed to clear the net.
        // 2. A "natural" height based on distance to ensure an upward launch angle.
        midY = Math.max(p1NeededForNet, startY + naturalArcHeight, endY + naturalArcHeight);
    } else {
        // If it doesn't cross the net (same side pass), use distance and a small offset.
        midY = Math.max(startY, endY) + naturalArcHeight + 0.5;
    }

    // Add manual curvature from the 2D editor 'rad' property
    midY += Math.abs(rad) * 4;

    return { startY, endY, midY };
};