import React, { useCallback } from "react";

const controlsStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: 1000,
  display: "flex",
  gap: "10px",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  padding: "15px",
  borderRadius: "8px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
};

const buttonStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#4CAF50",
  color: "white",
  cursor: "pointer",
  fontWeight: "500",
  transition: "all 0.2s ease",
};

const colorInputStyle = {
  width: "50px",
  height: "35px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  outline: "none",
};

export default function UIControls({ onChangeModel, onChangeColor }) {
  const handleModelChange = useCallback(
    (model) => {
      onChangeModel(model);
    },
    [onChangeModel]
  );

  const handleColorChange = useCallback(
    (e) => {
      onChangeColor(e.target.value);
    },
    [onChangeColor]
  );

  return (
    <div style={controlsStyle}>
      <button
        style={buttonStyle}
        onClick={() => handleModelChange("eye")}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        👁️ Eye
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleModelChange("dino")}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        🦕 Dino
      </button>
      <input
        type="color"
        onChange={handleColorChange}
        defaultValue="#ffffff"
        style={colorInputStyle}
        title="Model rengini değiştir"
      />
    </div>
  );
}
