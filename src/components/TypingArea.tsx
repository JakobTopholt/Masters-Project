import React from 'react';

interface TypingAreaProps {
  typingText: string;
  inpFieldValue: string;
  timeLeft: number;
  mistakes: number;
  WPM: number;
  CPM: number;
  initTyping: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  resetGame: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  typingText,
  inpFieldValue,
  timeLeft,
  mistakes,
  WPM,
  CPM,
  initTyping,
  handleKeyDown,
  resetGame,
}) => {
  return (
    <div className="section">
      <div className="section1">
        <p id="paragraph">{typingText}</p>  
      </div>
      <div className="section2">
        <ul className="resultDetails">
          <li className="time">
            <p>Time Left:</p>
            <span>
              <b>{timeLeft}</b>s
            </span>
          </li>
          <li className="mistake">
            <p>Mistakes:</p>
            <span>{mistakes}</span>
          </li>
          <li className="wpm">
            <p>WPM:</p>
            <span>{WPM}</span>
          </li>
          <li className="cpm">
            <p>CPM:</p>
            <span>{CPM}</span>
          </li>
        </ul>
        <button onClick={resetGame} className="btn">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default TypingArea;
