import React from "react";

interface TypingStatsProps {
  timeLeft: number;
  WPM: number;
  CPM: number;
  onReset: () => void;
}

const TypingStats: React.FC<TypingStatsProps> = ({
  timeLeft,
  WPM,
  CPM,
  onReset,
}) => {
  return (
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
      <button onClick={onReset} className="btn">
        Try Again
      </button>
    </div>
  );
};

export default TypingStats;
