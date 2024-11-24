import React, { useState } from 'react';

const AssistantConfiguration = ({ assistant, onConfirm }) => {
  const [config, setConfig] = useState({
    name: assistant?.name || '',
    style: 'chat',
    color: '#000',
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <h3 className="text-3xl font-serif underline text-gray-800 mb-6">
        Assistant Customization
      </h3>
      <div className="space-y-6 border-2 border-gray-800 bg-gray-200 p-6">
        <label className="flex flex-col text-gray-900 font-mono">
          Name:
          <input
            type="text"
            className="p-1 border-2 border-gray-600 bg-gray-50 text-gray-900 focus:border-yellow-500"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </label>
        <label className="flex flex-col text-gray-900 font-mono">
          Style:
          <select
            className="p-1 border-2 border-gray-600 bg-gray-50 text-gray-900 focus:border-yellow-500"
            value={config.style}
            onChange={(e) => setConfig({ ...config, style: e.target.value })}
          >
            <option value="chat">Chat</option>
            <option value="voice">Voice</option>
          </select>
        </label>
        <label className="flex flex-col text-gray-900 font-mono">
          Theme Color:
          <input
            type="color"
            className="w-10 h-8 border-2 border-gray-600 bg-gray-50"
            value={config.color}
            onChange={(e) => setConfig({ ...config, color: e.target.value })}
          />
        </label>
        <button
          className="px-6 py-2 border-2 border-gray-800 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold rounded-none"
          onClick={() => onConfirm(config)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AssistantConfiguration;
