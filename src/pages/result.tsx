import React from "react";
import ResultHeader from "../components/ResultHeader";
import WpmDisplay from "../components/WpmDisplay";
import AccuracyDisplay from "../components/AccuracyDisplay";
import ResultActions from "../components/ResultActions";
import "../stylesheet.css"; // make sure path is correct

const Result: React.FC = () => {
  const testResults = { wpm: 78, accuracy: 94 };

  const handleTryAgain = () => {
    alert("Starting a new test...");
  };

  const handleSaveScore = () => {
    alert(`Score saved! WPM: ${testResults.wpm}, Accuracy: ${testResults.accuracy}%`);
  };

  return (
    <div className="result-container">
      <ResultHeader className="result-header" />
      <WpmDisplay wpm={testResults.wpm} className="result-wpm" />
      <p className="result-text">Save your score to see how you compare.</p>
      <AccuracyDisplay accuracy={testResults.accuracy} className="result-accuracy" />
      <ResultActions onSave={handleSaveScore} onTryAgain={handleTryAgain} className="result-actions" />
    </div>
  );
};

export default Result;
