import React from "react";

interface ResultActionsProps {
  onSave: () => void;
  onTryAgain: () => void;
  className?: string; // allow custom styling
}

const ResultActions: React.FC<ResultActionsProps> = ({
  onSave,
  onTryAgain,
  className,
}) => {
  return (
    <div className="flex justify-center gap-8">
      <button onClick={onSave} className="result-btn save-btn">
        Save score
      </button>

      <button onClick={onTryAgain} className="result-btn try-btn">
        Try again
      </button>
    </div>
  );
};

export default ResultActions;
