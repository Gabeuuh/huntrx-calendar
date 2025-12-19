import { useEffect, useRef, useState } from "react";
import cloudImg from "./assets/Nuage.png";
import segment1Img from "./assets/plateau/segment1.png";
import segment2Img from "./assets/plateau/segment2.png";
import segment3Img from "./assets/plateau/endPlateau.png";
import case1Disabled from "./assets/monde1/normalized/Case1-disable.png";
import case1Focus from "./assets/monde1/normalized/Case1-focus.png";
import case1Normal from "./assets/monde1/normalized/Case1-normal.png";
import case2Disabled from "./assets/monde1/normalized/Case2-disable.png";
import case2Focus from "./assets/monde1/normalized/Case2-focus.png";
import case2Normal from "./assets/monde1/normalized/Case2-normal.png";
import case3Disabled from "./assets/monde1/normalized/Case3-disable.png";
import case3Focus from "./assets/monde1/normalized/Case3-focus.png";
import case3Normal from "./assets/monde1/normalized/Case3-normal.png";
import case4Disabled from "./assets/monde1/normalized/Case4-disable.png";
import case4Focus from "./assets/monde1/normalized/Case4-focus.png";
import case4Normal from "./assets/monde1/normalized/Case4-normal.png";
import case5Disabled from "./assets/monde2/normalized/Case5-disable.png";
import case5Focus from "./assets/monde2/normalized/Case5-focus.png";
import case5Normal from "./assets/monde2/normalized/Case5-normal.png";
import case6Disabled from "./assets/monde2/normalized/Case6-disable.png";
import case6Focus from "./assets/monde2/normalized/Case6-focus.png";
import case6Normal from "./assets/monde2/normalized/Case6-normal.png";
import case7Disabled from "./assets/monde2/normalized/Case7-disable.png";
import case7Focus from "./assets/monde2/normalized/Case7-focus.png";
import case7Normal from "./assets/monde2/normalized/Case7-normal.png";
import case8Disabled from "./assets/monde2/normalized/Case8-disable.png";
import case8Focus from "./assets/monde2/normalized/Case8-focus.png";
import case8Normal from "./assets/monde2/normalized/Case8-normal.png";
import {
  currentDayStore,
  hydrateCurrentDayFromQuery,
  resolveDayState,
} from "./stores/dayStore";
import { useNanoStore } from "./stores/useNanoStore";
import CardDay2 from "./card/CardDay2/CardDay2";
import CardDay3 from "./card/CardDay3/CardDay3";
import CardDay4 from "./card/CardDay4/CardDay4";
import RewardScreens from "./card/CardDay3/RewardScreens";
import { KaraokeGame } from "./karaoke/KaraokeGame";
import { JustDanceGame } from "./just-dance/JustDanceGame";
import refVideo from "./assets/monde1/danse/danse-just-dance.mp4";
import { Navbar } from "./navbar/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { Onboarding } from "./onboarding/Onboarding";
import "./App.css";

const BOARD_WIDTH = 440;
const BOARD_HEIGHT = 956; // hauteur du segment de base (seg1)
const SEGMENT_OVERLAP = 286; // chevauchement vertical entre segments
const SEGMENT3_SHIFT = 0; // décale légèrement le segment 3 vers le bas pour l'enchaînement

const dayImages = {
  1: {
    disabled: case1Disabled,
    focus: case1Focus,
    normal: case1Normal,
  },
  2: {
    disabled: case2Disabled,
    focus: case2Focus,
    normal: case2Normal,
  },
  3: {
    disabled: case3Disabled,
    focus: case3Focus,
    normal: case3Normal,
  },
  4: {
    disabled: case4Disabled,
    focus: case4Focus,
    normal: case4Normal,
  },
  5: {
    disabled: case5Disabled,
    focus: case5Focus,
    normal: case5Normal,
  },
  6: {
    disabled: case6Disabled,
    focus: case6Focus,
    normal: case6Normal,
  },
  7: {
    disabled: case7Disabled,
    focus: case7Focus,
    normal: case7Normal,
  },
  8: {
    disabled: case8Disabled,
    focus: case8Focus,
    normal: case8Normal,
  },
};

const slots = [
  {
    id: "day-4",
    type: "day",
    number: 4,
    x: 280,
    y: 350,
    segment: "seg1",
  },
  {
    id: "day-3",
    type: "day",
    number: 3,
    x: 155,
    y: 525,
    segment: "seg1",
  },
  {
    id: "day-2",
    type: "day",
    number: 2,
    x: 315,
    y: 700,
    segment: "seg1",
  },
  {
    id: "day-1",
    type: "day",
    number: 1,
    x: 265,
    y: 900,
    segment: "seg1",
  },
  // Monde 2 (positions à ajuster après repérage précis)
  {
    id: "day-5",
    type: "day",
    number: 5,
    x: 175,
    y: 960,
    segment: "seg2",
  },
  {
    id: "day-6",
    type: "day",
    number: 6,
    x: 175,
    y: 720,
    segment: "seg2",
  },
  {
    id: "day-7",
    type: "day",
    number: 7,
    x: 325,
    y: 530,
    segment: "seg2",
  },
  {
    id: "day-8",
    type: "day",
    number: 8,
    x: 165,
    y: 350,
    segment: "seg2",
  },
];

function App() {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const bounceTimer = useRef(null);
  const touchStartY = useRef(0);
  const isTouching = useRef(false);
  const currentDay = useNanoStore(currentDayStore);
  const [layout, setLayout] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [showDay2, setShowDay2] = useState(false);
  const [day2Page, setDay2Page] = useState(1);
  const [showGame, setShowGame] = useState(false);
  const [showDay3, setShowDay3] = useState(false);
  const [showDay4, setShowDay4] = useState(false);
  const [showReward3, setShowReward3] = useState(false);
  const [rewardIndex, setRewardIndex] = useState(0);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [seg2Height, setSeg2Height] = useState(0);
  const [seg3Height, setSeg3Height] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    hydrateCurrentDayFromQuery();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const computed = (img.height / img.width) * BOARD_WIDTH;
      setSeg2Height(computed);
    };
    img.src = segment2Img;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const computed = (img.height / img.width) * BOARD_WIDTH;
      setSeg3Height(computed);
    };
    img.src = segment3Img;
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScale = () => {
      const scale = Math.max(
        container.clientWidth / BOARD_WIDTH,
        container.clientHeight / BOARD_HEIGHT
      );
      const offsetX = (container.clientWidth - BOARD_WIDTH * scale) / 2;
      const offsetY = 0; // plaque le plateau en haut pour voir les niveaux dès l'arrivée
      setLayout((prev) => {
        if (
          Math.abs(prev.scale - scale) < 0.0005 &&
          Math.abs(prev.offsetX - offsetX) < 0.5 &&
          Math.abs(prev.offsetY - offsetY) < 0.5
        ) {
          return prev;
        }
        return { scale, offsetX, offsetY };
      });
    };

    updateScale();

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(updateScale);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Prépare les segments du plateau du bas vers le haut
  // Segments empilés du bas vers le haut avec chevauchement
  const segments = [{ id: "seg1", img: segment1Img, height: BOARD_HEIGHT }];
  if (seg2Height > 0) {
    segments.push({ id: "seg2", img: segment2Img, height: seg2Height });
  }
  if (seg3Height > 0) {
    segments.push({ id: "seg3", img: segment3Img, height: seg3Height });
  }

  // Hauteur totale (on retire l'overlap pour chaque segment ajouté au-dessus)
  const totalHeight = segments.reduce((sum, seg, idx) => {
    return sum + seg.height - (idx > 0 ? SEGMENT_OVERLAP : 0);
  }, 0);

  // Offsets top en partant du bas : seg1 est le plus bas
  const segmentOffsetsTop = {};
  let cursor = totalHeight;
  segments.forEach((seg, idx) => {
    cursor -= seg.height;
    segmentOffsetsTop[seg.id] = cursor;
    cursor += SEGMENT_OVERLAP;
  });

  if (segmentOffsetsTop.seg3 !== undefined) {
    segmentOffsetsTop.seg3 += SEGMENT3_SHIFT;
  }

  const scaledBoardHeight = totalHeight * layout.scale;

  // Scroll auto vers le jour courant (paramètre ?day=) une fois les tailles connues
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || layout.scale === 0) return;
    const slot = slots.find((s) => s.number === currentDay);
    if (!slot) return;
    const segTop = segmentOffsetsTop[slot.segment] || 0;
    const target =
      (segTop + slot.y) * layout.scale - container.clientHeight * 0.25;
    container.scrollTo({
      top: Math.max(0, target),
      behavior: "auto",
    });
  }, [currentDay, layout.scale, segmentOffsetsTop]);

  useEffect(() => {
    const container = scrollRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const setBounce = (value, immediate) => {
      if (immediate) {
        track.classList.add("is-dragging");
      } else {
        track.classList.remove("is-dragging");
      }
      track.style.setProperty("--bounce", `${value}px`);
    };

    const settleBounce = () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
      bounceTimer.current = setTimeout(() => {
        setBounce(0, false);
      }, 120);
    };

    const onWheel = (event) => {
      if (event.deltaY >= 0 || container.scrollTop > 0) return;
      event.preventDefault();
      const amount = Math.min(32, Math.max(0, -event.deltaY * 0.25));
      setBounce(amount, false);
      settleBounce();
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      isTouching.current = true;
      touchStartY.current = event.touches[0].clientY;
      setBounce(0, true);
    };

    const onTouchMove = (event) => {
      if (!isTouching.current) return;
      if (container.scrollTop > 0) return;
      const delta = event.touches[0].clientY - touchStartY.current;
      if (delta <= 0) return;
      event.preventDefault();
      const amount = Math.min(36, delta * 0.35);
      setBounce(amount, true);
    };

    const onTouchEnd = () => {
      if (!isTouching.current) return;
      isTouching.current = false;
      setBounce(0, false);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
    };
  }, []);

  return (
    <main className="screen">
      <div className="ambient" aria-hidden="true" />
      <img className="cloud" src={cloudImg} alt="" aria-hidden="true" />
      <div className="scroll" ref={scrollRef}>
        <div className="track">
          <div
            className="board"
            ref={trackRef}
            style={{
              height: `${scaledBoardHeight}px`,
            }}
          >
            {segments.map((seg) => {
              const offsetTop = segmentOffsetsTop[seg.id] || 0;
              return (
                <div
                  key={seg.id}
                  className={`board-segment ${seg.id === "seg1" ? "base-seg" : ""} seg-${seg.id}`}
                  style={{
                    top: `${offsetTop * layout.scale}px`,
                    height: `${seg.height * layout.scale}px`,
                    backgroundImage: `url(${seg.img})`,
                  }}
                />
              );
            })}
            {slots.map((slot) => {
              const state = resolveDayState(slot.number, currentDay);
              const left = layout.offsetX + slot.x * layout.scale;
              const segTop = segmentOffsetsTop[slot.segment] || 0;
              const top = layout.offsetY + (segTop + slot.y) * layout.scale;
              const canOpenDay2 =
                slot.number === 2 && currentDay === 2 && state === "focus";
              const canOpenDay3 =
                slot.number === 3 && currentDay === 3 && state === "focus";
              const canOpenDay4 =
                slot.number === 4 && currentDay === 4 && state === "focus";
              const canOpen = canOpenDay2 || canOpenDay3 || canOpenDay4;
              return (
                <div
                  key={slot.id}
                  className={`slot slot-day slot-${state} ${
                    canOpen ? "slot-clickable" : ""
                  }`}
                  style={{
                    top: `${top}px`,
                    left: `${left}px`,
                  }}
                  onClick={() => {
                    if (canOpenDay2) {
                      setDay2Page(1);
                      setShowDay2(true);
                      setShowGame(false);
                    } else if (canOpenDay3) {
                      setShowDay3(true);
                      setShowGame(false);
                    } else if (canOpenDay4) {
                      setShowDay4(true);
                      setShowGame(false);
                    }
                  }}
                >
                  <img
                    className="slot-image"
                    src={dayImages[slot.number][state]}
                    alt={`Jour ${slot.number}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="scroll-spacer" style={{ height: 0 }} />
      </div>
      <AnimatePresence>
        {showDay2 && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowDay2(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => {
                e.stopPropagation();
              }}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <CardDay2
                page={day2Page}
                onClose={() => setShowDay2(false)}
                onNext={() => setDay2Page((p) => (p === 1 ? 2 : 1))}
                onStart={() => {
                  setShowDay2(false);
                  setShowGame(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDay3 && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowDay3(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <CardDay3
                onClose={() => setShowDay3(false)}
                onActionPot={() => setShowDay3(false)}
                onActionRecipes={() => {
                  setShowDay3(false);
                  setRewardIndex(0);
                  setShowReward3(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGame && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowGame(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card game-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
              initial={{ y: 32, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 26, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <JustDanceGame
                referenceVideoUrl={refVideo}
                onClose={() => setShowGame(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDay4 && (
          <motion.div
            className="modal-overlay danger-overlay"
            onClick={() => setShowDay4(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <CardDay4
                onClose={() => setShowDay4(false)}
                onStart={() => {
                  setShowDay4(false);
                  setShowKaraoke(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReward3 && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowReward3(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{ width: "100%", height: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RewardScreens
                index={rewardIndex}
                onClose={() => setShowReward3(false)}
                onPrev={() =>
                  setRewardIndex((idx) => Math.max(0, idx - 1))
                }
                onNext={() =>
                  setRewardIndex((idx) =>
                    Math.min(3, idx + 1)
                  )
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <AnimatePresence>
        {showKaraoke && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowKaraoke(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <KaraokeGame
                onClose={() => setShowKaraoke(false)}
                autoStart
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </main>
  );
}

export default App;
