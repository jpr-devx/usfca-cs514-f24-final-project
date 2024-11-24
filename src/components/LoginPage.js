import React from "react";

const LoginPage = ({ onLogin }) => (
  <div
    className="flex flex-col items-center justify-center h-screen"
    style={{
      background: "lightyellow",
      fontFamily: "Courier New, monospace",
      color: "darkred",
    }}
  >
    <h2 className="text-3xl font-bold mb-6 underline">Welcome to AI Assistant</h2>
    <div className="space-y-4">
      <button
        style={{
          background: "maroon",
          color: "white",
          border: "2px solid black",
          padding: "10px",
          fontWeight: "bold",
        }}
        onClick={() => onLogin("existing")}
      >
        Access Previous Assistants
      </button>
      <button
        style={{
          background: "olive",
          color: "white",
          border: "2px solid black",
          padding: "10px",
          fontWeight: "bold",
        }}
        onClick={() => onLogin("new")}
      >
        Create a New Assistant
      </button>
    </div>
  </div>
);

export default LoginPage;
