import React from "react";
import { useNavigate } from "react-router-dom";

const TopButtons: React.FC = () => {
  const navigate = useNavigate(); // <-- hook to navigate programmatically

  const goHome = () => {
    navigate("/"); // <-- React route for home page
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
