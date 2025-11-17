import React from "react";

interface ResultHeaderProps {
  className?: string; // allow passing a className
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ className }) => {
  return (
    <h2 className={className}>
      Typing Test
    </h2>
  );
};

export default ResultHeader;
