import React from "react";

interface TypingStatsProps {
  timeLeft: number;
  onReset: () => void;
}

const TypingStats: React.FC<TypingStatsProps> = ({
  timeLeft,
  onReset,
}) => {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p>
        <b>Time Left:</b> {timeLeft}s
      </p>
      <button onClick={onReset} className="btn">
        Try Again
      </button>
    </div>
  );
};

export default TypingStats;
