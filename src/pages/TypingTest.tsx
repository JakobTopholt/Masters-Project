import React, { useState, useEffect, useRef } from "react";
import TopButtons from "../components/TopButtons";
import TypingBox from "../components/TypingBox.tsx";
import TypingInput from "../components/TypingInput.tsx";
import TypingStats from "../components/TypingStats.tsx";

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

    const currentSentence = sentences[currentSentenceIndex];
    if (value.length >= currentSentence.length) {
      if (currentSentenceIndex < sentences.length - 1) {
        setCurrentSentenceIndex((prev) => prev + 1);
        setUserInput("");
      } else {
        clearInterval(timerRef.current!);
        setIsTyping(false);
      }
    }
  };

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
          <TypingBox
            sentence={sentences[currentSentenceIndex]}
            userInput={userInput}
          />
          <TypingInput
            inputRef={inputRef}
            userInput={userInput}
            onChange={handleInputChange}
            disabled={timeLeft === 0}
          />
          <TypingStats
            timeLeft={timeLeft}
            WPM={WPM}
            CPM={CPM}
            onReset={resetGame}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
