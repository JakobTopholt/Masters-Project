import React, { useState, useEffect, useRef } from "react";
import TopButtons from "../components/TopButtons";

const TypingTest: React.FC = () => {
  const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Test sentence",
    "Pack my box with five dozen liquor jugs.",
    "Sphinx of black quartz, judge my vow.",
    "How vexingly quick daft zebras jump!",
  ];

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [WPM, setWPM] = useState(0);
  const [CPM, setCPM] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Start timer when typing begins
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

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    initTyping();

    const elapsedTime = 60 - timeLeft;
    const charsTyped = value.length;

    if (elapsedTime > 0) {
      const cpm = Math.round((charsTyped / elapsedTime) * 60);
      const wpm = Math.round(cpm / 5);
      setCPM(cpm);
      setWPM(wpm);
    } else {
      setCPM(0);
      setWPM(0);
    }

    // Advance to next sentence when current one is fully typed
    const currentSentence = sentences[currentSentenceIndex];
    if (value.length >= currentSentence.length) {
      if (currentSentenceIndex < sentences.length - 1) {
        setCurrentSentenceIndex((prev) => prev + 1);
        setUserInput("");
      } else {
        // Finished all sentences
        clearInterval(timerRef.current!);
        setIsTyping(false);
      }
    }
  };

  // Reset everything
  const resetGame = () => {
    clearInterval(timerRef.current!);
    setUserInput("");
    setTimeLeft(60);
    setWPM(0);
    setCPM(0);
    setIsTyping(false);
    setCurrentSentenceIndex(0);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div>
      <TopButtons />
      <div className="page-container">
        <div className="centerElements">
          <h1>Typing Test</h1>

          {/* Sentence display */}
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
            {sentences[currentSentenceIndex].split("").map((char: string, i: number) => {
              const color = i < userInput.length ? "#333" : "#ccc"; // darker when typed
              return (
                <span key={i} style={{ color }}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={timeLeft === 0}
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

          {/* Stats */}
          <div style={{ marginTop: "1.5rem" }}>
            <p>
              <b>Time Left:</b> {timeLeft}s
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
