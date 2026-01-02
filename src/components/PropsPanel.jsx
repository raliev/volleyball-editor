import React from 'react';
import { HIT_TYPES, PLAYER_POSES, PRESET_COLORS } from '../constants';

const PropsPanel = ({
                      selectedObjs,
                      fabricCanvas,
                      onUpdateArrow,
                      onUpdateSelected,
                      drillTitle,
                      setDrillTitle,
                      drillDesc,
                      setDrillDesc
                    }) => {
  // Show Drill Info if nothing is selected OR if a metadata object is selected
  const isMetadata = selectedObjs.length === 1 && selectedObjs[0].isMetadata;

  if (selectedObjs.length !== 1 || isMetadata) {
    return (
        <div className="w-72 bg-white p-4 rounded shadow-lg overflow-y-auto text-sm">
          <h2 className="font-bold border-b pb-2 text-gray-700 uppercase text-xs tracking-wider">Drill Info</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="font-bold block mb-1">Drill Title:</label>
              <input
                  className="border p-2 w-full rounded font-bold"
                  placeholder="Enter title..."
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Description (Notes):</label>
              <textarea
                  className="border p-2 w-full rounded h-32 text-xs"
                  placeholder="Detailed instructions..."
                  value={drillDesc}
                  onChange={(e) => setDrillDesc(e.target.value)}
              />
            </div>
          </div>
        </div>
    );
  }

  const selectedObj = selectedObjs[0];

  const isOffensivePossible = () => {
    if (selectedObj.arrowType !== 'ball') return true;

    const from = fabricCanvas.getObjects().find(o => o.id === selectedObj.fromId);
    const to = fabricCanvas.getObjects().find(o => o.id === selectedObj.toId);
    if (!from || !to) return true;

    // Convert pixels to meters (Center is 400px, Scale is 40px/m)
    const startX = (from.getCenterPoint().x - 400) / 40;
    const endX = (to.getCenterPoint().x - 400) / 40;

    // Logic: Back zone (dist > 6m), Opponent Perimeter (dist < 3m on other side)
    const fromBackZone = Math.abs(startX) > 6;
    const toOpponentPerimeter = Math.abs(endX) < 3 && (Math.sign(startX) !== Math.sign(endX));

    return !(fromBackZone && toOpponentPerimeter);
  };

  const handleLineTypeChange = (value) => {
    selectedObj.set('lineType', value);
    onUpdateArrow(selectedObj, fabricCanvas);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handleTextChange = (value) => {
    selectedObj.set('text', value);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handlePlayerNameChange = (value) => {
    selectedObj.set('customName', value);
    if (selectedObj.item) {
      selectedObj.item(1).set('text', value);
    }
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handleArrowReverse = () => {
    const t = selectedObj.fromId;
    selectedObj.fromId = selectedObj.toId;
    selectedObj.toId = t;
    onUpdateArrow(selectedObj, fabricCanvas);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handleArrowColorChange = (color) => {
    selectedObj.set('stroke', color);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handleArrowLabelChange = (value) => {
    selectedObj.set('label', value);
    onUpdateArrow(selectedObj, fabricCanvas);
    onUpdateSelected();
  };

  const handleArrowLabelColorChange = (color) => {
    selectedObj.set('labelBgColor', color);
    onUpdateArrow(selectedObj, fabricCanvas);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  const handleArrowCurvatureChange = (value) => {
    selectedObj.set('rad', parseFloat(value));
    onUpdateArrow(selectedObj, fabricCanvas); // Добавлено fabricCanvas
    onUpdateSelected();
  };

  const handleArrowStyleChange = (value) => {
    let dashArray = null;
    if (value === 'dashed') dashArray = [10, 5];
    if (value === 'dotted') dashArray = [2, 4]; // Маленькие точки с промежутком

    selectedObj.set('strokeDashArray', dashArray);
    fabricCanvas.renderAll();
    onUpdateSelected();
  };

  return (
      <div className="w-72 bg-white p-4 rounded shadow-lg overflow-y-auto text-sm">
        <h2 className="font-bold border-b pb-2 text-gray-700 uppercase text-xs tracking-wider">Props</h2>
        <div className="mt-4 flex flex-col gap-4">

          {/* Player Section */}
          {selectedObj.role === 'player' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-bold block mb-1">3D Pose:</label>
                  <select
                      className="border p-2 w-full rounded"
                      value={selectedObj.pose || 'auto'}
                      onChange={(e) => {
                        selectedObj.set('pose', e.target.value);
                        onUpdateSelected();
                      }}
                  >
                    {PLAYER_POSES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
          )}

          {/* Arrow Section (General for all arrows) */}
          {selectedObj.role === 'arrow' && (
              <div className="flex flex-col gap-2">
                <button
                    onClick={handleArrowReverse}
                    className="w-full bg-indigo-50 text-indigo-600 border border-indigo-200 p-2 rounded font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  🔄 REVERSE DIRECTION
                </button>

                <div>
                  <label className="font-bold block mb-1">Line Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => handleArrowColorChange(c.value)}
                            className={`w-7 h-7 rounded-full border-2 ${
                                selectedObj.stroke === c.value
                                    ? 'border-blue-500 shadow-sm'
                                    : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c.value }}
                        />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-bold block mb-1">No:</label>
                  <input
                      className="border p-2 w-full rounded"
                      value={selectedObj.label}
                      onChange={(e) => handleArrowLabelChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">No's Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => handleArrowLabelColorChange(c.value)}
                            className={`w-7 h-7 rounded-full border-2 ${
                                selectedObj.labelBgColor === c.value
                                    ? 'border-blue-500 shadow-sm'
                                    : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c.value }}
                        />
                    ))}
                  </div>
                </div>

                {/* Ball Path Specific Section */}
                {selectedObj.arrowType === 'ball' && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                      <label className="font-bold block mb-1">Hit Property:</label>
                      <select
                          className="border p-2 w-full rounded bg-white"
                          value={selectedObj.hitType || 'auto'}
                          onChange={(e) => {
                            selectedObj.set('hitType', e.target.value);
                            onUpdateSelected();
                            fabricCanvas.renderAll();
                          }}
                      >
                        {HIT_TYPES.map(h => {
                          const disabled = h.value === 'offensive' && !isOffensivePossible();
                          return (
                              <option key={h.value} value={h.value} disabled={disabled}>
                                {h.label} {disabled ? '(Impossible)' : ''}
                              </option>
                          );
                        })}
                      </select>
                      {!isOffensivePossible() && (
                          <p className="text-[10px] text-red-500 mt-1 italic">
                            * Offensive hit unavailable from back court to perimeter.
                          </p>
                      )}
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
}; // End of component

const isOffensivePossible = () => {
  if (selectedObj.arrowType !== 'ball') return true;

  const from = fabricCanvas.getObjects().find(o => o.id === selectedObj.fromId);
  const to = fabricCanvas.getObjects().find(o => o.id === selectedObj.toId);
  if (!from || !to) return true;

  // Convert pixel to meters relative to center (0,0)
  const startX = (from.getCenterPoint().x - 400) / 40;
  const endX = (to.getCenterPoint().x - 400) / 40;

  // Logic: Back zone > 6m, Opponent Perimeter < 3m
  const fromBackZone = Math.abs(startX) > 6;
  const toOpponentPerimeter = Math.abs(endX) < 3 && (Math.sign(startX) !== Math.sign(endX));

  return !(fromBackZone && toOpponentPerimeter);
};

export default PropsPanel;

