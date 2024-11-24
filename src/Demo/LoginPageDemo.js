import React from "react";
import LoginPage from "../components/LoginPage";

const LoginPageDemo = () => {
  const handleLogin = (type) => {
    console.log(`Login selected: ${type === "existing" ? "Access Previous Assistants" : "Create a New Assistant"}`);
  };

  return (
    <div>
      <LoginPage onLogin={handleLogin} />
    </div>
  );
};

export default LoginPageDemo;
