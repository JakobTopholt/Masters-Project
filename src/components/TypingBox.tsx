import React from "react";

interface TypingBoxProps {
  sentence: string;
  userInput: string;
}

const TypingBox: React.FC<TypingBoxProps> = ({ sentence, userInput }) => {
  return (
    <div className="typingBox">
      {sentence.split("").map((char, i) => {
        const color = i < userInput.length ? "#333" : "#ccc";

        return (
          <span key={i} className="typingChar" style={{ color }}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default TypingBox;
