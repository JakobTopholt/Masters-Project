import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TopButtonsProps {
  onModeSelect: (mode: "stationary" | "walking" | "stairs") => void;
}

const TopButtons: React.FC<TopButtonsProps> = ({ onModeSelect }) => {
  const navigate = useNavigate(); // <-- hook to navigate programmatically

  const goHome = () => {
    navigate("/"); // <-- React route for home page
    };

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>("stationary");

  const handleToggleClick = () => {
    setShowDropdown((prev) => !prev);
  };

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMode(e.target.value);
    onModeSelect(e.target.value); // send selected mode to parent
    setShowDropdown(false);
  };

  return (
    <div className="topButtons">
      <button className="homeButton" onClick={goHome}>
        [Home]
      </button>
      <div className = "toggleWrapper">
      <button className="toggleButton" onClick={handleToggleClick}>
        [Toggle]
      </button>

      {showDropdown && (
        <select
          className="modeDropdown"
          value={selectedMode}
          onChange={handleModeChange}
        >
          <option value="stationary">Stationary</option>
          <option value="walking">Walking</option>
          <option value="stairs">Stairs</option>
        </select>
      )}
         </div>
    </div>
  );
};

export default TopButtons;
