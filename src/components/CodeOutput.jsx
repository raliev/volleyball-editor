import React from 'react';

const CodeOutput = ({ exportCode }) => {
  return (
    <div className="h-44 mt-4 bg-gray-900 rounded-lg p-3 flex flex-col shadow-inner">
      <textarea 
        className="flex-1 bg-black/50 text-emerald-400 font-mono text-[11px] p-3 rounded border border-gray-700 resize-none outline-none" 
        value={exportCode} 
        readOnly 
      />
    </div>
  );
};

export default CodeOutput;

