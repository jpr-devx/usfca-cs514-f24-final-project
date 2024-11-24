import React from "react";

const Sidebar = ({ assistants, onSelect, onCreateNew }) => (
  <div
    className="w-1/4 h-screen p-4"
    style={{
      background: "darkgray",
      color: "white",
      fontFamily: "Courier New, monospace",
      borderRight: "2px solid black",
    }}
  >
    <h3 className="text-xl font-bold mb-4 underline">Your Assistants</h3>
    <ul
      className="space-y-2"
      style={{
        listStyleType: "square",
        paddingLeft: "20px",
      }}
    >
      {assistants.map((assistant, index) => (
        <li
          key={index}
          style={{
            background: "gray",
            color: "white",
            border: "1px solid black",
            padding: "10px",
            cursor: "pointer",
          }}
          onClick={() => onSelect(assistant)}
        >
          {assistant.name}
        </li>
      ))}
    </ul>
    <button
      style={{
        marginTop: "20px",
        padding: "10px",
        background: "navy",
        color: "white",
        border: "2px solid black",
        width: "100%",
      }}
      onClick={onCreateNew}
    >
      Create New Assistant
    </button>
  </div>
);

export default Sidebar;
