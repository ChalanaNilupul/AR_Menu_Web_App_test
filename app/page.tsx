"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Camera, RefreshCw, X } from "lucide-react";

const ARFoodMenu = () => {
  const [arSupported, setArSupported] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [selectedDish, setSelectedDish] = useState<{
    id: number;
    name: string;
    price: string;
    color: number;
    shape: string;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sample menu data
  const dishes = [
    {
      id: 1,
      name: "Gourmet Burger",
      price: "$12.99",
      color: 0xff6b6b,
      shape: "burger",
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: "$9.99",
      color: 0x51cf66,
      shape: "salad",
    },
    {
      id: 3,
      name: "Margherita Pizza",
      price: "$14.99",
      color: 0xffd43b,
      shape: "pizza",
    },
    {
      id: 4,
      name: "Chocolate Cake",
      price: "$6.99",
      color: 0x8b4513,
      shape: "cake",
    },
  ];

  useEffect(() => {
    // Check if WebXR is supported
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        setArSupported(supported);
      });
    }
  }, []);

  const createDishModel = (shape: string, color: number) => {
    const group = new THREE.Group();

    switch (shape) {
      case "burger":
        // Bottom bun
        const bottomBun = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.45, 0.15, 32),
          new THREE.MeshStandardMaterial({ color: 0xdaa520 }),
        );
        bottomBun.position.y = 0.075;
        group.add(bottomBun);

        // Patty
        const patty = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.1, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        patty.position.y = 0.2;
        group.add(patty);

        // Cheese
        const cheese = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: 0xffd700 }),
        );
        cheese.position.y = 0.275;
        group.add(cheese);

        // Top bun
        const topBun = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0xdaa520 }),
        );
        topBun.position.y = 0.5;
        group.add(topBun);
        break;

      case "pizza":
        // Pizza base
        const pizzaBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32),
          new THREE.MeshStandardMaterial({ color: 0xffd43b }),
        );
        group.add(pizzaBase);

        // Toppings
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const topping = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xff6347 }),
          );
          topping.position.set(
            Math.cos(angle) * 0.25,
            0.08,
            Math.sin(angle) * 0.25,
          );
          group.add(topping);
        }
        break;

      case "salad":
        // Bowl
        const bowl = new THREE.Mesh(
          new THREE.SphereGeometry(
            0.4,
            32,
            32,
            0,
            Math.PI * 2,
            Math.PI / 2,
            Math.PI / 2,
          ),
          new THREE.MeshStandardMaterial({ color: 0xffffff }),
        );
        group.add(bowl);

        // Salad leaves
        for (let i = 0; i < 12; i++) {
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x51cf66 }),
          );
          const angle = (i / 12) * Math.PI * 2;
          leaf.position.set(
            Math.cos(angle) * 0.2,
            0.1 + Math.random() * 0.1,
            Math.sin(angle) * 0.2,
          );
          group.add(leaf);
        }
        break;

      case "cake":
        // Bottom layer
        const bottomLayer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        bottomLayer.position.y = 0.1;
        group.add(bottomLayer);

        // Frosting
        const frosting = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.36, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: 0xffc0cb }),
        );
        frosting.position.y = 0.225;
        group.add(frosting);

        // Top layer
        const topLayer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        topLayer.position.y = 0.375;
        group.add(topLayer);

        // Cherry on top
        const cherry = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        );
        cherry.position.y = 0.5;
        group.add(cherry);
        break;
    }

    return group;
  };

  const start3DPreview = (dish: (typeof dishes)[0]) => {
    setSelectedDish(dish);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Setup scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      sceneRef.current = scene;

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 1, 2);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(2, 5, 2);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Add table
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 3),
        new THREE.MeshStandardMaterial({ color: 0x8b7355 }),
      );
      table.position.y = -0.5;
      table.receiveShadow = true;
      scene.add(table);

      // Add dish model
      const dishModel = createDishModel(dish.shape, dish.color);
      dishModel.position.y = 0;
      dishModel.castShadow = true;
      scene.add(dishModel);

      // Animation loop
      const animate = () => {
        if (!sceneRef.current) return;
        requestAnimationFrame(animate);
        dishModel.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    }, 100);
  };

  const closePreview = () => {
    setSelectedDish(null);
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    sceneRef.current = null;
  };

  const startAR = async () => {
    if (!navigator.xr) {
      alert(
        "WebXR is not supported on this device. Please use a compatible AR-enabled device.",
      );
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
      });
      setArActive(true);
      // AR session logic would go here
      alert(
        "AR mode activated! (Full AR implementation requires WebXR compatible device)",
      );
    } catch (error) {
      alert(
        "AR not available. Showing 3D preview instead. For full AR, please use an AR-compatible device.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🍽️ AR Food Menu
          </h1>
          <p className="text-gray-600 mt-1">
            View our dishes in 3D augmented reality
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!selectedDish ? (
          <>
            {/* AR Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Camera className="text-blue-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    AR Experience Available
                  </h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Select a dish to view it in 3D. On AR-enabled devices, you
                    can place it on your table!
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => start3DPreview(dish)}
                >
                  <div
                    className="h-48 flex items-center justify-center text-6xl"
                    style={{
                      backgroundColor: `#${dish.color.toString(16).padStart(6, "0")}20`,
                    }}
                  >
                    {dish.shape === "burger" && "🍔"}
                    {dish.shape === "pizza" && "🍕"}
                    {dish.shape === "salad" && "🥗"}
                    {dish.shape === "cake" && "🍰"}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      {dish.name}
                    </h3>
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      {dish.price}
                    </p>
                    <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Camera size={20} />
                      View in 3D
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 3D Preview */
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedDish.name}
                </h2>
                <p className="text-orange-100">{selectedDish.price}</p>
              </div>
              <button
                onClick={closePreview}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-96 bg-gray-900"
                style={{ display: "block" }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                Rotating 3D model
              </div>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={startAR}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Camera size={24} />
                View in AR on Your Table
              </button>

              <button
                onClick={closePreview}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Menu
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Note:</strong> Full AR placement requires a
                WebXR-compatible device (e.g., recent Android phones with
                Chrome/Edge). Desktop users will see the 3D preview above.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARFoodMenu;
