import { useState } from "react";
import trophyIcon from "../assets/navbar/trophee.svg";
import forestIcon from "../assets/navbar/chemin.svg";
import pinIcon from "../assets/navbar/lieu.svg";
import chatIcon from "../assets/navbar/chat.svg";
import "./navbar.css";

const tabs = [
  { id: "trophy", icon: trophyIcon, label: "Trophées" },
  { id: "forest", icon: forestIcon, label: "Parcours" },
  { id: "pin", icon: pinIcon, label: "Carte" },
  { id: "chat", icon: chatIcon, label: "Chat" },
];

export function Navbar() {
  const [active, setActive] = useState("forest");

  return (
    <nav className="nav-shell">
      {tabs.slice(0, 2).map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${active === tab.id ? "is-active" : ""}`}
          type="button"
          onClick={() => setActive(tab.id)}
        >
          <img src={tab.icon} alt={tab.label} />
          <span className="nav-indicator" />
        </button>
      ))}

      <div className="nav-center">
        <div className="nav-center-glow" />
        <div className="nav-center-half" />
      </div>

      {tabs.slice(2).map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${active === tab.id ? "is-active" : ""}`}
          type="button"
          onClick={() => setActive(tab.id)}
        >
          <img src={tab.icon} alt={tab.label} />
          <span className="nav-indicator" />
        </button>
      ))}
    </nav>
  );
}
