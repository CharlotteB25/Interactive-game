import React, { useState, useRef } from "react";
import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const correctAnswer = "knowledge";

export default function RiddleTerminal({ onSolved, position = [0, 1, 0] }) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim().toLowerCase() === correctAnswer) {
      setFeedback("✅ Correct! Unlocking...");
      onSolved?.(); // notify parent
    } else {
      setFeedback("❌ Nope. Try again!");
      // Play a fail sound or animation here
    }
  };

  return (
    <RigidBody type="fixed" position={position}>
      {/* Optional: Replace with a magical book model or glowing orb */}
      {/* <mesh>
        <boxGeometry args={[1.5, 1.2, 0.2]} />
        <meshStandardMaterial color="purple" />
      </mesh>
      */}
      <Html position={[-0.5, 1.5, 0]}>
        <div
          style={{
            background: "rgba(0,0,0,0.75)",
            padding: "1rem",
            borderRadius: "10px",
            width: "220px",
            color: "white",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          <p>
            <strong>🧠 Riddle:</strong>
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            What grows with sharing
            <br />
            but shrinks with silence?
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your answer..."
              style={{
                width: "100%",
                padding: "0.3rem",
                marginTop: "0.5rem",
                borderRadius: "5px",
                border: "none",
                textAlign: "center",
              }}
            />
          </form>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>{feedback}</p>
        </div>
      </Html>
    </RigidBody>
  );
}
// Note: You can add sound effects or animations for correct/incorrect answers
// by using the useEffect hook to play audio files or trigger animations when the feedback state changes.
// You can also use the onSolved prop to trigger any parent component logic, like unlocking a door or revealing a secret passage.
// Make sure to import this component in your main scene and pass the onSolved prop to handle the riddle completion logic.
