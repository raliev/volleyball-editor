import React from 'react';
import { PLAYER_POSITIONS } from '../constants';

const ROLE_ZONES = {
    'OH': '4',
    'MB': '3',
    'RH': '2',
    'MH': '3',
    'O': '2',
    'S': '1',
    'L': '6'
};

const Sidebar = ({
                     onClearAll,
                     onAddQuickPlayer,
                     onAddCustomText,
                     onTransformSelection,
                     onConnectSelected,
                     onDeleteSelected,
                     onExportJson,
                     onImportJson,
                     onExportObjJson,
                     onImportObjJson,
                     onExportToPython,
                     onExportPng,
                     onExportSvg,
                     selectedObjs,
                     snapEnabled,
                     onSnapToggle,
                     onAddBall
                 }) => {
    return (
        <div className="w-64 bg-white p-4 rounded shadow-lg flex flex-col gap-3 overflow-y-auto">
            <button
                onClick={onClearAll}
                className="w-full bg-red-50 text-red-600 border border-red-200 p-2 rounded font-bold hover:bg-red-100 transition-colors"
            >
                ✨ NEW DRILL
            </button>

            <h2 className="font-bold border-b pb-1 uppercase text-gray-700">Quick Placement</h2>

            {/* Сетка номеров зон (существующая) */}
            <div className="flex gap-1 justify-between">
                <div className="flex flex-wrap gap-1 w-1/2">
                    {[5, 6, 1, 4, 3, 2].map(n => (
                        <button
                            key={n}
                            onClick={() => onAddQuickPlayer('left', String(n), String(n), '#dbeafe')}
                            className="w-6 h-6 bg-blue-100 rounded border border-blue-300 text-[10px]"
                        >
                            L{n}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1 w-1/2 justify-end">
                    {[1, 6, 5, 2, 3, 4].map(n => (
                        <button
                            key={n}
                            onClick={() => onAddQuickPlayer('right', String(n), String(n), '#fee2e2')}
                            className="w-6 h-6 bg-red-100 rounded border border-red-300 text-[10px]"
                        >
                            R{n}
                        </button>
                    ))}
                </div>
            </div>

            {/* НОВОЕ: Кнопки по ролям */}
            <div className="flex gap-1 justify-between mt-1">
                <div className="flex flex-wrap gap-1 w-1/2">
                    {Object.keys(ROLE_ZONES).map(role => (
                        <button
                            key={role}
                            onClick={() => onAddQuickPlayer('left', ROLE_ZONES[role], role, '#dbeafe')}
                            className="w-6 h-6 bg-blue-50 text-[8px] font-bold rounded border border-blue-200 hover:bg-blue-100"
                        >
                            {role}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1 w-1/2 justify-end">
                    {Object.keys(ROLE_ZONES).map(role => (
                        <button
                            key={role}
                            onClick={() => onAddQuickPlayer('right', ROLE_ZONES[role], role, '#fee2e2')}
                            className="w-6 h-6 bg-red-50 text-[8px] font-bold rounded border border-red-200 hover:bg-red-100"
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

        <button
            onClick={onAddBall}
            className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 p-2 rounded font-bold hover:bg-yellow-100 transition-colors"
        >
            🏐 ADD BALL
        </button>

      <button 
        onClick={onAddCustomText} 
        className="w-full bg-gray-100 border border-gray-300 p-1.5 rounded font-bold hover:bg-gray-200"
      >
        ➕ ADD TEXT
      </button>

      <h2 className="font-bold border-b pb-1 mt-1 text-gray-400 uppercase text-[9px]">Outside Zones (L / R)</h2>
      <div className="flex flex-wrap gap-1">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(z => (
          <button 
            key={z} 
            onClick={() => onAddQuickPlayer('left_extra', z, z, '#eff6ff')} 
            className="w-6 h-6 bg-blue-50 text-[10px] rounded border border-blue-200"
          >
            {z}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(z => (
          <button 
            key={z} 
            onClick={() => onAddQuickPlayer('right_extra', z, z, '#fff1f2')} 
            className="w-6 h-6 bg-red-50 text-[10px] rounded border border-blue-200"
          >
            {z}
          </button>
        ))}
      </div>

      <h2 className="font-bold border-b pb-2 mt-4 text-gray-700 uppercase tracking-wider">Selection Tools</h2>
      <div className="grid grid-cols-2 gap-2">
        <button 
          disabled={selectedObjs.length === 0} 
          onClick={() => onTransformSelection('player')} 
          className="bg-white border-2 border-blue-500 text-blue-600 p-2 rounded font-bold disabled:opacity-30"
        >
          TO PLAYER
        </button>
        <button 
          disabled={selectedObjs.length === 0} 
          onClick={() => onTransformSelection('target')} 
          className="bg-white border-2 border-green-600 text-green-600 p-2 rounded font-bold disabled:opacity-30"
        >
          TO TARGET
        </button>
        <button 
          disabled={selectedObjs.length === 0} 
          onClick={() => onTransformSelection('point')} 
          className="bg-white border-2 border-black text-black p-2 rounded font-bold disabled:opacity-30"
        >
          TO POINT
        </button>
        <button 
          disabled={selectedObjs.length === 0} 
          onClick={() => onTransformSelection('cone')} 
          className="bg-white border-2 border-orange-500 text-orange-600 p-2 rounded font-bold disabled:opacity-30"
        >
          TO CONE
        </button>
      </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => onConnectSelected('ball')}
                    disabled={selectedObjs.length !== 2}
                    className="p-2 rounded text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 font-bold flex flex-col items-center"
                >
                    <span className="text-[10px]">🏐 BALL PATH</span>
                    <span className="text-[8px] font-normal opacity-80">(Dotted Line)</span>
                </button>

                <button
                    onClick={() => onConnectSelected('player')}
                    disabled={selectedObjs.length !== 2}
                    className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 font-bold flex flex-col items-center"
                >
                    <span className="text-[10px]">🏃 PLAYER MOVE</span>
                    <span className="text-[8px] font-normal opacity-80">(Solid Line)</span>
                </button>
            </div>

      <button 
        onClick={onDeleteSelected} 
        disabled={selectedObjs.length === 0} 
        className="p-2 rounded text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 font-bold uppercase"
      >
        🗑️ Delete Selected
      </button>

      <h2 className="font-bold border-b pb-1 mt-4 text-gray-700 uppercase">File & Grid</h2>
      <div className="flex items-center gap-2 mb-2">
        <input 
          type="checkbox" 
          checked={snapEnabled} 
          onChange={onSnapToggle} 
          id="snap" 
        />
        <label htmlFor="snap">Snap to Grid</label>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="grid grid-cols-2 gap-1">
          <button 
            onClick={onExportJson} 
            className="bg-gray-700 text-white p-1 rounded hover:bg-gray-800"
          >
            Exp JSON
          </button>
          <label className="bg-gray-200 text-gray-700 p-1 rounded text-center cursor-pointer hover:bg-gray-300">
            Imp JSON
            <input 
              type="file" 
              className="hidden" 
              accept=".json" 
              onChange={onImportJson} 
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button 
            onClick={onExportObjJson} 
            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
          >
            Exp ObjJSON
          </button>
          <label className="bg-blue-100 text-blue-700 p-1 rounded text-center cursor-pointer hover:bg-blue-200">
            Imp ObjJSON
            <input 
              type="file" 
              className="hidden" 
              accept=".json" 
              onChange={onImportObjJson} 
            />
          </label>
        </div>

          <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                  onClick={onExportPng}
                  className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 text-[10px] font-bold uppercase"
              >
                  Export to PNG
              </button>
              <button
                  onClick={onExportSvg}
                  className="bg-orange-600 text-white p-1 rounded hover:bg-orange-700 text-[10px] font-bold uppercase"
              >
                  Export to SVG
              </button>
          </div>
          <button
          onClick={onExportToPython} 
          className="bg-purple-600 text-white p-2 rounded mt-2 text-xs font-bold uppercase"
        >
          🐍 Generate Python
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

