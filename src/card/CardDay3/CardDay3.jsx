import React from "react";
import "./cardDay3.css";
import SoftButton from "../../button/Button";
import closeIcon from "../../assets/close.svg";
import heroImg from "../../assets/monde1/cadeau/image-hero-day3.png";
import characterImg from "../../assets/monde1/cadeau/character-day3.png";

const copyTop = [
  "Huntr/x a décidé de te gâter !",
  "Leurs recettes de nouilles préférées sont dévoilées. Poulet, boeuf ou crevettes. Leur secret pour tenir le rythme.",
];

const copyBottom =
  "Découvre-les dans l’app ou craque pour le pot prêt à déguster mais chut c’est secret !";

const CardDay3 = ({ onClose, onActionPot, onActionRecipes }) => {
  return (
    <div className="day3-card">
      <button className="day3-close" onClick={onClose} aria-label="Fermer">
        <img src={closeIcon} alt="Fermer" />
      </button>

      <header className="day3-header">
        <h2 className="day3-title">JOUR 3</h2>
        <p className="day3-subtitle">Cadeau !</p>
      </header>

      <div className="day3-hero-wrapper">
        <img src={heroImg} alt="Huntrix cadeau" className="day3-hero" />
      </div>

      <div className="day3-body">
        <img src={characterImg} alt="Personnage" className="day3-character" />
        <div className="day3-text">
          {copyTop.map((line, idx) => (
            <p key={idx} className="day3-mainText">{line}</p>
          ))}
        </div>
      </div>

      <div className="day3-bottom-text">
        <p>{copyBottom}</p>
      </div>

      <div className="day3-actions">
        <SoftButton onClick={onActionPot}>Achète les pots</SoftButton>
        <SoftButton onClick={onActionRecipes}>Découvre les recettes</SoftButton>
      </div>
    </div>
  );
};

export default CardDay3;
