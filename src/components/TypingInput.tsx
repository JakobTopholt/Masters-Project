import React from "react";
import type { RefObject } from "react";

interface TypingInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypingInput: React.FC<TypingInputProps> = ({
  inputRef,
  userInput,
  onChange,
  disabled,
  onKeyDown,
}) => {
  return (
    <input
      ref={inputRef}
      type="text"
      value={userInput}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder="Start typing here..."
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "0.75rem 1rem",
        fontSize: "clamp(1rem, 4vw, 1.2rem)",
        fontFamily: "monospace",
        border: "2px solid #aaa",
        borderRadius: "10px",
        boxSizing: "border-box",
        outline: "none",
        opacity: disabled ? 0.6 : 1,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#555")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#aaa")}
    />
  );
};

export default TypingInput;
