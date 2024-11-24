import React from "react";
import AssistantConfiguration from "../components/AssistantConfiguration";

const Demo = () => {
  const handleConfirm = (config) => {
    console.log("Configuration Confirmed:", config);
  };

  return (
    <div>
      <AssistantConfiguration
        assistant={{ name: "Demo Assistant" }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default Demo;
