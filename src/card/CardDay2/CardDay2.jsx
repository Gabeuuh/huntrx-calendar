import React from "react";
import "./cardDay2.css";
import SoftButton from "../../button/Button";
import heroImg from "../../assets/monde1/danse/danse-hero.png";
import charManager from "../../assets/monde1/danse/danse-card1-manager.png";
import charTeen from "../../assets/monde1/danse/danse-card1-manager.png";

const CardDay2 = ({ onClose, onNext, onStart, page = 1 }) => {
  const isPage2 = page === 2;

  return (
    <div className="poc-card-container">
      <button className="poc-close-btn" onClick={onClose}>
        x
      </button>

      <div className="poc-header">
        <h2 className="poc-day-title">JOUR 2</h2>
        <p className="poc-subtitle">Défi danse !</p>
      </div>

      <div className="poc-media-container">
        <img src={heroImg} alt="Just Dance Huntrix" className="poc-main-img" />
      </div>

      <div className="poc-content-wrapper">
        <p className="poc-description">
          {isPage2
            ? "Pose ton téléphone, lance le défi. L'application détecte tes mouvements.\n\nÀ toi d’enchaîner les Perfect !"
            : "C'est l'heure de danser !\nSuis les pas, ressens le rythme.\nHuntr/x s'entraîne avec toi.\nPlus on danse ensemble,\nplus on devient fort.\n\nPartage tes mouvements,\ninspire la communauté\net brille !"}
        </p>

        <img
          src={isPage2 ? charTeen : charManager}
          alt="Personnage"
          className={isPage2 ? "poc-character-teen" : "poc-character-overlay"}
        />

        {isPage2 ? (
          <div className="poc-nav-row">
            <div className="poc-nav-arrow" onClick={onNext}>
              ←
            </div>
            <SoftButton onClick={onStart}>C'est parti !</SoftButton>
          </div>
        ) : (
          <div className="poc-nav-arrow" onClick={onNext}>
            →
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDay2;
