import { fabric } from 'fabric';
import { CUSTOM_PROPS, SCALE, COURT_CENTER_X, COURT_CENTER_Y } from './constants';
import { getUUID, downloadFile, pythonBoolean } from './utils';
import { updateArrow, renderAllStatic, createObjectByRole, calculateArrowData } from './canvasUtils';
import { exportToPng } from './pngExporter';
import { exportToSvg } from './svgExporter';

export { exportToPng, exportToSvg };

export const exportJson = (fabricCanvas) => {
  const fileName = prompt("Filename:", "drill") || "drill";
  const data = fabricCanvas.toJSON(CUSTOM_PROPS);
  downloadFile(JSON.stringify(data), `${fileName}.json`);
};

export const importJson = (e, fabricCanvas, snapEnabled, gridFrequency, onComplete) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (f) => {
    fabricCanvas.clear();
    fabricCanvas.loadFromJSON(JSON.parse(f.target.result), () => {
      fabricCanvas.getObjects()
        .filter(a => a.role === 'arrow')
        .forEach(a => updateArrow(a, fabricCanvas));
      renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
      fabricCanvas.renderAll();
      if (onComplete) onComplete();
    });
  };
  reader.readAsText(file);
  e.target.value = '';
};

export const exportObjJson = (fabricCanvas) => {
  const fileName = prompt("Filename:", "high_level_drill") || "high_level_drill";
  const objs = fabricCanvas.getObjects();
  const data = {
    title: fabricCanvas.drillTitle || "",
    description: fabricCanvas.drillDesc || "",
    objects: objs
        .filter(o => !o.isStatic && !o.isMetadata)
        .map(o => {
          // Added 'ball' to the recognized roles
          if (['player', 'target', 'cone', 'point', 'text', 'ball'].includes(o.role)) {
            const p = o.getCenterPoint();
            return {
              type: o.role,
              id: o.id,
              name: o.role === 'text' ? (o.text || "") : (o.customName || ""),
              x: parseFloat(((p.x - COURT_CENTER_X) / SCALE).toFixed(2)),
              y: parseFloat((-((p.y - COURT_CENTER_Y) / SCALE)).toFixed(2))
            };
          } else if (o.role === 'arrow') {
            return {
              type: 'arrow',
              id: o.id,
              from: o.fromId,
              to: o.toId,
              curved: o.rad !== 0,
              rad: o.rad,
              lineType: o.lineType || 'normal', // Ensure wavy/lightning is saved
              no: o.label || null,
              line_color: o.stroke,
              color: o.labelBgColor,
              style: !o.strokeDashArray ? '-' : (o.strokeDashArray[0] === 10 ? '--' : ':')
            };
          }
          return null;
        })
        .filter(Boolean) // This removes any null entries from the final JSON
  };

  downloadFile(JSON.stringify(data, null, 2), `${fileName}.obj.json`);
};

export const importObjJson = (e, fabricCanvas, snapEnabled, gridFrequency, onComplete) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (f) => {
    try {
      const data = JSON.parse(f.target.result);
      const objects = data.objects || []; // Safely access the array

      fabricCanvas.clear();
      renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);

      // Import non-arrow objects with null-safety
      objects
          .filter(d => d && d.type !== 'arrow')
          .forEach(d => {
            const cx = d.x * SCALE + COURT_CENTER_X;
            const cy = COURT_CENTER_Y - (d.y * SCALE);
            const objId = d.id || getUUID();
            const base = { left: cx, top: cy, id: objId, role: d.type };

            const obj = createObjectByRole(fabric, d.type, base, d.name || "");
            if (obj) fabricCanvas.add(obj);
          });

      // Import arrows with null-safety
      objects
          .filter(d => d && d.type === 'arrow')
          .forEach(d => {
            const o1 = fabricCanvas.getObjects().find(o => o.id === d.from);
            const o2 = fabricCanvas.getObjects().find(o => o.id === d.to);
            if (!o1 || !o2) return;

            // Pass the saved lineType (wavy, lightning, normal)
            const { pathStr } = calculateArrowData(o1, o2, d.rad || 0, d.lineType || 'normal');

            let dashArray = null;
            if (d.style === '--') dashArray = [10, 5];
            if (d.style === ':') dashArray = [2, 4];

            const arrow = new fabric.Path(pathStr, {
              stroke: d.line_color || '#000000',
              strokeWidth: 3,
              fill: '',
              selectable: true,
              strokeDashArray: dashArray,
              hasControls: false,
              lockMovementX: true,
              lockMovementY: true,
              id: d.id || getUUID(),
              role: 'arrow',
              lineType: d.lineType || 'normal', // Restore lineType property
              fromId: d.from,
              toId: d.to,
              rad: d.rad || 0,
              label: d.no || '',
              labelBgColor: d.color || '#ffffff'
            });
            fabricCanvas.add(arrow);
            updateArrow(arrow, fabricCanvas);
          });

      fabricCanvas.renderAll();
      // Pass the whole data object to onComplete so App.jsx can update React states
      if (onComplete) onComplete(data);
    } catch (err) {
      console.error("Failed to import ObjJSON", err);
      renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
};

export const exportToPython = (fabricCanvas) => {
  const mapping = {};
  const objs = fabricCanvas.getObjects();
  let code = "from court_framework import VolleyballCourt\n\ndef draw_custom_drill():\n    court = VolleyballCourt(\"Exported Drill\")\n\n";
  
  objs.forEach(o => {
    if (['player', 'target', 'cone', 'point', 'text'].includes(o.role)) {
      const p = o.getCenterPoint();
      const x = ((p.x - COURT_CENTER_X) / SCALE).toFixed(2);
      const y = (-((p.y - COURT_CENTER_Y) / SCALE)).toFixed(2);
      const varName = `${o.role}_${o.id.replace(/\W/g, '')}`;
      
      if (o.role === 'player') {
        code += `    ${varName} = court.add_player("${o.customName}", ${x}, ${y})\n`;
      } else if (o.role === 'target') {
        code += `    ${varName} = court.add_target("T", ${x}, ${y})\n`;
      } else if (o.role === 'cone') {
        code += `    ${varName} = court.add_cone("C", ${x}, ${y})\n`;
      } else if (o.role === 'point') {
        code += `    ${varName} = court.add_point("C", ${x}, ${y})\n`;
      } else if (o.role === 'text') {
        code += `    ${varName} = court.add_text("${o.text}", ${x}, ${y})\n`;
      }
      mapping[o.id] = varName;
    }
  });
  
  code += "\n";
  objs
    .filter(o => o.role === 'arrow')
      .forEach(a => {
        const pyStyle = !a.strokeDashArray ? "'-'" : (a.strokeDashArray[0] === 10 ? "'--'" : "':'");
        // You can add a comment or logic for lineType here if your python framework supports it
        code += `    court.add_arrow(${mapping[a.fromId]}, ${mapping[a.toId]}, curved=${pythonBoolean(a.rad !== 0)}, rad=${a.rad}, no=${a.label ? `"${a.label}"` : "None"}, line_color="${a.stroke}", color="${a.labelBgColor}", style=${pyStyle})\n`;
      });


  
  code += "\n    court.save(\"drill.png\")";
  return code;
};

