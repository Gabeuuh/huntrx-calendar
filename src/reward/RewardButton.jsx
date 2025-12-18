import React from "react";
import "./rewardButton.css";

const RewardButton = ({ label = "Réclame ta récompense", onClick }) => {
  return (
    <button className="reward-btn" type="button" onClick={onClick}>
      {label}
    </button>
  );
};

export default RewardButton;
