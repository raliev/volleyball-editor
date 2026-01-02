import { fabric } from 'fabric';
import { SCALE, COURT_CENTER_X, COURT_CENTER_Y, OBJ_OFFSET, COURT_ZONES } from './constants';

// Фикс baseline для Fabric 5.x
if (typeof fabric !== 'undefined') {
  fabric.Object.prototype.textBaseline = 'middle';
  if (fabric.IText) fabric.IText.prototype.textBaseline = 'middle';
  if (fabric.Text) fabric.Text.prototype.textBaseline = 'middle';
}

export const calculateArrowData = (from, to, rad = 0, lineType = 'normal') => {
  let p1 = from.getCenterPoint();
  let p2 = to.getCenterPoint();
  const dx_f = p2.x - p1.x;
  const dy_f = p2.y - p1.y;
  const dist = Math.sqrt(dx_f * dx_f + dy_f * dy_f);

  if (dist > OBJ_OFFSET * 2) {
    const r = OBJ_OFFSET / dist;
    p1 = { x: p1.x + dx_f * r, y: p1.y + dy_f * r };
    p2 = { x: p2.x - dx_f * r, y: p2.y - dy_f * r };
  }

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const cpx = midX - dy * rad;
  const cpy = midY + dx * rad;

  let pathStr = `M ${p1.x} ${p1.y}`;

  if (lineType === 'wavy') {
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cpx + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cpy + t * t * p2.y;
      const wave = Math.sin(t * Math.PI * 8) * 4;
      // Approximate normal for offset
      const angle = Math.atan2(p2.y - cpy, p2.x - cpx);
      pathStr += ` L ${x + Math.cos(angle + Math.PI / 2) * wave} ${y + Math.sin(angle + Math.PI / 2) * wave}`;
    }
  } else if (lineType === 'lightning') {
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cpx + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cpy + t * t * p2.y;
      const offset = (i % 2 === 0 ? 8 : -8);
      const angle = Math.atan2(p2.y - cpy, p2.x - cpx);
      pathStr += ` L ${x + Math.cos(angle + Math.PI / 2) * offset} ${y + Math.sin(angle + Math.PI / 2) * offset}`;
    }
    pathStr += ` L ${p2.x} ${p2.y}`;
  } else {
    pathStr += ` Q ${cpx} ${cpy} ${p2.x} ${p2.y}`;
  }

  const angleHead = Math.atan2(p2.y - cpy, p2.x - cpx);
  const headLen = 16;
  pathStr += ` L ${p2.x - headLen * Math.cos(angleHead - Math.PI / 6)} ${p2.y - headLen * Math.sin(angleHead - Math.PI / 6)} M ${p2.x} ${p2.y} L ${p2.x - headLen * Math.cos(angleHead + Math.PI / 6)} ${p2.y - headLen * Math.sin(angleHead + Math.PI / 6)}`;

  return { pathStr, cpx, cpy };
};

export const updateArrow = (arrowObj, canvas) => {
  if (!arrowObj.fromId || !arrowObj.toId) return;

  const from = canvas.getObjects().find(o => o.id === arrowObj.fromId);
  const to = canvas.getObjects().find(o => o.id === arrowObj.toId);

  if (!from || !to) return;

  const { pathStr, cpx, cpy } = calculateArrowData(from, to, arrowObj.rad || 0, arrowObj.lineType || 'normal');
  const newPath = fabric.util.parsePath(pathStr);

  // Set perPixelTargetFind to true so only the line itself is clickable.
  // We also add targetFindTolerance to make thin lines slightly easier to catch.
  arrowObj.set({
    path: newPath,
    perPixelTargetFind: true,
    targetFindTolerance: 4
  });

  const dims = arrowObj._calcDimensions();
  arrowObj.set({
    width: dims.width,
    height: dims.height,
    left: dims.left,
    top: dims.top,
    pathOffset: { x: dims.left + dims.width / 2, y: dims.top + dims.height / 2 }
  });
  arrowObj.setCoords();
  updateArrowLabel(arrowObj, cpx, cpy, canvas);
};

export const updateArrowLabel = (arrowObj, x, y, canvas) => {
  if (!arrowObj.id) return;

  let group = canvas.getObjects().find(o => o.parentId === arrowObj.id);

  if (!arrowObj.label) {
    if (group) canvas.remove(group);
    return;
  }

  if (!group) {
    group = new fabric.Group([
      new fabric.Circle({
        radius: 11,
        fill: arrowObj.labelBgColor,
        stroke: 'black',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center'
      }),
      new fabric.Text(String(arrowObj.label), {
        fontSize: 11,
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold'
      })
    ], {
      parentId: arrowObj.id,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
      excludeFromExport: true
    });
    canvas.add(group);
  }

  if (group && group.item) {
    group.set({ left: x, top: y });
    if (group.item(1)) group.item(1).set('text', String(arrowObj.label));
    if (group.item(0)) group.item(0).set('fill', arrowObj.labelBgColor);
    group.bringToFront();
  }
};

export const drawCourtBackground = (canvas, yOffset = 0) => {
  const zoneTextStyle = {
    fontSize: 45,
    fill: 'rgba(0,0,0,0.05)',
    fontWeight: 'bold',
    selectable: false,
    evented: false,
    isStatic: true,
    originX: 'center',
    originY: 'center',
    excludeFromExport: true
  };
  const centerY = 250 + yOffset;
  const floor = new fabric.Rect({
    left: 400,
    top: centerY,
    width: 18 * SCALE,
    height: 9 * SCALE,
    fill: '#ffedcc',
    stroke: 'black',
    strokeWidth: 3,
    selectable: false,
    evented: false,
    originX: 'center',
    originY: 'center',
    name: 'floor',
    isStatic: true
  });
  canvas.add(floor);

  COURT_ZONES.forEach(z => {
    canvas.add(new fabric.Text(z.n, { ...zoneTextStyle, left: z.x, top: z.y + yOffset }));
  });

  const lineStyle = {
    stroke: 'black',
    strokeWidth: 2,
    selectable: false,
    evented: false,
    isStatic: true,
    opacity: 0.3
  };

  // 3m lines and center line shifted by yOffset
  canvas.add(new fabric.Line([400 - 3 * SCALE, 70 + yOffset, 400 - 3 * SCALE, 430 + yOffset], lineStyle));
  canvas.add(new fabric.Line([400 + 3 * SCALE, 70 + yOffset, 400 + 3 * SCALE, 430 + yOffset], lineStyle));
  canvas.add(new fabric.Line([400, 70 + yOffset, 400, 430 + yOffset], { ...lineStyle, opacity: 0.5, strokeWidth: 1 }));

  const netStyle = {
    stroke: 'black',
    strokeWidth: 2,
    selectable: false,
    evented: false,
    isStatic: true
  };
  // Net lines shifted by yOffset
  canvas.add(new fabric.Line([397, 60 + yOffset, 397, 440 + yOffset], netStyle));
  canvas.add(new fabric.Line([403, 60 + yOffset, 403, 440 + yOffset], netStyle));
}

export const drawGridPoints = (canvas, gridFrequency) => {
  const step = (SCALE / 2) / gridFrequency;
  const width = canvas.width || 800;
  const height = canvas.height || 500;
  // Use canvas dimensions instead of hardcoded values
  for (let x = 10; x <= width - 10; x += step) {
    for (let y = 10; y <= height - 10; y += step) {
      canvas.add(new fabric.Circle({
        left: x,
        top: y,
        radius: 1,
        fill: '#000',
        opacity: 0.1,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        isStatic: true,
        excludeFromExport: true
      }));
    }
  }
};

export const renderAllStatic = (canvas, snapEnabled, gridFrequency, yOffset = 0) => {
  const objects = canvas.getObjects().filter(o => o.isStatic);
  objects.forEach(o => canvas.remove(o));

  drawCourtBackground(canvas, yOffset); // Pass the offset here

  if (snapEnabled) drawGridPoints(canvas, gridFrequency);

  const floor = canvas.getObjects().find(o => o.name === 'floor');
  if (floor) canvas.sendToBack(floor);

  canvas.renderAll();
};

export const createPlayerObject = (fabric, id, name, x, y, bgColor = 'white') => {
  return new fabric.Group([
    new fabric.Circle({
      radius: 18,
      fill: bgColor,
      stroke: 'black',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center'
    }),
    new fabric.Text(name, {
      fontSize: 14,
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold'
    })
  ], {
    left: x,
    top: y,
    id,
    role: 'player',
    customName: name,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    originX: 'center',
    originY: 'center'
  });
};

export const createObjectByRole = (fabric, role, baseProps, name = '') => {
  const base = {
    ...baseProps,
    role,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    originX: 'center',
    originY: 'center'
  };

  if (role === 'player') {
    const player = new fabric.Group([
      new fabric.Circle({
        radius: 18,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      }),
      new fabric.Text(name || "P", {
        fontSize: 14,
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold'
      })
    ], { ...base, customName: name || "P" });
    if (baseProps.pose) player.pose = baseProps.pose;
    return player;
  } else if (role === 'ball') {
  return new fabric.Group([
    new fabric.Circle({
      radius: 10,
      fill: '#facc15', // Volleyball yellow
      stroke: '#1e3a8a', // Dark blue border
      strokeWidth: 2,
      originX: 'center',
      originY: 'center'
    }),
    new fabric.Line([-6, -6, 6, 6], { stroke: '#1e3a8a', strokeWidth: 1 }),
    new fabric.Line([6, -6, -6, 6], { stroke: '#1e3a8a', strokeWidth: 1 })
  ], { ...base });
} else if (role === 'target') {
    return new fabric.Text('X', {
      ...base,
      fontSize: 36,
      fill: 'green',
      fontWeight: 'bold'
    });
  } else if (role === 'point') {
    return new fabric.Circle({
      ...base,
      radius: 6,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1
    });
  } else if (role === 'cone') {
    return new fabric.Triangle({
      ...base,
      width: 30,
      height: 30,
      fill: 'orange',
      stroke: 'black',
      strokeWidth: 2
    });
  } else if (role === 'text') {
    return new fabric.IText(name || "Text", {
      ...base,
      hasControls: true,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      fontSize: 24
    });
  }
  return null;
};