import React, { useState } from "react";
import AssistantMenu from "../components/AssistantMenu";

const Demo = () => {
  const [assistants, setAssistants] = useState([
    { name: "Assistant One" },
    { name: "Assistant Two" },
  ]);

  const handleSelect = (assistant) => {
    console.log("Selected Assistant:", assistant);
  };

  const handleCreate = (newAssistantName) => {
    if (newAssistantName) {
      const newAssistant = { name: newAssistantName };
      setAssistants([...assistants, newAssistant]);
      console.log("New Assistant Created:", newAssistant);
    } else {
      console.log("Assistant creation failed: Name is empty.");
    }
  };

  return (
    <div>
      <AssistantMenu
        assistants={assistants}
        onSelect={handleSelect}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default Demo;
