import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { CUSTOM_PROPS, PLAYER_POSITIONS, SCALE } from './constants';
import { getUUID } from './utils';
import { 
  updateArrow, 
  renderAllStatic, 
  createPlayerObject, 
  createObjectByRole,
  calculateArrowData 
} from './canvasUtils';
import { 
  exportJson, 
  importJson, 
  exportObjJson, 
  importObjJson, 
  exportToPython,
  exportToSvg,
  exportToPng
} from './fileOperations';
import Sidebar from './components/Sidebar';
import PropsPanel from './components/PropsPanel';
import CodeOutput from './components/CodeOutput';
import Volleyball3DApp from './Volleyball3D.jsx'; // Импортируем ваш новый файл
const VolleyballEditor = () => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [selectedObjs, setSelectedObjs] = useState([]);
  const [exportCode, setExportCode] = useState("");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridFrequency, setGridFrequency] = useState(1);
  const timerRef = useRef(null);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillDesc, setDrillDesc] = useState("");
  const [show3D, setShow3D] = useState(false);
  const [selectionOrder, setSelectionOrder] = useState([]);
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelection = (options) => {
      const currentSelected = fabricCanvas.getActiveObjects();
      const currentIds = currentSelected.map(obj => obj.id);

      setSelectionOrder(prev => {
        // Keep existing IDs that are still selected, append new ones
        const maintained = prev.filter(id => currentIds.includes(id));
        const added = currentIds.filter(id => !prev.includes(id));
        return [...maintained, ...added];
      });
      setSelectedObjs(currentSelected);
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => {
      setSelectionOrder([]);
      setSelectedObjs([]);
    });

    fabricCanvas.drillTitle = drillTitle;
    fabricCanvas.drillDesc = drillDesc;

    const topPadding = drillTitle ? 70 : 0;
    const bottomPadding = drillDesc ? 100 : 0;

    fabricCanvas.setHeight(500 + topPadding + bottomPadding);

    // Refresh static elements with offset
    renderAllStatic(fabricCanvas, snapEnabled, gridFrequency, topPadding);

    // Update or Create Title/Desc objects on canvas for export/clicking
    updateMetadataObjects(topPadding);
  }, [drillTitle, drillDesc, fabricCanvas]);



  const updateMetadataObjects = (topPadding) => {
    if (!fabricCanvas) return;

    const canvasHeight = fabricCanvas.getHeight();

    const syncMetadata = (id, text, options) => {
      let obj = fabricCanvas.getObjects().find(o => o.id === id);
      if (text) {
        if (!obj) {
          obj = new fabric.Textbox(text, {
            id,
            isMetadata: true,
            textAlign: 'center',
            originX: 'center',
            selectable: true,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            ...options
          });
          fabricCanvas.add(obj);
        } else {
          obj.set({ text, ...options });
          obj.setCoords();
        }
      } else if (obj) {
        fabricCanvas.remove(obj);
      }
    };

    // Position Title at the top
    syncMetadata('drill-title-obj', drillTitle, {
      top: 15,
      left: 400,
      fontSize: 28,
      fontWeight: 'bold',
      width: 750
    });

    // Position Description at the very bottom
    // We use a fixed offset from the bottom of the current canvas height
    syncMetadata('drill-desc-obj', drillDesc, {
      top: canvasHeight - (drillDesc.split('\n').length * 18 + 25),
      left: 400,
      fontSize: 14,
      width: 750
    });

    fabricCanvas.renderAll();
  };
  const handleExportPng = () => {
    exportToPng(fabricCanvas);
  };

  const handleExportSvg = () => {
    exportToSvg(fabricCanvas);
  };

  const saveState = () => {
    if (!fabricCanvas) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const json = fabricCanvas.toJSON(CUSTOM_PROPS);
      localStorage.setItem('vball_drill_state', JSON.stringify(json));
    }, 500);
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800, 
      height: 500,
      backgroundColor: '#f8f9fa',
      preserveObjectStacking: true
    });
    setFabricCanvas(canvas);
    return () => canvas.dispose();
  }, []);

  // Load saved state
  useEffect(() => {
    if (!fabricCanvas) return;
    const saved = localStorage.getItem('vball_drill_state');
    if (saved) {
      try {
        fabricCanvas.loadFromJSON(JSON.parse(saved), () => {
          fabricCanvas.getObjects()
            .filter(o => o.role === 'arrow')
            .forEach(a => updateArrow(a, fabricCanvas));
          renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
          fabricCanvas.renderAll();
        });
      } catch (e) {
        console.error(e);
        renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
      }
    } else {
      renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
    }
  }, [fabricCanvas, snapEnabled, gridFrequency]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
          return;
        }
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, selectedObjs]);

  // Canvas event handlers
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
      const targets = options.target.type === 'activeSelection' 
        ? options.target.getObjects() 
        : [options.target];
      fabricCanvas.getObjects()
        .filter(o => o.role === 'arrow')
        .forEach(arrow => {
          if (targets.some(t => t.id === arrow.fromId || t.id === arrow.toId)) {
            updateArrow(arrow, fabricCanvas);
          }
        });
    };
    
    fabricCanvas.on('object:moving', onMoving);
    fabricCanvas.on('selection:created', () => {
      setSelectedObjs([...fabricCanvas.getActiveObjects()]);
    });
    fabricCanvas.on('selection:updated', () => {
      setSelectedObjs([...fabricCanvas.getActiveObjects()]);
    });
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObjs([]);
    });
    
    return () => {
      fabricCanvas.off('object:moving', onMoving);
    };
  }, [fabricCanvas, snapEnabled, gridFrequency]);

  const handleAddBall = () => {
    const id = getUUID();
    const obj = createObjectByRole(fabric, 'ball', { left: 400, top: 250, id });
    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    saveState();
  };

  const handleClearAll = () => {
    if (window.confirm("Вы уверены, что хотите начать заново? Все несохраненные данные будут удалены.")) {
      fabricCanvas.getObjects().forEach(obj => {
        if (!obj.isStatic) fabricCanvas.remove(obj);
      });
      localStorage.removeItem('vball_drill_state');
      renderAllStatic(fabricCanvas, snapEnabled, gridFrequency);
      fabricCanvas.renderAll();
      saveState();
    }
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      // Remove connected arrows
      fabricCanvas.getObjects()
        .filter(o => o.role === 'arrow')
        .forEach(arrow => {
          if (arrow.fromId === obj.id || arrow.toId === obj.id) {
            const labelGroup = fabricCanvas.getObjects().find(l => l.parentId === arrow.id);
            if (labelGroup) fabricCanvas.remove(labelGroup);
            fabricCanvas.remove(arrow);
          }
        });

      // Remove arrow label if deleting arrow
      if (obj.role === 'arrow') {
        const labelGroup = fabricCanvas.getObjects().find(l => l.parentId === obj.id);
        if (labelGroup) fabricCanvas.remove(labelGroup);
      }

      fabricCanvas.remove(obj);
    });

    fabricCanvas.discardActiveObject().renderAll();
    saveState();
  };

  const handleAddCustomText = () => {
    const content = prompt("Введите текст:", "Текст") || "Текст";
    const id = getUUID();
    const textObj = new fabric.IText(content, {
      left: 400, 
      top: 250,
      fontSize: 24,
      fill: '#333',
      id, 
      role: 'text',
      originX: 'center', 
      originY: 'center',
      hasControls: true,
      lockScalingX: false, 
      lockScalingY: false,
      lockRotation: false
    });
    fabricCanvas.add(textObj);
    fabricCanvas.setActiveObject(textObj);
    saveState();
  };

  const getCurrentDrillData = () => {
    if (!fabricCanvas) return null;

    const objects = fabricCanvas.getObjects()
        .filter(obj => !obj.isStatic && !obj.isMetadata)
        .map((obj) => {
          const p = obj.getCenterPoint();

          const base = {
            id: obj.id,
            type: obj.role || obj.type,
            pose: obj.pose || "",
            x: parseFloat(((p.x - 400) / 40).toFixed(2)),
            y: parseFloat((-((p.y - 250) / 40)).toFixed(2)),
          };

          if (obj.role === 'player') {
            const circle = obj.item ? obj.item(0) : null;
            return {
              ...base,
              type: 'player',
              name: obj.customName || 'P',
              pose: obj.pose || 'auto',
              color: circle ? circle.fill : 'white' // Pass color to 3D
            };
          }

          if (obj.role === 'ball') {
            return { ...base, type: 'ball' };
          }

          if (obj.role === 'arrow') {
            return {
              ...base,
              type: 'arrow',
              from: obj.fromId,
              to: obj.toId,
              rad: obj.rad || 0,
              line_color: obj.stroke || '#000000',
              arrowType: obj.arrowType || 'ball',
              style: !obj.strokeDashArray ? '-' : (obj.strokeDashArray[0] === 10 ? '--' : ':'),
              // ADD THESE TWO LINES:
              label: obj.label || '',
              labelBgColor: obj.labelBgColor || '#ffffff'
            };
          }

          return base;
        })
        .filter(Boolean);

    return { objects };
  };

  const handleTransformSelection = (newRole) => {
    const active = fabricCanvas.getActiveObjects();
    active.forEach(oldObj => {
      if (oldObj.role === 'arrow' || oldObj.isStatic) return;
      const pos = oldObj.getCenterPoint();
      const id = oldObj.id;
      const name = oldObj.customName || "P";
      fabricCanvas.remove(oldObj);
      
      const newObj = createObjectByRole(fabric, newRole, {
        left: pos.x, 
        top: pos.y, 
        id
      }, name);
      
      if (newObj) {
        fabricCanvas.add(newObj);
      }
    });
    
    fabricCanvas.getObjects()
      .filter(o => o.role === 'arrow')
      .forEach(a => updateArrow(a, fabricCanvas));
    fabricCanvas.discardActiveObject().renderAll();
    saveState();
  };

  const handleAddQuickPlayer = (side, pos, label, bgColor = 'white') => {
    const id = getUUID();
    const coords = (PLAYER_POSITIONS[side] && PLAYER_POSITIONS[side][pos]) || { x: 400, y: 250 };
    const obj = createPlayerObject(fabric, id, label, coords.x, coords.y, bgColor);
    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
    saveState();
  };

  const handleConnectSelected = (type) => {
    // Use the order from our state instead of the default array
    if (selectionOrder.length < 2) return;

    const o1 = fabricCanvas.getObjects().find(o => o.id === selectionOrder[0]);
    const o2 = fabricCanvas.getObjects().find(o => o.id === selectionOrder[1]);

    if (!o1 || !o2) return;

    fabricCanvas.discardActiveObject();
    const id = getUUID();
    const { pathStr } = calculateArrowData(o1, o2, 0);

    const isBall = type === 'ball';
    const arrow = new fabric.Path(pathStr, {
      stroke: '#000000',
      strokeWidth: 3,
      fill: '',
      selectable: true,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      id,
      role: 'arrow',
      arrowType: type,
      hitType: 'auto', // Set Auto as default
      fromId: o1.id,
      toId: o2.id,
      rad: 0,
      label: '',
      labelBgColor: '#ffffff',
      // Configuration A (Dotted [2,4]) for ball, B (Solid null) for player
      strokeDashArray: isBall ? [2, 4] : null
    });

    fabricCanvas.add(arrow);
    updateArrow(arrow, fabricCanvas);
    saveState();
  };

  const handleExportJson = () => {
    exportJson(fabricCanvas);
  };

  const handleImportJson = (e) => {
    importJson(e, fabricCanvas, snapEnabled, gridFrequency, saveState);
  };

  const handleExportObjJson = () => {
    exportObjJson(fabricCanvas);
  };

  const handleImportObjJson = (e) => {
    importObjJson(e, fabricCanvas, snapEnabled, gridFrequency, (data) => {
      // Update React state with the values from the file
      if (data.title !== undefined) setDrillTitle(data.title);
      if (data.description !== undefined) setDrillDesc(data.description);
      saveState();
    });
  };

  const handleExportToPython = () => {
    const code = exportToPython(fabricCanvas);
    setExportCode(code);
  };

  const handleUpdateSelected = () => {
    setSelectedObjs([...fabricCanvas.getActiveObjects()]);
    saveState(); // Added to persist changes made in PropsPanel
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200 p-4 font-sans overflow-hidden text-xs">
        {!show3D && (
            <button
                onClick={() => setShow3D(true)}
                className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              🚀 OPEN 3D VIEW
            </button>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* 2. 3D OVERLAY MODE */}
          {show3D && (
              <div className="fixed inset-0 z-[60] bg-black">
                <button
                    onClick={() => setShow3D(false)}
                    className="absolute top-4 right-4 z-[70] bg-red-600 text-white px-4 py-2 rounded font-bold shadow-xl hover:bg-red-700"
                >
                  ESC / CLOSE 3D
                </button>

                {/* Pass live data from canvas to 3D component */}
                <Volleyball3DApp initialData={getCurrentDrillData()} />
              </div>
          )}

        <Sidebar
          onClearAll={handleClearAll}
          onAddQuickPlayer={handleAddQuickPlayer}
          onAddCustomText={handleAddCustomText}
          onTransformSelection={handleTransformSelection}
          onConnectSelected={handleConnectSelected}
          onDeleteSelected={handleDeleteSelected}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onExportObjJson={handleExportObjJson}
          onImportObjJson={handleImportObjJson}
          onExportToPython={handleExportToPython}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          selectedObjs={selectedObjs}
          onAddBall={handleAddBall}
          snapEnabled={snapEnabled}
          onSnapToggle={(e) => {
            setSnapEnabled(e.target.checked);
            renderAllStatic(fabricCanvas, e.target.checked, gridFrequency);
          }}
        />

        <div className="flex-1 flex justify-center items-center p-4">
          <div className="bg-white p-2 rounded shadow-2xl relative">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <PropsPanel
            selectedObjs={selectedObjs}
            fabricCanvas={fabricCanvas}
            onUpdateArrow={updateArrow}
            onUpdateSelected={handleUpdateSelected}
            drillTitle={drillTitle}
            setDrillTitle={setDrillTitle}
            drillDesc={drillDesc}
            setDrillDesc={setDrillDesc}
        />
      </div>

      <CodeOutput exportCode={exportCode} />
    </div>
  );
};

export default VolleyballEditor;
