import React from 'react';
import { PRESET_COLORS } from '../constants';

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
        <p className="text-gray-400 uppercase text-[10px]">Type: {selectedObj.role}</p>

        {selectedObj.role === 'text' && (
          <div>
            <label className="font-bold block mb-1">Text Content:</label>
            <textarea 
              className="border p-2 w-full rounded" 
              value={selectedObj.text} 
              onChange={(e) => handleTextChange(e.target.value)} 
            />
          </div>
        )}

        {selectedObj.role === 'player' && (
          <div>
            <label className="font-bold block mb-1">Name (letter):</label>
            <input 
              className="border p-2 w-full rounded" 
              value={selectedObj.customName} 
              onChange={(e) => handlePlayerNameChange(e.target.value)} 
            />
          </div>
        )}

        {selectedObj.role === 'arrow' && (
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleArrowReverse} 
              className="bg-gray-100 border p-2 rounded hover:bg-gray-200"
            >
              🔄 Reverse
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
            
            <div>
              <label className="font-bold block">Curvature:</label>
              <input 
                type="range" 
                min="-2.5" 
                max="2.5" 
                step="0.1" 
                className="w-full mt-1" 
                value={selectedObj.rad} 
                onChange={(e) => handleArrowCurvatureChange(e.target.value)} 
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Arrow Type:</label>
              <select
                  className="border p-2 w-full rounded"
                  value={selectedObj.lineType || 'normal'}
                  onChange={(e) => handleLineTypeChange(e.target.value)}
              >
                <option value="normal">Normal / Set</option>
                <option value="wavy">Wavy (Float Serve)</option>
                <option value="lightning">Lightning (Attack)</option>
              </select>
            </div>
            <select
                className="border p-2 w-full rounded"
                value={
                  !selectedObj.strokeDashArray ? 'solid' :
                      (selectedObj.strokeDashArray[0] === 10 ? 'dashed' : 'dotted')
                }
                onChange={(e) => handleArrowStyleChange(e.target.value)}
            >
              <option value="solid">Solid line</option>
              <option value="dashed">Dashed line</option>
              <option value="dotted">Dotted line</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropsPanel;

