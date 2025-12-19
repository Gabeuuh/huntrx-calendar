import { useMemo, useState } from "react";
import "./onboarding.css";
import cardMira from "../assets/accueil/Carte-Mira.png";
import cardRumi from "../assets/accueil/Carte-Rumi.png";
import cardZoey from "../assets/accueil/Carte-Zoey.png";
import screen1Bg from "../assets/accueil/accueil-screen1.png";
import screen2Bg from "../assets/accueil/accueil-screen2.png";
import screen3Bg from "../assets/accueil/accueil-screen3.png";
import screen4Bg from "../assets/accueil/accueil-screen4.png";
import screen5Bg from "../assets/accueil/accueil-screen5.png";
import screen6Bg from "../assets/accueil/accueil-screen6.png";
import RewardButton from "../reward/RewardButton";

export function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState("Rumi");

  const canNext = pseudo.trim().length > 0;
  const fanAngles = [-12, 0, 12];

  const steps = useMemo(
    () => [
      {
        key: "pseudo",
        bg: screen1Bg,
        content: (
          <>
            <input
              className="onb-input"
              placeholder="Ton pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
            />
            <RewardButton
              label="Suivant"
              onClick={() => canNext && setStep(1)}
              disabled={!canNext}
            />
          </>
        ),
      },
      {
        key: "avatar",
        bg: screen2Bg,
        content: (
          <>
            <div className="onb-cards">
              {[
                { id: "Zoey", img: cardZoey },
                { id: "Rumi", img: cardRumi },
                { id: "Mira", img: cardMira },
              ].map((item, idx) => (
                <button
                  key={item.id}
                  className={`onb-card ${avatar === item.id ? "selected" : ""}`}
                  style={{ "--fan-angle": `${fanAngles[idx] || 0}deg` }}
                  onClick={() => setAvatar(item.id)}
                >
                  <img src={item.img} alt={item.id} loading="lazy" />
                </button>
              ))}
            </div>
            <div className="onb-actions">
              <RewardButton
                label="Suivant"
                onClick={() => setStep(2)}
              />
              <RewardButton label="Précédent" onClick={() => setStep(0)} />
            </div>
          </>
        ),
      },
      {
        key: "obj-1",
        bg: screen3Bg,
        content: (
          <>
            <div className="onb-name">
              {pseudo ? `${pseudo}` : "Hey joueur"}
            </div>
            <RewardButton label="Suivant" onClick={() => setStep(3)} />
          </>
        ),
      },
      {
        key: "obj-2",
        bg: screen4Bg,
        content: (
          <RewardButton label="Suivant" onClick={() => setStep(4)} />
        ),
      },
      {
        key: "obj-3",
        bg: screen5Bg,
        content: (
          <RewardButton label="Suivant" onClick={() => setStep(5)} />
        ),
      },
      {
        key: "obj-4",
        bg: screen6Bg,
        content: (
          <RewardButton
            label="Commencer l'aventure"
            onClick={() => onDone && onDone({ pseudo, avatar })}
          />
        ),
      },
    ],
    [avatar, canNext, onDone, pseudo]
  );

  const currentStep = steps[step];

  return (
    <div className="onb-overlay">
      <div
        className={`onb-panel onb-panel-${currentStep.key}`}
        style={{ backgroundImage: `url(${currentStep.bg})` }}
      >
        <div className="onb-inner">
          <div className="onb-body">{currentStep.content}</div>
        </div>
      </div>
    </div>
  );
}
