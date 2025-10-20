import React, { useEffect, useState } from "react";

const DebugInfo = ({ sceneRef, objectRef, cameraRef }) => {
  const [debugInfo, setDebugInfo] = useState({
    sceneExists: false,
    objectExists: false,
    cameraPosition: null,
    sceneChildren: 0,
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const object = objectRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;

      let objectInfo = "❌";
      if (object) {
        objectInfo = `✅ (${object.children?.length || 0} children, visible: ${
          object.visible
        })`;
      }

      setDebugInfo({
        sceneExists: !!scene,
        objectExists: !!object,
        objectInfo,
        cameraPosition: camera
          ? `x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(
              2
            )}, z: ${camera.position.z.toFixed(2)}`
          : null,
        sceneChildren: scene ? scene.children.length : 0,
        objectPosition: object
          ? `x: ${object.position.x.toFixed(2)}, y: ${object.position.y.toFixed(
              2
            )}, z: ${object.position.z.toFixed(2)}`
          : null,
        objectScale: object ? `${object.scale.x.toFixed(2)}` : null,
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [sceneRef, objectRef, cameraRef]);

  const debugStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "15px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "12px",
    zIndex: 1001,
    minWidth: "250px",
  };

  return (
    <div style={debugStyle}>
      <h4>🔍 Debug Info</h4>
      <div>Scene: {debugInfo.sceneExists ? "✅" : "❌"}</div>
      <div>Object: {debugInfo.objectInfo || "❌"}</div>
      <div>Scene Children: {debugInfo.sceneChildren}</div>
      <div>Camera Pos: {debugInfo.cameraPosition || "❌"}</div>
      {debugInfo.objectPosition && (
        <div>Object Pos: {debugInfo.objectPosition}</div>
      )}
      {debugInfo.objectScale && (
        <div>Object Scale: {debugInfo.objectScale}</div>
      )}
    </div>
  );
};

export default DebugInfo;
