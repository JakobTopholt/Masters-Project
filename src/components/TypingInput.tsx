import React from "react";
import type { RefObject } from "react";

interface TypingInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const TypingInput: React.FC<TypingInputProps> = ({
  inputRef,
  userInput,
  onChange,
  disabled,
}) => {
  return (
    <input
      ref={inputRef}
      type="text"
      value={userInput}
      onChange={onChange}
      disabled={disabled}
      style={{
        padding: "0.75rem 1rem",
        fontSize: "1.2rem",
        border: "2px solid #aaa",
        borderRadius: "8px",
        width: "500px",
        fontFamily: "monospace",
      }}
      placeholder="Start typing here..."
    />
  );
};

export default TypingInput;
