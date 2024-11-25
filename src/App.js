import React, { useState } from 'react';
// change this import to test different component
// import Demo from './Demo/SidebarDemo';
// import LoginPage from './components/LoginPage';
// import AssistantMenu from './components/AssistantMenu';
// import AssistantConfiguration from './components/AssistantConfiguration';
// import ChatInterface from './components/ChatInterface';
// import Sidebar from './components/Sidebar';
import GovAssistantPortal from './components/GovAssistantPortal'

const App = () => {
  // const [page, setPage] = useState('login'); // login, menu, config, chat
  // const [assistants, setAssistants] = useState([]);
  // const [currentAssistant, setCurrentAssistant] = useState(null);

  // const handleLogin = (type) => {
  //   if (type === 'existing') {
  //     setPage('menu');
  //   } else {
  //     setPage('config');
  //   }
  // };

  // const handleSelectAssistant = (assistant) => {
  //   setCurrentAssistant(assistant);
  //   setPage('chat');
  // };

  // const handleCreateAssistant = (name) => {
  //   const newAssistant = { name };
  //   setAssistants([...assistants, newAssistant]);
  //   setCurrentAssistant(newAssistant);
  //   setPage('config');
  // };

  // const handleConfirmConfig = (config) => {
  //   setCurrentAssistant(config);
  //   setPage('chat');
  // };

  return (
    <div className="app">
      <GovAssistantPortal/>
    </div>
  );
};

export default App;