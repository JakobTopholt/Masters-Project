import React from "react";
import TopButtons from "../components/TopButtons";

const TypingTest: React.FC = () => {
  return (
    <div>
      <TopButtons />
      <div className="page-container">
        <div className="centerElements">
          <h1>Typing Test</h1>
          <p>
            Welcome to the typing test page! Here you can test your typing
            speed and accuracy.
          </p>
          <button className="startTestButton">Start Typing Test</button>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
