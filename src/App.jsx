import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

// Фикс baseline для Fabric 5.x
if (typeof fabric !== 'undefined') {
  fabric.Object.prototype.textBaseline = 'middle';
  if (fabric.IText) fabric.IText.prototype.textBaseline = 'middle';
  if (fabric.Text) fabric.Text.prototype.textBaseline = 'middle';
}

const SCALE = 40; // 1 метр = 40 пикселей
const COURT_CENTER_X = 400;
const COURT_CENTER_Y = 250;
const OBJ_OFFSET = 25;

const PRESET_COLORS = [
  { name: 'Черный', value: '#000000' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Белый', value: '#ffffff' }
];

const getUUID = () => Math.random().toString(36).substring(2, 11);

const VolleyballEditor = () => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [selectedObjs, setSelectedObjs] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [exportCode, setExportCode] = useState("");

  // Состояние сетки
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridFrequency, setGridFrequency] = useState(1); // 1x, 2x, 4x

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800, height: 500,
      backgroundColor: '#f8f9fa',
      preserveObjectStacking: true
    });

    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  // Отрисовка фона и сетки при изменении параметров
  useEffect(() => {
    if (!fabricCanvas) return;
    renderAllStatic(fabricCanvas);
  }, [fabricCanvas, snapEnabled, gridFrequency]);

  const renderAllStatic = (canvas) => {
    // Очищаем статику перед перерисовкой
    const objects = canvas.getObjects().filter(o => o.isStatic);
    objects.forEach(o => canvas.remove(o));

    drawCourtBackground(canvas);
    if (snapEnabled) drawGridPoints(canvas);

    canvas.sendToBack(canvas.getObjects().find(o => o.name === 'floor'));
    canvas.renderAll();
  };

  const drawCourtBackground = (canvas) => {
    const floor = new fabric.Rect({
      left: 400, top: 250, width: 18 * SCALE, height: 9 * SCALE,
      fill: '#ffedcc', stroke: 'black', strokeWidth: 3,
      selectable: false, evented: false, originX: 'center', originY: 'center',
      name: 'floor', isStatic: true
    });
    canvas.add(floor);

    const lineStyle = { stroke: 'black', strokeWidth: 2, selectable: false, evented: false, isStatic: true, opacity: 0.3 };

    // Линии атаки (3м от центра)
    canvas.add(new fabric.Line([400 - 3 * SCALE, 250 - 4.5 * SCALE, 400 - 3 * SCALE, 250 + 4.5 * SCALE], lineStyle));
    canvas.add(new fabric.Line([400 + 3 * SCALE, 250 - 4.5 * SCALE, 400 + 3 * SCALE, 250 + 4.5 * SCALE], lineStyle));

    // Центральная линия
    canvas.add(new fabric.Line([400, 250 - 4.5 * SCALE, 400, 250 + 4.5 * SCALE], { ...lineStyle, opacity: 0.5, strokeWidth: 1 }));

    // Сетка (двойная линия)
    const netStyle = { stroke: 'black', strokeWidth: 2, selectable: false, evented: false, isStatic: true };
    canvas.add(new fabric.Line([397, 70, 397, 430], netStyle));
    canvas.add(new fabric.Line([403, 70, 403, 430], netStyle));
  };

  const drawGridPoints = (canvas) => {
    const step = (SCALE / 2) / gridFrequency; // Базовая 0.5м = SCALE/2
    for (let x = 400 - 9 * SCALE; x <= 400 + 9 * SCALE; x += step) {
      for (let y = 250 - 4.5 * SCALE; y <= 250 + 4.5 * SCALE; y += step) {
        const dot = new fabric.Circle({
          left: x, top: y, radius: 1, fill: '#000', opacity: 0.1,
          selectable: false, evented: false, originX: 'center', originY: 'center', isStatic: true
        });
        canvas.add(dot);
      }
    }
  };

  // Логика перемещения с привязкой
  useEffect(() => {
    if (!fabricCanvas) return;

    const onMoving = (options) => {
      if (snapEnabled) {
        const step = (SCALE / 2) / gridFrequency;
        options.target.set({
          left: Math.round(options.target.left / step) * step,
          top: Math.round(options.target.top / step) * step
        });
      }

      const moved = options.target;
      const targets = moved.type === 'activeSelection' ? moved.getObjects() : [moved];
      fabricCanvas.getObjects().filter(o => o.type === 'arrow').forEach(arrow => {
        if (targets.some(t => t.id === arrow.fromId || t.id === arrow.toId)) {
          updateArrow(arrow, fabricCanvas);
        }
      });
    };

    const onSelection = () => setSelectedObjs([...fabricCanvas.getActiveObjects()]);

    fabricCanvas.on('object:moving', onMoving);
    fabricCanvas.on('selection:created', onSelection);
    fabricCanvas.on('selection:updated', onSelection);
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObjs([]);
      setIsConnecting(false);
    });

    return () => {
      fabricCanvas.off('object:moving', onMoving);
    };
  }, [fabricCanvas, snapEnabled, gridFrequency]);

  // --- ЛОГИКА СТРЕЛОК ---
  const updateArrow = (arrowObj, canvas) => {
    const from = canvas.getObjects().find(o => o.id === arrowObj.fromId);
    const to = canvas.getObjects().find(o => o.id === arrowObj.toId);
    if (!from || !to) return;

    let p1 = from.getCenterPoint();
    let p2 = to.getCenterPoint();
    const dx_f = p2.x - p1.x; const dy_f = p2.y - p1.y;
    const dist = Math.sqrt(dx_f*dx_f + dy_f*dy_f);

    if (dist > OBJ_OFFSET * 2) {
      const r = OBJ_OFFSET / dist;
      p1 = { x: p1.x + dx_f * r, y: p1.y + dy_f * r };
      p2 = { x: p2.x - dx_f * r, y: p2.y - dy_f * r };
    }

    const midX = (p1.x + p2.x) / 2; const midY = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x; const dy = p2.y - p1.y;
    const cpx = midX - dy * (arrowObj.rad || 0);
    const cpy = midY + dx * (arrowObj.rad || 0);

    const angle = Math.atan2(p2.y - cpy, p2.x - cpx);
    const headLen = 16;
    const path = `M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y} 
                  L ${p2.x - headLen * Math.cos(angle - Math.PI / 6)} ${p2.y - headLen * Math.sin(angle - Math.PI / 6)} 
                  M ${p2.x} ${p2.y} L ${p2.x - headLen * Math.cos(angle + Math.PI / 6)} ${p2.y - headLen * Math.sin(angle + Math.PI / 6)}`;

    arrowObj.set({ path: fabric.util.parsePath(path) });
    const dims = arrowObj._calcDimensions();
    arrowObj.set({ width: dims.width, height: dims.height, left: dims.left, top: dims.top, pathOffset: { x: dims.width / 2 + dims.left, y: dims.height / 2 + dims.top } });
    arrowObj.setCoords();
    updateArrowLabel(arrowObj, cpx, cpy, canvas);
  };

  const updateArrowLabel = (arrowObj, x, y, canvas) => {
    let group = canvas.getObjects().find(o => o.parentId === arrowObj.id);
    if (!arrowObj.label) { if (group) canvas.remove(group); return; }
    if (!group) {
      group = new fabric.Group([
        new fabric.Circle({ radius: 11, fill: arrowObj.labelBgColor, stroke: 'black', strokeWidth: 1, originX: 'center', originY: 'center' }),
        new fabric.Text(String(arrowObj.label), { fontSize: 11, originX: 'center', originY: 'center', fontWeight: 'bold' })
      ], { parentId: arrowObj.id, selectable: false, evented: false, originX: 'center', originY: 'center' });
      canvas.add(group);
    }
    group.set({ left: x, top: y });
    group.item(1).set('text', String(arrowObj.label));
    group.item(0).set('fill', arrowObj.labelBgColor);
    group.bringToFront();
  };

  const exportToPython = () => {
    const mapping = {};
    const objs = fabricCanvas.getObjects();
    let code = "from court_framework import VolleyballCourt\n\ndef draw_custom_drill():\n    court = VolleyballCourt(\"Exported Drill\")\n\n";

    objs.forEach(o => {
      if (['player', 'target', 'cone'].includes(o.type)) {
        const p = o.getCenterPoint();
        const x = ((p.x - COURT_CENTER_X) / SCALE).toFixed(2);
        const y = (-((p.y - COURT_CENTER_Y) / SCALE)).toFixed(2);
        const varName = `${o.type}_${o.id.replace(/\W/g,'')}`;
        if (o.type === 'player') code += `    ${varName} = court.add_player("${o.customName}", ${x}, ${y})\n`;
        if (o.type === 'target') code += `    ${varName} = court.add_target("T", ${x}, ${y})\n`;
        if (o.type === 'cone')   code += `    ${varName} = court.add_cone("C", ${x}, ${y})\n`;
        mapping[o.id] = varName;
      }
    });

    code += "\n";
    objs.filter(o => o.type === 'arrow').forEach(a => {
      const isCurved = a.rad !== 0;
      const noVal = a.label ? `"${a.label}"` : "None";
      code += `    court.add_arrow(${mapping[a.fromId]}, ${mapping[a.toId]}, curved=${isCurved ? 'True' : 'False'}, rad=${a.rad}, no=${noVal}, line_color="${a.stroke}", color="${a.labelBgColor}", style=${a.strokeDashArray ? "'--'" : "'-'"})\n`;
    });

    code += "\n    court.save(\"drill.png\")";
    setExportCode(code);
  };

  const addObject = (type) => {
    const id = getUUID();
    const base = { left: 400, top: 250, id, hasControls: false, lockScalingX: true, lockScalingY: true, lockRotation: true, originX: 'center', originY: 'center' };
    let obj;
    if (type === 'player') obj = new fabric.Group([new fabric.Circle({ radius: 18, fill: 'white', stroke: 'black', strokeWidth: 2, originX: 'center', originY: 'center' }), new fabric.Text("P", { fontSize: 14, originX: 'center', originY: 'center', fontWeight: 'bold' })], { ...base, type: 'player', customName: "P" });
    else if (type === 'target') obj = new fabric.Text('X', { ...base, fontSize: 36, fill: 'green', fontWeight: 'bold', type: 'target' });
    else if (type === 'cone') obj = new fabric.Triangle({ ...base, width: 30, height: 30, fill: 'orange', stroke: 'black', strokeWidth: 2, type: 'cone' });
    fabricCanvas.add(obj); obj.bringToFront(); fabricCanvas.setActiveObject(obj);
  };

  return (
      <div className="flex flex-col h-screen bg-gray-200 p-4 font-sans overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Инструменты */}
          <div className="w-64 bg-white p-4 rounded shadow-lg flex flex-col gap-3">
            <h2 className="font-bold border-b pb-2 text-gray-700 uppercase text-xs tracking-wider">Объекты</h2>
            <button onClick={() => addObject('player')} className="bg-blue-500 text-white p-2 rounded text-sm hover:bg-blue-600">➕ Игрок</button>
            <button onClick={() => addObject('target')} className="bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700">➕ Мишень</button>
            <button onClick={() => addObject('cone')} className="bg-orange-400 text-white p-2 rounded text-sm hover:bg-orange-500">➕ Конус</button>
            <button onClick={() => {
              const active = fabricCanvas.getActiveObjects();
              if (active.length === 2) {
                const o1 = active[0], o2 = active[1];
                fabricCanvas.discardActiveObject(); fabricCanvas.renderAll();
                setTimeout(() => {
                  const id = getUUID();
                  const arrow = new fabric.Path('M 0 0 L 1 1', { stroke: '#000000', strokeWidth: 3, fill: '', selectable: true, hasControls: false, lockMovementX: true, lockMovementY: true, id, type: 'arrow', fromId: o1.id, toId: o2.id, rad: 0, label: '', labelBgColor: '#ffffff' });
                  fabricCanvas.add(arrow); arrow.sendToBack(); arrow.bringForward(); updateArrow(arrow, fabricCanvas); fabricCanvas.renderAll();
                }, 20);
              } else setIsConnecting(true);
            }} className={`p-2 rounded text-white text-sm ${isConnecting ? 'bg-gray-400 animate-pulse' : 'bg-orange-500 hover:bg-orange-600'}`}>🔗 Связь</button>

            <h2 className="font-bold border-b pb-1 mt-4 text-gray-700 uppercase text-xs tracking-wider">Сетка</h2>
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} id="snap" />
              <label htmlFor="snap" className="cursor-pointer">Привязка</label>
            </div>
            {snapEnabled && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 uppercase">Частота: {gridFrequency}x</label>
                  <input type="range" min="1" max="4" step="1" value={gridFrequency} onChange={e => setGridFrequency(parseInt(e.target.value))} className="w-full accent-orange-500" />
                </div>
            )}

            <button onClick={exportToPython} className="bg-purple-600 text-white p-2 rounded mt-auto text-sm hover:bg-purple-700">💾 Экспорт</button>
            <button onClick={() => {
              selectedObjs.forEach(o => {
                fabricCanvas.getObjects().filter(a => a.parentId === o.id || a.fromId === o.id || a.toId === o.id).forEach(rel => fabricCanvas.remove(rel));
                fabricCanvas.remove(o);
              });
              fabricCanvas.discardActiveObject().renderAll();
            }} className="bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600">Удалить</button>
          </div>

          {/* Холст */}
          <div className="flex-1 flex justify-center items-center p-4">
            <div className="bg-white p-2 rounded shadow-2xl relative"><canvas ref={canvasRef} /></div>
          </div>

          {/* Свойства */}
          <div className="w-72 bg-white p-4 rounded shadow-lg overflow-y-auto text-sm">
            <h2 className="font-bold border-b pb-2 text-gray-700 uppercase text-xs tracking-wider">Свойства</h2>
            {selectedObjs.length === 1 && (
                <div className="mt-4 flex flex-col gap-4">
                  <p className="text-gray-400 uppercase text-[10px]">Тип: {selectedObjs[0].type}</p>
                  {selectedObjs[0].type === 'player' && (
                      <div>
                        <label className="font-bold block mb-1">ИМЯ:</label>
                        <input className="border p-2 w-full rounded" value={selectedObjs[0].customName} onChange={(e) => {
                          selectedObjs[0].set('customName', e.target.value);
                          selectedObjs[0].item(1).set('text', e.target.value);
                          fabricCanvas.renderAll(); setSelectedObjs([...fabricCanvas.getActiveObjects()]);
                        }} />
                      </div>
                  )}
                  {selectedObjs[0].type === 'arrow' && (
                      <div className="flex flex-col gap-4">
                        <button onClick={() => {
                          const arrow = selectedObjs[0];
                          const t = arrow.fromId; arrow.fromId = arrow.toId; arrow.toId = t;
                          updateArrow(arrow, fabricCanvas); fabricCanvas.renderAll(); setSelectedObjs([...fabricCanvas.getActiveObjects()]);
                        }} className="bg-gray-100 border p-2 rounded hover:bg-gray-200">🔄 Сменить направление</button>
                        <div>
                          <label className="font-bold block mb-1">Цвет линии:</label>
                          <div className="flex flex-wrap gap-2">{PRESET_COLORS.map(c => (
                              <button key={c.value} onClick={() => { selectedObjs[0].set('stroke', c.value); fabricCanvas.renderAll(); setSelectedObjs([...fabricCanvas.getActiveObjects()]); }}
                                      className={`w-7 h-7 rounded-full border-2 ${selectedObjs[0].stroke === c.value ? 'border-blue-500 shadow-sm' : 'border-transparent'}`} style={{backgroundColor: c.value}} />
                          ))}</div>
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Номер:</label>
                          <input className="border p-2 w-full rounded" value={selectedObjs[0].label} onChange={(e) => {
                            selectedObjs[0].set('label', e.target.value);
                            updateArrow(selectedObjs[0], fabricCanvas); setSelectedObjs([...fabricCanvas.getActiveObjects()]);
                          }} />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Цвет кружка:</label>
                          <div className="flex flex-wrap gap-2">{PRESET_COLORS.map(c => (
                              <button key={c.value} onClick={() => { selectedObjs[0].set('labelBgColor', c.value); updateArrow(selectedObjs[0], fabricCanvas); fabricCanvas.renderAll(); setSelectedObjs([...fabricCanvas.getActiveObjects()]); }}
                                      className={`w-7 h-7 rounded-full border-2 ${selectedObjs[0].labelBgColor === c.value ? 'border-blue-500 shadow-sm' : 'border-transparent'}`} style={{backgroundColor: c.value}} />
                          ))}</div>
                        </div>
                        <div>
                          <label className="font-bold block">Выгнутость:</label>
                          <input type="range" min="-2.5" max="2.5" step="0.1" className="w-full mt-1" value={selectedObjs[0].rad} onChange={(e) => {
                            selectedObjs[0].set('rad', parseFloat(e.target.value));
                            updateArrow(selectedObjs[0], fabricCanvas); setSelectedObjs([...fabricCanvas.getActiveObjects()]);
                          }} />
                        </div>
                        <select className="border p-2 w-full rounded" value={selectedObjs[0].strokeDashArray ? 'dashed' : 'solid'} onChange={(e) => {
                          selectedObjs[0].set('strokeDashArray', e.target.value === 'dashed' ? [10, 5] : null);
                          fabricCanvas.renderAll(); setSelectedObjs([...fabricCanvas.getActiveObjects()]);
                        }}><option value="solid">Сплошная</option><option value="dashed">Пунктирная</option></select>
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        <div className="h-44 mt-4 bg-gray-900 rounded-lg p-3 flex flex-col shadow-inner">
          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2">Python Export Output</div>
          <textarea className="flex-1 bg-black/50 text-emerald-400 font-mono text-[11px] p-3 rounded border border-gray-700 resize-none outline-none leading-relaxed"
                    value={exportCode} readOnly placeholder="# Нажмите 'Экспорт', чтобы сгенерировать код..." />
        </div>
      </div>
  );
};

export default VolleyballEditor;