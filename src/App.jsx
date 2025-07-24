import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { Leva } from "leva";

const App = () => {
  return (
    <>
      <Leva collapsed />
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [5, 0, -20],
        }}
      >
        <Experience />
      </Canvas>
    </>
  );
};

export default App;
