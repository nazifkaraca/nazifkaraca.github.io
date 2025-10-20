import React, { useState, useCallback, useRef } from "react";
import ThreeScene from "./components/ThreeScene.jsx";
import UIControls from "./components/UIControls.jsx";
import DebugInfo from "./components/DebugInfo.jsx";

export default function App() {
  const [model, setModel] = useState("dino");
  const [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);
  const sceneRef = useRef(null);

  const handleModelChange = useCallback(
    (newModel) => {
      if (newModel !== model) {
        setIsLoading(true);
        setModel(newModel);
        // Loading will be handled by ThreeScene component
        setTimeout(() => setIsLoading(false), 1000);
      }
    },
    [model]
  );

  const handleColorChange = useCallback((newColor) => {
    setColor(newColor);
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <ThreeScene ref={sceneRef} modelName={model} color={color} />
      <UIControls
        onChangeModel={handleModelChange}
        onChangeColor={handleColorChange}
      />

      {sceneRef.current && (
        <DebugInfo
          sceneRef={sceneRef.current.sceneRef}
          objectRef={sceneRef.current.objectRef}
          cameraRef={sceneRef.current.cameraRef}
        />
      )}

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <div>Model yükleniyor...</div>
          <div style={{ marginTop: "10px", fontSize: "24px" }}>⏳</div>
        </div>
      )}
    </div>
  );
}
