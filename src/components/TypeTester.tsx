import React from "react";
import TypingArea from "./TypingArea";

function startTypingTest() {
  window.location.href = "typingTest.html";
}

const TypeTester: React.FC = () => {
  return (
    <div>
      <button className="homeButton" onClick={startTypingTest}>
        Start Typing Test
      </button>
    </div>
  );
}

export default TypeTester;
