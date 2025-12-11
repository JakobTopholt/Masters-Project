import React, { useState, useEffect, useRef } from "react";
import TopButtons from "../components/TopButtons";
import TypingBox from "../components/TypingBox.tsx";
import TypingInput from "../components/TypingInput.tsx";
import TypingStats from "../components/TypingStats.tsx";
import ExportButton from "../components/ExportButton.tsx";

const TypingTest: React.FC = () => {
  const sentences = [
    "The pharaohs of ancient Egypt built magnificent pyramids.",
    "These pyramids served as tombs for their kings and queens.",
    "They have been admired for centuries.",
    "and are a site that draws millions of tourists each year.",
    "archeologists continue to study them to learn more about them",
  ];

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [WPM, setWPM] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [errors, setErrors] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const testCompleted = useRef(false);

  // A state where we can store the keys pressed and sentences typed
  const [sentencesTyped, setSentencesTyped] = useState<string[]>([]);
  const [keyLog, setKeyLog] = useState<
    { timestamp: number; key: string; sentenceIndex: number; valueAfter: string }[]
  >([]);

  const initTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTyping(false);
            endTimeRef.current = Date.now();
            testCompleted.current = true;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // take the value of a keypress and log it with timestamp and current sentence state
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let valueAfter = userInput;
    if (e.key === "Backspace") {
      valueAfter = userInput.slice(0, -1);
    } else if (e.key === "Delete") {
      valueAfter = userInput;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      valueAfter = userInput + e.key;
      // Handling of shortcut keys such as ctrl arrow to jump in text
    } else {
      // other keys (Enter, Shift, Arrow...) keep current value
      valueAfter = userInput;
    }

    setKeyLog((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        key: e.key,
        sentenceIndex: currentSentenceIndex,
        valueAfter,
      },
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentSentence = sentences[currentSentenceIndex];

    if (value.length > currentSentence.length) {
      return;
    }

    // Track total characters typed
    if (value.length > userInput.length) {
      setTotalCharsTyped((prev) => prev + 1);
    }

    setUserInput(value);
    initTyping();

    // Count correct characters and errors in current input
    let correctInCurrent = 0;
    let errorsInCurrent = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentSentence[i]) {
        correctInCurrent++;
      } else {
        errorsInCurrent++;
      }
    }

    // Update errors (only count new errors)
    if (value.length > userInput.length && errorsInCurrent > 0) {
      setErrors((prev) => prev + 1);
    }

    const totalCorrect = totalCorrectChars + correctInCurrent;
    const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
    const elapsedMinutes = Math.max(elapsedMs / 60000, 0.1);

    const wpm = Math.round((totalCorrect / 5) / elapsedMinutes);
    setWPM(wpm);

    if (value.length === currentSentence.length) {
      // push the completed sentence (so mistakes don't carry over)
      setSentencesTyped((prev) => [...prev, value]);

      setTotalCorrectChars(totalCorrect);

      if (currentSentenceIndex < sentences.length - 1) {
        setCurrentSentenceIndex((prev) => prev + 1);
        setUserInput("");
      } else {
        clearInterval(timerRef.current!);
        setIsTyping(false);
        endTimeRef.current = Date.now();
        testCompleted.current = true;
      }
    }
  };

  const exportTestData = () => {
    const finishedSentences = [...sentencesTyped];
    // include current in-progress sentence if any characters typed and not already counted
    if (userInput.length > 0 && (finishedSentences.length <= currentSentenceIndex)) {
      finishedSentences.push(userInput);
    }

    const testData = {
      timestamp: new Date().toISOString(),
      duration:
        startTimeRef.current && endTimeRef.current
          ? (endTimeRef.current - startTimeRef.current) / 1000
          : 60 - timeLeft,
      wpm: WPM,
      accuracy:
        totalCharsTyped > 0 ? ((totalCorrectChars / totalCharsTyped) * 100).toFixed(2) : "0.00",
      totalCharactersTyped: totalCharsTyped,
      correctCharacters: totalCorrectChars,
      errors: errors,
      sentencesCompleted:
        currentSentenceIndex + (userInput.length === sentences[currentSentenceIndex].length ? 1 : 0),
      totalSentences: sentences.length,
      completed: testCompleted.current || timeLeft === 0,
      sentencesTyped: finishedSentences,
      keyLog: keyLog,
    };

    const jsonStr = JSON.stringify(testData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `typing-test-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetGame = () => {
    clearInterval(timerRef.current!);
    setUserInput("");
    setTimeLeft(60);
    setWPM(0);
    setIsTyping(false);
    setCurrentSentenceIndex(0);
    setTotalCorrectChars(0);
    setTotalCharsTyped(0);
    setErrors(0);
    startTimeRef.current = null;
    endTimeRef.current = null;
    testCompleted.current = false;
    inputRef.current?.focus();

    // clear new state
    setSentencesTyped([]);
    setKeyLog([]);
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
          <TypingBox sentence={sentences[currentSentenceIndex]} userInput={userInput} />
          <TypingInput
            inputRef={inputRef}
            userInput={userInput}
            onChange={handleInputChange}
            disabled={timeLeft === 0}
            onKeyDown={handleKeyDown}
          />
          <TypingStats timeLeft={timeLeft} WPM={WPM} onReset={resetGame} />
          {(timeLeft === 0 || testCompleted.current) && <ExportButton onExport={exportTestData} />}
        </div>
      </div>
    </div>
  );
};

export default TypingTest;