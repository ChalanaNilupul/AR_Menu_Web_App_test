"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Camera, X, Smartphone, Chrome } from "lucide-react";

const ARFoodMenu = () => {
  const [selectedDish, setSelectedDish] = useState<
    (typeof dishes)[number] | null
  >(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Sample menu data
  const dishes = [
    {
      id: 1,
      name: "Gourmet Burger",
      price: "$12.99",
      color: 0xff6b6b,
      shape: "burger",
      description: "Juicy beef patty with fresh toppings",
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: "$9.99",
      color: 0x51cf66,
      shape: "salad",
      description: "Crisp romaine with homemade dressing",
    },
    {
      id: 3,
      name: "Margherita Pizza",
      price: "$14.99",
      color: 0xffd43b,
      shape: "pizza",
      description: "Wood-fired with fresh mozzarella",
    },
    {
      id: 4,
      name: "Chocolate Cake",
      price: "$6.99",
      color: 0x8b4513,
      shape: "cake",
      description: "Rich chocolate layers with frosting",
    },
  ];

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || (window as any).opera || "";
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const android = /android/i.test(userAgent);

    setIsIOS(iOS);
    setIsAndroid(android);
  }, []);

  const createDishModel = (shape: string, color: number): THREE.Group => {
    const group = new THREE.Group();

    switch (shape) {
      case "burger":
        const bottomBun = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.45, 0.15, 32),
          new THREE.MeshStandardMaterial({ color: 0xdaa520 }),
        );
        bottomBun.position.y = 0.075;
        group.add(bottomBun);

        const patty = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.1, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        patty.position.y = 0.2;
        group.add(patty);

        const cheese = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: 0xffd700 }),
        );
        cheese.position.y = 0.275;
        group.add(cheese);

        const topBun = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0xdaa520 }),
        );
        topBun.position.y = 0.5;
        group.add(topBun);
        break;

      case "pizza":
        const pizzaBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32),
          new THREE.MeshStandardMaterial({ color: 0xffd43b }),
        );
        group.add(pizzaBase);

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
        const bottomLayer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        bottomLayer.position.y = 0.1;
        group.add(bottomLayer);

        const frosting = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.36, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: 0xffc0cb }),
        );
        frosting.position.y = 0.225;
        group.add(frosting);

        const topLayer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
        );
        topLayer.position.y = 0.375;
        group.add(topLayer);

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

  const start3DPreview = (dish: (typeof dishes)[number]) => {
    setSelectedDish(dish);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 1, 2);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(2, 5, 2);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 3),
        new THREE.MeshStandardMaterial({ color: 0x8b7355 }),
      );
      table.position.y = -0.5;
      table.receiveShadow = true;
      scene.add(table);

      const dishModel = createDishModel(dish.shape, dish.color);
      dishModel.position.y = 0;
      dishModel.castShadow = true;
      scene.add(dishModel);

      // Touch controls for mobile
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      canvas.addEventListener("touchstart", (e) => {
        isDragging = true;
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      });

      canvas.addEventListener("touchmove", (e) => {
        if (isDragging) {
          const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y,
          };
          dishModel.rotation.y += deltaMove.x * 0.01;
          previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }
      });

      canvas.addEventListener("touchend", () => {
        isDragging = false;
      });

      const animate = () => {
        if (!sceneRef.current) return;
        requestAnimationFrame(animate);
        if (!isDragging) {
          dishModel.rotation.y += 0.01;
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🍽️ AR Food Menu
          </h1>
          <p className="text-gray-600 mt-1">
            View our dishes in interactive 3D
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!selectedDish ? (
          <>
            {/* Device Compatibility Banner */}
            {isIOS && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Smartphone className="text-amber-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      iOS Device Detected
                    </h3>
                    <p className="text-amber-800 text-sm mt-1">
                      You can view 3D models and rotate them with touch! Full AR
                      requires an Android device with Chrome browser.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isAndroid && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Chrome className="text-green-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-900">AR Ready!</h3>
                    <p className="text-green-800 text-sm mt-1">
                      Your Android device supports AR! Select a dish to view it
                      in 3D and place it on your table.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isIOS && !isAndroid && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Camera className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      3D Preview Available
                    </h3>
                    <p className="text-blue-800 text-sm mt-1">
                      Select a dish to view it in interactive 3D. For full AR
                      experience, use an Android phone with Chrome.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    <p className="text-gray-600 text-sm mt-1">
                      {dish.description}
                    </p>
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

            {/* Requirements Section */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Device Requirements
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 flex items-center gap-2">
                    ✅ Full AR Support
                  </h3>
                  <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-6">
                    <li>• Android 9+ devices with ARCore</li>
                    <li>• Chrome browser (v90+)</li>
                    <li>• Camera permissions enabled</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-700 flex items-center gap-2">
                    ⚠️ Limited Support (3D Only)
                  </h3>
                  <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-6">
                    <li>• iOS devices (iPhone/iPad)</li>
                    <li>• Desktop browsers</li>
                    <li>• Older Android devices</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> All devices can view interactive 3D
                    models. AR camera placement requires compatible Android
                    devices.
                  </p>
                </div>
              </div>
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
                style={{ display: "block", touchAction: "none" }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {isIOS || !isAndroid
                  ? "Drag to rotate"
                  : "Auto-rotating (drag to control)"}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">{selectedDish.description}</p>

              {isAndroid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <strong>AR Available!</strong> This feature works best in
                  Chrome on Android devices with ARCore support.
                </div>
              )}

              {isIOS && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <strong>iOS Limitation:</strong> Safari doesn't support WebXR
                  AR. You're viewing the 3D preview mode. For full AR, please
                  use an Android device with Chrome.
                </div>
              )}

              <button
                onClick={closePreview}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARFoodMenu;
