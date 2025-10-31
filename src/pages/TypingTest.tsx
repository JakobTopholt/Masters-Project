import React, { useState, useEffect, useRef } from "react";
import TopButtons from "../components/TopButtons";

const TypingTest: React.FC = () => {
  const [typingText, setTypingText] = useState(
    "The quick brown fox jumps over the lazy dog."
  );
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [mistakes, setMistakes] = useState(0);
  const [WPM, setWPM] = useState(0);
  const [CPM, setCPM] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Start typing test timer
  const initTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTyping(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle typing logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    initTyping();

    const textArray = typingText.split("");
    const inputArray = value.split("");
    let errorCount = 0;

    inputArray.forEach((char, i) => {
      if (char !== textArray[i]) errorCount++;
    });

    setMistakes(errorCount);

    const correctChars = inputArray.length - errorCount;
    const elapsedTime = 60 - timeLeft;

    if (elapsedTime > 0) {
      const cpm = Math.round((correctChars / elapsedTime) * 60);
      const wpm = Math.round(cpm / 5);
      setCPM(cpm);
      setWPM(wpm);
    } else {
      setCPM(0);
      setWPM(0);
    }
  };

  const resetGame = () => {
    clearInterval(timerRef.current!);
    setUserInput("");
    setTimeLeft(60);
    setMistakes(0);
    setWPM(0);
    setCPM(0);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  // Clean up interval
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Automatically focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <TopButtons />
      <div className="page-container">
        <div className="centerElements">
          <h1>Typing Test</h1>

          {/* Hidden input for capturing typing */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={timeLeft === 0}
            style={{
              opacity: 0,
              position: "absolute",
              pointerEvents: "none",
            }}
          />

          {/* Click area to focus hidden input */}
          <div
            onClick={() => inputRef.current?.focus()}
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
            }}
          >
            {typingText.split("").map((char, i) => {
              let color = "";
              if (i < userInput.length) {
                color = char === userInput[i] ? "green" : "red";
              } else if (i === userInput.length && isTyping) {
                color = "gray";
              }
              return (
                <span key={i} style={{ color }}>
                  {char}
                </span>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <p>
              <b>Time Left:</b> {timeLeft}s
            </p>
            <p>
              <b>Mistakes:</b> {mistakes}
            </p>
            <p>
              <b>WPM:</b> {WPM}
            </p>
            <p>
              <b>CPM:</b> {CPM}
            </p>
            <button onClick={resetGame} className="btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
