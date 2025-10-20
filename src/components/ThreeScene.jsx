import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadGLTFModel } from "./ModelLoader.jsx";

const ThreeScene = forwardRef(function ThreeScene({ modelName, color }, ref) {
  const mountRef = useRef(null);
  const objectRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Scene initialization - only once
  useEffect(() => {
    if (!mountRef.current || sceneRef.current) return;

    console.log("🎬 Initializing Three.js scene...");
    const currentMount = mountRef.current;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404040); // Light gray background for visibility
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 2, 15); // Better initial position (slightly elevated)
    camera.lookAt(0, 0, 0); // Look at the origin where models will be centered
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add additional light from opposite direction
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    console.log("💡 Lights added to scene");

    // Add a wireframe sphere as reference point at origin
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const referenceSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    referenceSphere.position.set(0, 0, 0); // At origin
    scene.add(referenceSphere);

    // Add axes helper for reference
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    console.log("🔴 Reference wireframe sphere and axes added");

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controlsRef.current = controls;

    // Mouse tracking
    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5;
    };

    // Resize handler
    const onResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (controls) controls.update();

      // Eye tracking animation
      if (objectRef.current && modelName === "eye") {
        objectRef.current.rotation.y = THREE.MathUtils.lerp(
          objectRef.current.rotation.y,
          mouseRef.current.x * 3,
          0.05
        );
        objectRef.current.rotation.x = THREE.MathUtils.lerp(
          objectRef.current.rotation.x,
          mouseRef.current.y * 2,
          0.05
        );
      }

      renderer.render(scene, camera);
    };

    // Add event listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    // Start animation
    animate();

    console.log("✅ Three.js scene initialized successfully");

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);

      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose resources
      if (renderer) {
        renderer.dispose();
      }
      if (controls) {
        controls.dispose();
      }
    };
  }, []); // Scene initialization only once

  // Model loading effect
  useEffect(() => {
    if (sceneRef.current && cameraRef.current) {
      console.log(`🎭 Loading model: ${modelName} with color: ${color}`);
      loadGLTFModel(
        modelName,
        sceneRef.current,
        objectRef,
        color,
        cameraRef.current
      );
    }
  }, [modelName, color]);

  // Expose refs for debugging
  useImperativeHandle(ref, () => ({
    sceneRef,
    objectRef,
    cameraRef,
  }));

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
});

export default ThreeScene;
