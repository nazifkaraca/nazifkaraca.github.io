import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const modelCache = new Map();

export function loadGLTFModel(name, scene, objectRef, color, camera) {
  console.log(`🔄 Loading model: ${name}`);

  // Clean up previous model
  if (objectRef.current) {
    scene.remove(objectRef.current);
    disposeObject(objectRef.current);
    objectRef.current = null;
  }

  // Check cache first
  if (modelCache.has(name)) {
    console.log(`📦 Using cached model: ${name}`);
    const cachedModel = modelCache.get(name);
    const object = cachedModel.clone();
    setupModel(object, scene, objectRef, color, camera);
    return;
  }

  // Load new model
  const modelPath = `/models/${name}/scene.gltf`;
  console.log(`📥 Loading from path: ${modelPath}`);

  loader.load(
    modelPath,
    (gltf) => {
      console.log(`✅ Model loaded successfully: ${name}`, gltf);
      const object = gltf.scene;

      // Cache the model
      modelCache.set(name, object.clone());

      setupModel(object, scene, objectRef, color, camera);
    },
    (xhr) => {
      if (xhr.total > 0) {
        const progress = ((xhr.loaded / xhr.total) * 100).toFixed(0);
        console.log(`📦 ${name} model: ${progress}% loaded`);
      }
    },
    (err) => {
      console.error(`❌ Model "${name}" yüklenemedi:`, err);
      console.error("Full error:", err);
    }
  );
}

function setupModel(object, scene, objectRef, color, camera) {
  console.log(`🎯 Setting up model:`, object);

  scene.add(object);
  objectRef.current = object;

  // Optimize materials
  optimizeMaterials(object);

  // Center and scale object
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  console.log(`📏 Model size: ${size}, center:`, center);

  object.position.sub(center);

  // Scale model if it's too small or too big
  let scale = 1;
  if (size < 1) {
    scale = 5 / size; // Make small objects bigger
  } else if (size > 10) {
    scale = 10 / size; // Make large objects smaller
  }

  if (scale !== 1) {
    object.scale.setScalar(scale);
    console.log(`🔍 Model scaled by: ${scale}`);
  }

  // Set camera position based on final model size
  const finalSize = size * scale;
  const distance = Math.max(finalSize * 2, 10); // Better distance calculation
  camera.position.set(0, 0, distance);

  // Make sure camera is looking at the centered object (which is now at origin)
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  console.log(
    `📷 Camera position set to: ${distance}, final model size: ${finalSize}`
  );
  console.log(`📦 Object position:`, object.position);
  console.log(`📦 Object scale:`, object.scale);
  console.log(`📦 Object visible:`, object.visible);
  console.log(`📦 Camera position:`, camera.position);
  console.log(
    `📦 Camera looking at:`,
    camera.getWorldDirection(new THREE.Vector3())
  );

  applyColor(object, color);

  // Add bounding box helper for debugging
  const boxHelper = new THREE.BoxHelper(object, 0x00ff00);
  scene.add(boxHelper);
  console.log(`📦 Bounding box helper added`);

  // Debug: Check if meshes are actually visible
  let meshCount = 0;
  object.traverse((child) => {
    if (child.isMesh) {
      meshCount++;
      console.log(
        `🔍 Mesh ${meshCount}: visible=${
          child.visible
        }, material color=${child.material.color?.getHexString()}`
      );
    }
  });

  // Force a render to ensure visibility
  console.log(
    `🎨 Model setup complete, object added to scene with ${object.children.length} children`
  );

  // Log scene objects for debugging
  console.log(`🌍 Scene now contains ${scene.children.length} objects`);
  console.log(`🎯 Found ${meshCount} meshes in model`);
}

function optimizeMaterials(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      console.log(`🎨 Found mesh: ${child.name}, material:`, child.material);

      // Enable frustum culling
      child.frustumCulled = true;

      // Make sure mesh is visible
      child.visible = true;

      // Ensure mesh casts and receives shadows
      child.castShadow = true;
      child.receiveShadow = true;

      // Optimize materials
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            optimizeMaterial(material);
            // Ensure material visibility
            material.transparent = false;
            material.opacity = 1.0;
            material.visible = true;
            material.side = THREE.DoubleSide; // Make sure both sides are visible
          });
        } else {
          optimizeMaterial(child.material);
          // Ensure material visibility
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.visible = true;
          child.material.side = THREE.DoubleSide; // Make sure both sides are visible
        }
      }
    }
  });
}

function optimizeMaterial(material) {
  // Ensure material is visible and properly configured
  material.flatShading = false;
  material.visible = true;
  material.transparent = false;
  material.opacity = 1.0;
  material.alphaTest = 0;
  material.side = THREE.DoubleSide;
  material.needsUpdate = true;

  // If it's a basic material, make sure it has proper color
  if (material.isMeshBasicMaterial) {
    // Ensure the material has a visible color (not completely black)
    if (!material.color || material.color.getHex() === 0x000000) {
      material.color.setHex(0xffffff); // Set to white if black
    }
  }
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          disposeMaterial(material);
        });
      } else {
        disposeMaterial(child.material);
      }
    }
  });
}

function disposeMaterial(material) {
  if (material.map) material.map.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  material.dispose();
}

export function applyColor(object, color) {
  if (!object) return;
  let materialCount = 0;

  object.traverse((child) => {
    if (child.isMesh && child.material) {
      materialCount++;

      if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          m.color.set(color);
          m.transparent = false;
          m.opacity = 1.0;
          m.visible = true;
          m.needsUpdate = true;
        });
      } else {
        child.material.color.set(color);
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.visible = true;
        child.material.needsUpdate = true;
      }
    }
  });

  console.log(`🎨 Applied color ${color} to ${materialCount} materials`);
}
