import { useEffect, useState } from "react";
import "./countdown-gate.css";
import countdownBg from "../assets/accueil/compte-a-rebours.png";
import startBg from "../assets/accueil/demarrage.png";

export function CountdownGate({ onDone }) {
  const [phase, setPhase] = useState("countdown"); // countdown | start
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          setTimeout(() => setPhase("start"), 400);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const format = (n) => String(n).padStart(2, "0");
  const countdownText = `00 : 00 : 00 : ${format(remaining)}`;

  return (
    <div className="cg-overlay">
      <div
        className={`cg-panel ${phase === "start" ? "cg-show-start" : ""}`}
        style={{
          backgroundImage: `url(${phase === "countdown" ? countdownBg : startBg})`,
        }}
        onClick={phase === "start" ? onDone : undefined}
        role={phase === "start" ? "button" : undefined}
        tabIndex={phase === "start" ? 0 : -1}
        aria-label={phase === "start" ? "Démarrer" : undefined}
      >
        {phase === "countdown" ? (
          <div className="cg-layer">
            <div className="cg-timer">{countdownText}</div>
          </div>
        ) : (
          <div className="cg-layer cg-layer-start" />
        )}
      </div>
    </div>
  );
}