import React, { useState, useEffect, useRef } from "react";
import TopButtons from "../components/TopButtons";
import TypingBox from "../components/TypingBox.tsx";
import TypingInput from "../components/TypingInput.tsx";
import TypingStats from "../components/TypingStats.tsx";
import ExportButton from "../components/ExportButton.tsx";
import phrasesData from "../data/phrases.json";

const phrases: string[] = phrasesData as string[];

const TypingTest: React.FC = () => {
  const getShuffledSentences = () => [...phrases].sort(() => Math.random() - 0.5);

      const handleModeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as "stationary" | "walking" | "stairs";
        console.log("selected:", value);
        setMode(value);
};

  const [mode, setMode] = useState<"stationary" | "walking" | "stairs">("stationary"); // tracks condition
  const [sentences, setSentences] = useState<string[]>(getShuffledSentences());
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [WPM, setWPM] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [sentencesTyped, setSentencesTyped] = useState<
    { typed: string; expected: string }[]
  >([]);
  
  const [keyEvents, setKeyEvents] = useState<
    { timestamp: number; key: string; sentenceIndex: number; valueAfter: string}[]
  >([]);

  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [errors, setErrors] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const testCompleted = useRef(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentSentence = sentences[currentSentenceIndex];

    if (value.length > currentSentence.length) {
      return;
    }
  


    // Log input event
    setKeyEvents(prev => [
      ...prev,
      {timestamp: Date.now(),
        key: e.nativeEvent.data ?? e.nativeEvent.inputType, // key pressed
        sentenceIndex: currentSentenceIndex,
        valueAfter: value }
    ]);

    // Track total characters typed
    if (value.length > userInput.length) {
      setTotalCharsTyped(prev => prev + 1);
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
      setErrors(prev => prev + 1);
    }

    const totalCorrect = totalCorrectChars + correctInCurrent;
    const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
    const elapsedMinutes = Math.max(elapsedMs / 60000, 0.1);

    const wpm = Math.round((totalCorrect / 5) / elapsedMinutes);
    setWPM(wpm);

    if (value.length === currentSentence.length) {
      setTotalCorrectChars(totalCorrect);

      setSentencesTyped(prev => [
        ...prev,
        { typed: value, expected: currentSentence }
      ]);

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
    const testData = {
      mode: mode,
      timestamp: new Date().toISOString(),
      duration: startTimeRef.current && endTimeRef.current 
        ? (endTimeRef.current - startTimeRef.current) / 1000 
        : 60 - timeLeft,
      wpm: WPM,
      accuracy: totalCharsTyped > 0 
        ? ((totalCorrectChars / totalCharsTyped) * 100).toFixed(2) : "0.00",
      totalCharactersTyped: totalCharsTyped,
      correctCharacters: totalCorrectChars,
      errors: errors,
      sentencesCompleted: currentSentenceIndex + (userInput.length === sentences[currentSentenceIndex].length ? 1 : 0),
      totalSentences: sentences.length,
      completed: testCompleted.current || timeLeft === 0,
      sentencesTyped,
      keyLog: keyEvents
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
    setSentencesTyped([]);
    setKeyEvents([]);
    startTimeRef.current = null;
    endTimeRef.current = null;
    testCompleted.current = false;
    setSentences(getShuffledSentences());
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="page-container">
      <TopButtons onModeSelect={handleModeSelect} />

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
          onReset={resetGame}
        />

        {(timeLeft === 0 || testCompleted.current) && (
          <ExportButton onExport={exportTestData} />
        )}
      </div>
    </div>
  );

};

export default TypingTest;