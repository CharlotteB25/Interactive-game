import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";

const App = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [0, 0, -25],
        }}
      >
        <Experience />
      </Canvas>
    </>
  );
};

export default App;
