import React from "react";

interface TypingBoxProps {
  sentence: string;
  userInput: string;
}

const TypingBox: React.FC<TypingBoxProps> = ({ sentence, userInput }) => {
  return (
    <div
      className="typingBox"
      style={{
        cursor: "text",
        padding: "1rem",
        border: "2px solid #ccc",
        borderRadius: "8px",
        minWidth: "500px",
        minHeight: "100px",
        textAlign: "left",
        fontSize: "1.2rem",
        userSelect: "none",
        fontFamily: "monospace",
        marginBottom: "1rem",
      }}
    >
      {sentence.split("").map((char, i) => {
        const color = i < userInput.length ? "#333" : "#ccc";
        return (
          <span key={i} style={{ color }}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default TypingBox;
