import "./progress-screen.css";
import progressBg from "../assets/jauge/jauge-background.png";

/**
 * Remplissage calibré sur 0-100 XP
 * - Danse : 20 XP
 * - Karaoké : 50 XP
 * - Recettes : 30 XP
 */
export function ProgressScreen({
  xp, // optionnel : si fourni, utilisé directement (0-100)
  danceDone = false,
  karaokeDone = false,
  recipesDone = false,
  onClose,
}) {
  const computedXp =
    typeof xp === "number"
      ? xp
      : (danceDone ? 20 : 0) +
        (karaokeDone ? 50 : 0) +
        (recipesDone ? 30 : 0);

  const clampedXp = Math.min(100, Math.max(0, computedXp));
  const percent = clampedXp; // déjà étalonné 0-100

  return (
    <div className="prog-overlay" onClick={onClose}>
      <div
        className="prog-panel"
        style={{ backgroundImage: `url(${progressBg})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="prog-circle">
          <div className="prog-fill" style={{ height: `${percent}%` }} />
        </div>
        <button
          className="prog-close"
          aria-label="Fermer"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
