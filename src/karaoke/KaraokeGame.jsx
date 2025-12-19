import { useEffect, useRef, useState } from "react";
import "./karaoke.css";
import closeIcon from "../assets/close.svg";
import endScreenImg from "../assets/monde1/karaoke/endScreen-karaoke.png";
import RewardButton from "../reward/RewardButton";
import karaokeSong from "../assets/monde1/karaoke/chanson-briller-karaoke.mp3";

const LYRICS = `On vise le top-op-op
C'est notre moment
Rien ne pourra nous arrêter
On est venues là pour briller
Oh, top-op-op
C'est notre moment
Rien ne pourra nous arrêter
On est venues là pour briller`;

// Masquage façon "N'oubliez pas les paroles"
const MASKED_LYRICS = [
  "On vise le ___-___-___",
  "C'est notre ______",
  "Rien ne pourra nous ______",
  "On est venues là pour ______",
  "Oh, ___-___-___",
  "C'est notre ______",
  "Rien ne pourra nous ______",
  "On est venues là pour ______",
];

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const computeScore = (expected, actual) => {
  const expWords = normalize(expected).split(" ").filter(Boolean);
  const actWords = normalize(actual).split(" ").filter(Boolean);
  if (!expWords.length || !actWords.length) return 0;
  let matches = 0;
  const used = new Set();
  actWords.forEach((word) => {
    const idx = expWords.findIndex((w, i) => w === word && !used.has(i));
    if (idx !== -1) {
      matches += 1;
      used.add(idx);
    }
  });
  return Math.min(100, Math.round((matches / expWords.length) * 100));
};

export function KaraokeGame({ onClose, onWin, autoStart = false }) {
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | countdown | listening | stopped | error
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const hasAwardedRef = useRef(false);

  useEffect(() => {
    // Prépare l'audio
    const audio = new Audio(karaokeSong);
    audio.loop = true;
    audioRef.current = audio;

    if (autoStart) {
      startCountdownOnly();
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Reconnaissance vocale non supportée sur ce navigateur.");
      setStatus("error");
      return;
    }
    setError("");
    const recog = new SpeechRecognition();
    recognitionRef.current = recog;
    recog.lang = "fr-FR";
    recog.continuous = true;
    recog.interimResults = false;

    const parts = [];
    recog.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          parts.push(event.results[i][0].transcript);
        }
      }
      const full = parts.join(" ").trim();
      setTranscript(full);
      if (full) {
        const computed = computeScore(LYRICS, full);
        setScore(computed);
        if (computed >= 80) {
          if (!hasAwardedRef.current) {
            hasAwardedRef.current = true;
            onWin && onWin();
          }
          setShowEnd(true);
        }
      }
    };

    recog.onerror = (event) => {
      setError(event.error || "Erreur micro");
      setStatus("error");
    };

    recog.onend = () => {
      setStatus((prev) => (prev === "listening" ? "stopped" : prev));
    };

    setTranscript("");
    setScore(null);
    setStatus("listening");
    recog.start();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const startCountdownOnly = () => {
    setRemaining(5);
    setStatus("countdown");
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus("stopped");
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="karaoke-overlay" onClick={onClose}>
      <div className="karaoke-panel evil" onClick={(e) => e.stopPropagation()}>
        <button className="karaoke-close" onClick={onClose} aria-label="Fermer">
          <img src={closeIcon} alt="Fermer" />
        </button>

        <h2 className="karaoke-title">Karaoké</h2>
        <p className="karaoke-sub">Chante pour retrouver les paroles !</p>
        <div className="karaoke-warning">Saja Boys brouillent ton micro...</div>

        <div className="karaoke-lyrics">
          {MASKED_LYRICS.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        <div className="karaoke-controls">
          {status !== "listening" ? (
            <button className="karaoke-btn" onClick={startListening}>
              Lancer l'enregistrement
            </button>
          ) : (
            <button className="karaoke-btn stop" onClick={stopListening}>
              Arrêter
            </button>
          )}
        </div>

        {status !== "idle" && remaining >= 0 && (
          <div className="karaoke-countdown">
            Plus que {remaining} seconde{remaining > 1 ? "s" : ""} pour
            s'enregistrer
          </div>
        )}

        {error && <div className="karaoke-error">{error}</div>}

        <div className="karaoke-output">
          <h4>Texte reconnu :</h4>
          <div className="karaoke-text">{transcript || "..."}</div>
        </div>

        {score != null && (
          <div className="karaoke-score">
            Score : <strong>{score}/100</strong>
          </div>
        )}
      </div>

      {showEnd && (
        <div className="karaoke-end" onClick={onClose}>
          <div
            className="karaoke-end-screen"
            style={{ backgroundImage: `url(${endScreenImg})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="karaoke-end-close"
              onClick={() => {
                setShowEnd(false);
                onClose && onClose();
              }}
              aria-label="Fermer"
            >
              <img src={closeIcon} alt="Fermer" />
            </button>
            <div className="karaoke-end-action">
              <RewardButton
                label="Réclame ta récompense"
                className="karaoke-end-reward-btn"
                onClick={() => {
                  setShowEnd(false);
                  onClose && onClose();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
