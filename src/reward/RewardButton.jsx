import React from "react";
import "./rewardButton.css";

const RewardButton = ({
  label = "Réclame ta récompense",
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className="reward-btn"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default RewardButton;
