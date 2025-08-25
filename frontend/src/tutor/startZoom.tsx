// ZoomLoginButton
import React, { useState } from 'react';


const ZoomLoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/api/zoom/authorize/';
  };

  return (
    <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">
      Connect Zoom
    </button>
  );
};

export default ZoomLoginButton;
