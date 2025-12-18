import React from "react";
import "./cardDay2.css";
import SoftButton from "../../button/Button";
import heroImg from "../../assets/monde1/danse/danse-hero.png";
import charManager from "../../assets/monde1/danse/danse-card1-manager.png";
import charTeen from "../../assets/monde1/danse/manager-page2.png";
import closeIcon from "../../assets/close.svg";
import arrowIcon from "../../assets/arrow.svg";

const page1Text =
  "C'est l'heure de danser !\nSuis les pas, ressens le rythme.\nHuntr/x s'entraîne avec toi.\nPlus on danse ensemble,\nplus on devient fort.\n\nPartage tes mouvements,\ninspire la communauté\net brille !";

const page2Text =
  "Pose ton téléphone, lance le défi. L'application détecte tes mouvements.\n\nÀ toi d'enchaîner les Perfect !";

const CardDay2 = ({ onClose, onNext, onStart, page = 1 }) => {
  const renderPage1 = () => (
    <div className="poc-body poc-body--page1">
      <div className="poc-row">
        <img src={charManager} alt="Personnage" className="poc-character" />
        <p className="poc-description">{page1Text}</p>
      </div>
      <div className="poc-nav-arrow" onClick={onNext}>
        <img src={arrowIcon} alt="Suivant" className="poc-arrow-icon rotate" />
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="poc-body poc-body--page2">
      <p className="poc-description">{page2Text}</p>
      <div className="poc-cta-row">
        <div className="poc-nav-arrow" onClick={onNext}>
          <img src={arrowIcon} alt="Précédent" className="poc-arrow-icon" />
        </div>
        <div className="poc-cta-with-character">
          <img src={charTeen} alt="Personnage" className="poc-character page2-character" />
          <SoftButton onClick={onStart}>C'est parti !</SoftButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="poc-card-container">
      <button className="poc-close-btn" onClick={onClose}>
        <img src={closeIcon} alt="Fermer" />
      </button>

      <div className="poc-header">
        <h2 className="poc-day-title">JOUR 2</h2>
        <p className="poc-subtitle">Défi danse !</p>
      </div>

      <div className="poc-media-container">
        <img src={heroImg} alt="Just Dance Huntrix" className="poc-main-img" />
      </div>

      {page === 2 ? renderPage2() : renderPage1()}
    </div>
  );
};

export default CardDay2;
