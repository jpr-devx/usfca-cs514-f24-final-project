import React, { useState } from 'react';

const AssistantMenu = ({ assistants, onSelect, onCreate }) => {
  const [newAssistantName, setNewAssistantName] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <h3 className="text-3xl font-serif underline text-gray-800 mb-6">
        {assistants.length
          ? 'Select a Previous Assistant'
          : 'Create a New Assistant'}
      </h3>
      {assistants.length ? (
        <ul className="space-y-3 border-2 border-gray-700 bg-gray-200 p-4 w-1/2">
          {assistants.map((assistant, index) => (
            <li
              key={index}
              className="p-2 border-2 border-gray-600 bg-gray-100 hover:bg-yellow-200 cursor-pointer font-mono text-gray-900"
              onClick={() => onSelect(assistant)}
            >
              {assistant.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center space-y-6 border-2 border-gray-800 bg-gray-200 p-6 w-1/3">
          <input
            type="text"
            className="p-1 border-2 border-gray-600 bg-gray-50 font-mono text-gray-900 focus:border-yellow-500"
            placeholder="New Assistant Name"
            value={newAssistantName}
            onChange={(e) => setNewAssistantName(e.target.value)}
          />
          <button
            className="px-4 py-2 border-2 border-gray-700 bg-yellow-300 hover:bg-yellow-400 font-bold text-gray-900"
            onClick={() => onCreate(newAssistantName)}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default AssistantMenu;
