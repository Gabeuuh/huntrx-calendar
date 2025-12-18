import React from "react";
import RewardButton from "../../reward/RewardButton";
import closeIcon from "../../assets/close.svg";
import reward1 from "../../assets/monde1/cadeau/reward-screen1.png";
import reward2 from "../../assets/monde1/cadeau/reward-screen2.png";
import reward3 from "../../assets/monde1/cadeau/reward-screen3.png";
import reward4 from "../../assets/monde1/cadeau/reward-screen4.png";
import "./cardDay3.css";

const screens = [reward1, reward2, reward3, reward4];

const RewardScreens = ({ index = 0, onClose, onPrev, onNext }) => {
  const isFirst = index === 0;
  const isLast = index === screens.length - 1;

  return (
    <div className="reward3-overlay" onClick={onClose}>
      <div
        className="reward3-screen"
        style={{ backgroundImage: `url(${screens[index]})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="reward3-close" onClick={onClose} aria-label="Fermer">
          <img src={closeIcon} alt="Fermer" />
        </button>

        <div className="reward3-actions">
          {!isFirst && (
            <RewardButton label="Précédent" onClick={onPrev} />
          )}
          {!isLast && <RewardButton label="Suivant" onClick={onNext} />}
          {isLast && <RewardButton label="Fermer" onClick={onClose} />}
        </div>
      </div>
    </div>
  );
};

export default RewardScreens;
