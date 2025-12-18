import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Card from "./card/CardDay2/CardDay2.jsx";
import HeroImage from "./assets/monde1/danse/danse-hero.png"
import Personnage from "./assets/monde1/danse/danse-card1-manager.png"
import refVideo from "./assets/monde1/danse/danse-just-dance.mp4"

import { JustDanceGame } from "./just-dance/JustDanceGame.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
   <JustDanceGame referenceVideoUrl={refVideo} /> 
   {/* <Card
      day="Jour 1"
      title="Bienvenue dans le calendrier Huntrx!"
      type="light"
      image={HeroImage}
      text="Découvre chaque jour une nouvelle surprise en ouvrant les cases du calendrier Huntrx. Amuse-toi bien!"
      character={Personnage}
      buttonLabel="Ouvrir la case"
      onButtonClick={() => alert("Case ouverte!")}
      showArrow={true}
      onArrowClick={() => alert("Flèche cliquée!")}
      onClose={() => alert("Card fermée!")}
    /> */}
  </StrictMode>
);
