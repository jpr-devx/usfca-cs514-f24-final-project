import React from 'react';

const ChatInterface = ({ assistant }) => (
  <div
    className="flex flex-col items-center justify-center h-screen"
    style={{
      backgroundColor: 'lightyellow',
      fontFamily: 'Courier New, monospace',
      color: 'darkblue',
      border: '3px solid brown',
    }}
  >
    <h2
      className="text-2xl font-bold mb-6"
      style={{
        textDecoration: 'underline',
        fontSize: '2rem',
      }}
    >
      {assistant.name}
    </h2>
    <div
      className="w-3/4 h-3/4"
      style={{
        backgroundColor: 'beige',
        border: '3px solid black',
        boxShadow: '5px 5px 0px gray',
        padding: '10px',
      }}
    >
      <p
        style={{
          color: 'darkgreen',
          fontStyle: 'italic',
        }}
      >
        Start chatting with your assistant!
      </p>
    </div>
  </div>
);

export default ChatInterface;
