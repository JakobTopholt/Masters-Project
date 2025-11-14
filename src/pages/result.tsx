import React from "react";

// Temporary Button component
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
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${className}`}
    />
  );
};

const Result: React.FC = () => {
  // Dummy data for now — replace with actual test results later
  const testResults = { wpm: 78, accuracy: 94 };

  const handleTryAgain = () => {
    alert("Starting a new test...");
    // TODO: navigate to typing test page when integrated
  };

  const handleSaveScore = () => {
    alert(
      `Score saved! WPM: ${testResults.wpm}, Accuracy: ${testResults.accuracy}%`
    );
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#0e0e0e]">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-white mb-2 text-2xl font-semibold">Typing Test</h2>
        <div className="text-white text-8xl mb-8">{testResults.wpm} wpm</div>
        <p className="text-white/80 mb-8">
          Save your score to see how you compare.
        </p>
        <div className="text-white/70 mb-6">
          Accuracy: {testResults.accuracy}%
        </div>

        {/* Buttons with proper spacing */}
        <div className="flex gap-4 justify-center mt-6">
          <Button onClick={handleSaveScore}>Save score</Button>
          <Button onClick={handleTryAgain} variant="secondary">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;
