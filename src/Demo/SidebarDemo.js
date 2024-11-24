import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const SidebarDemo = () => {
  const [assistants, setAssistants] = useState([
    { name: "Assistant One" },
    { name: "Assistant Two" },
    { name: "Assistant Three" },
  ]);

  const handleSelect = (assistant) => {
    console.log("Selected Assistant:", assistant);
  };

  const handleCreateNew = () => {
    const newAssistant = { name: `Assistant ${assistants.length + 1}` };
    setAssistants([...assistants, newAssistant]);
    console.log("New Assistant Created:", newAssistant);
  };

  return (
    <div className="flex">
      <Sidebar assistants={assistants} onSelect={handleSelect} onCreateNew={handleCreateNew} />
      <div className="w-3/4 p-4">
        <p>Welcome to the Sidebar Demo!</p>
      </div>
    </div>
  );
};

export default SidebarDemo;
