import React from "react";
import "./cardDay4.css";
import SoftButton from "../../button/Button";
import closeIcon from "../../assets/close.svg";
import heroImg from "../../assets/monde1/karaoke/image-hero-day4.png";
import characterImg from "../../assets/monde1/karaoke/character-day4.png";

const paragraphs = [
  "Attention... ce défi est biaisé ! Les Saja Boys ont effacé des paroles de notre musique.",
  "Aide-nous à retrouver nos mots, notre voix, notre force. Huntr/x compte sur toi !",
  "Complète les paroles et chante à pleine voix. Ta voix peut tout changer.",
];

const CardDay4 = ({ onClose, onStart }) => {
  return (
    <div className="day4-card shake">
      <button className="day4-close" onClick={onClose} aria-label="Fermer">
        <img src={closeIcon} alt="Fermer" />
      </button>

      <header className="day4-header">
        <h2 className="day4-title">JOUR 4</h2>
        <p className="day4-subtitle">Défi chant !</p>
      </header>

      <div className="day4-hero-wrapper">
        <img src={heroImg} alt="Paroles à compléter" className="day4-hero" />
      </div>

      <div className="day4-body">
        <img src={characterImg} alt="Personnage" className="day4-character" />
        <div className="day4-text">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      <div className="day4-actions">
        <SoftButton className="day4-cta" onClick={onStart}>
          Retrouve les paroles
        </SoftButton>
      </div>
    </div>
  );
};

export default CardDay4;
