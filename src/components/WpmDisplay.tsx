import React from "react";

interface WpmDisplayProps {
  wpm: number;
  className?: string; // allow passing a className
}

const WpmDisplay: React.FC<WpmDisplayProps> = ({ wpm, className }) => {
  return (
    <div className={className}>
      {wpm} wpm
    </div>
  );
};

export default WpmDisplay;

