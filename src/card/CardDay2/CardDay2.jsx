import React from 'react';
import './cardDay2.css';
import SoftButton from '../../button/Button'; 

const CardDay2 = ({ onClose, onNext, onStart }) => {
  return (
    <div className="poc-card-container">
      {/* Bouton de fermeture */}
      <button className="poc-close-btn" onClick={onClose}>×</button>
      
      {/* Header avec la police épaisse et italique */}
      <div className="poc-header">
        <h2 className="poc-day-title">JOUR 2</h2>
        <p className="poc-subtitle">Défi danse !</p>
      </div>

      {/* Image principale avec bordure blanche */}
      <div className="poc-media-container">
        <img 
          src="/assets/just-dance-banner.png" 
          alt="Just Dance Huntrix" 
          className="poc-main-img" 
        />
      </div>

      {/* Zone de contenu avec le personnage en overlay */}
      <div className="poc-content-wrapper">
        <p className="poc-description">
          C'est l'heure de danser ! Suis les pas, ressens le rythme. Huntr/x s'entraîne avec toi.
        </p>
        
        {/* Le personnage qui dépasse sur l'image et le texte */}
        <img 
          src="/assets/character-dancer.png" 
          alt="Character" 
          className="poc-character-overlay" 
        />

        {/* Petite flèche de navigation à droite */}
        <div className="poc-nav-arrow" onClick={onNext}>
          →
        </div>
      </div>

      {/* Bouton d'action principal */}
      <div className="poc-footer">
        <SoftButton onClick={onStart}>
          C'est parti !
        </SoftButton>
      </div>
    </div>
  );
};

export default CardDay2;