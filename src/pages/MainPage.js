import React, { useEffect, useRef } from 'react';
import { Experience } from "../components/Experience.js";
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import { OrthographicCamera } from "@react-three/drei";
const MainPage = () => {

  const navigate = useNavigate();
  const handleDiaryClick = () => {
    navigate("/diary");
    console.log("Diary object clicked");
    // Perform any other desired actions
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    console.log("Dashboard object clicked");
    // Perform any other desired actions
  };
  

  return (
    <div style={{ position: "relative", width: 1000, height: 1000 }}>
      <h1>Main Page</h1>
      <Canvas
      orthographic
        camera={{
          zoom: 100,
          position: [0, 0, 10],
          near: 0.1,
          far: 1000,
        }}>
       <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={10} near={0.1} far={1000} />
      <Experience />
    </Canvas>
    </div>
  );
};

export default MainPage;
