import React from "react";

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
