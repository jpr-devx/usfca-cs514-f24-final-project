import React from "react";
import ChatInterface from "../components/ChatInterface";

const ChatInterfaceDemo = () => {
  const assistant = { name: "Demo Assistant" };

  return (
    <div>
      <ChatInterface assistant={assistant} />
    </div>
  );
};

export default ChatInterfaceDemo;
