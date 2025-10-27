import React from "react";
import { useNavigate } from "react-router-dom";
import TopButtons from "../components/TopButtons";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const goToTypingTest = () => {
    navigate("/typing-test");
  };

  return (
    <div>
      <TopButtons />
      <div className="page-container">
        <div className="centerElements">
          <h1>The Typing Test Platform</h1>
          <button className="gameButton" onClick={goToTypingTest}>
            Goto test!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
