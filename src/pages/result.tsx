import React from "react";

// Reusable Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "rounded-2xl px-8 py-2 font-semibold transition-colors duration-200";
  const variantStyles =
    variant === "primary"
      ? "bg-[#f59e42] hover:bg-[#e08a2e] text-black"
      : "bg-white/20 hover:bg-white/30 text-white";

  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${className}`} />
  );
};

// Props for test results (for future dynamic use)
interface TestResultsProps {
  wpm: number;
  accuracy: number;
  onTryAgain: () => void;
}

const Result: React.FC = () => {
  // Temporary dummy data
  const testResults = { wpm: 78, accuracy: 94 };

  const handleTryAgain = () => {
    alert("Starting a new test...");
    // TODO: navigate back to TypingTest page when integrated
  };

  const handleSaveScore = () => {
    alert(`Score saved! WPM: ${testResults.wpm}, Accuracy: ${testResults.accuracy}%`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0e0e0e] px-4 text-center">
      <h2 className="text-white text-2xl font-semibold mb-4">Typing Test Results</h2>
      <div className="text-white text-6xl mb-6">{testResults.wpm} wpm</div>
      <p className="text-white/80 mb-4">
        Save your score to see how you compare.
      </p>
      <div className="text-white/70 mb-8">Accuracy: {testResults.accuracy}%</div>
      <div className="flex gap-4 justify-center">
        <Button onClick={handleSaveScore}>Save score</Button>
        <Button onClick={handleTryAgain} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  );
};

export default Result;
