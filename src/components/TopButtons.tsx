import React from "react";

const TopButtons: React.FC = () => {
  const goHome = () => {
    window.location.href = "index.html";
  };

  const toggleMode = () => {
    document.body.classList.toggle("dark");
  };

  return (
    <div className="topButtons">
      <button className="homeButton" onClick={goHome}>
        [Home]
      </button>
      <button className="toggleButton" onClick={toggleMode}>
        [Toggle]
      </button>
    </div>
  );
};

export default TopButtons;
