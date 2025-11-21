import React from "react";

interface AccuracyDisplayProps {
  accuracy: number;
  className?: string; 
}

const AccuracyDisplay: React.FC<AccuracyDisplayProps> = ({ accuracy, className }) => {
  return (
    <div className={className}>
      Accuracy: {accuracy}%
    </div>
  );
};

export default AccuracyDisplay;
