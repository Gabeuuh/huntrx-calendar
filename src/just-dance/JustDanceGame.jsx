import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase/supabase";
import SoftButton from "../button/Button";
import "./just-dance.css";
import closeIcon from "../assets/close.svg";
import RewardButton from "../reward/RewardButton";

const RECORD_DURATION_MS = 10000;
const WEBHOOK_URL = "https://apizee.app.n8n.cloud/webhook/getScoreDance";

export function JustDanceGame({ referenceVideoUrl, onClose, onWin }) {
  const liveVideoRef = useRef(null);
  const referenceVideoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [recordedUrl, setRecordedUrl] = useState("");
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState("idle"); // idle | requesting | done
  const hasAwardedRef = useRef(false);

  const isWinner = scoreStatus === "done" && score != null && score > 50;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      stopStream();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setScore(null);
      setScoreStatus("idle");
      hasAwardedRef.current = false;
    };
  }, [recordedUrl]);

  useEffect(() => {
    if (isWinner && !hasAwardedRef.current) {
      hasAwardedRef.current = true;
      onWin && onWin();
    }
  }, [isWinner, onWin]);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 24, max: 24 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
      setStatus("ready");
    } catch (err) {
      setError("Camera inaccessible : " + err.message);
      setStatus("error");
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
      if (!streamRef.current) return;
    }
    setError("");
    chunksRef.current = [];
    const mimeType =
      MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setStatus("recorded");
    };

    recorder.start();
    setStatus("recording");

    clearTimer();
    timerRef.current = setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
      clearTimer();
    }, RECORD_DURATION_MS);
  };

  const extractScore = (text) => {
    if (text == null) return null;

    // Handle non-string inputs gracefully
    if (typeof text === "number") return text;
    if (typeof text === "object") {
      if (typeof text.score === "number") return text.score;
      if (Array.isArray(text)) {
        for (const item of text) {
          const found = extractScore(item);
          if (found != null) return found;
        }
      }
      const nestedText = text?.content?.parts?.[0]?.text;
      if (nestedText) {
        const nestedScore = extractScore(nestedText);
        if (nestedScore != null) return nestedScore;
      }
      try {
        text = JSON.stringify(text);
      } catch {
        return null;
      }
    }

    if (typeof text !== "string") return null;

    // Strip fences like ```json ... ```
    const cleaned = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1");

    try {
      const parsed = JSON.parse(cleaned);
      const parsedScore = extractScore(parsed);
      if (parsedScore != null) return parsedScore;
    } catch {
      // ignore parse errors
    }

    const match = cleaned.match(/score\s*[:=]\s*([0-9]+)/i);
    return match ? Number(match[1]) : null;
  };

  const callWebhookScore = async (publicUrl) => {
    try {
      setScoreStatus("requesting");
      setError("");
      const body = new URLSearchParams({ videoUrl: publicUrl });
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error("Webhook non accessible");
      const text = await res.text();
      const receivedScore = extractScore(text);
      setScore(receivedScore ?? null);
      setScoreStatus(receivedScore != null ? "done" : "idle");
      if (receivedScore == null) {
        setError("Score non parse : " + text.slice(0, 140));
      }
    } catch (err) {
      setError("Score indisponible : " + err.message);
      setScoreStatus("idle");
    }
  };

  const uploadRecording = async () => {
    if (!recordedUrl) return;
    try {
      setStatus("uploading");
      setError("");
      const response = await fetch(recordedUrl);
      const blob = await response.blob();
      const path = `sessions/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("dance-captures")
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: blob.type || "video/webm",
        });
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage
        .from("dance-captures")
        .getPublicUrl(path);
      if (data?.publicUrl) {
        await callWebhookScore(data.publicUrl);
      }
      setStatus("done");
    } catch (err) {
      setError("Upload Supabase impossible : " + err.message);
      setStatus("error");
    }
  };

  const resetRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl("");
    setStatus("ready");
    setScore(null);
    setScoreStatus("idle");
  };

  const playReference = () => {
    if (referenceVideoRef.current) {
      referenceVideoRef.current.currentTime = 0;
      referenceVideoRef.current.play().catch(() => {});
    }
  };

  const renderPrimaryButton = () => {
    if (status === "idle" || status === "error") {
      return (
        <SoftButton onClick={startCamera} disabled={status === "recording"}>
          Ouvrir la camera
        </SoftButton>
      );
    }
    if (status === "ready") {
      return (
        <SoftButton
          onClick={() => {
            playReference();
            startRecording();
          }}
        >
          Filmer 10s
        </SoftButton>
      );
    }
    if (status === "recording") {
      return <SoftButton disabled>Enregistrement...</SoftButton>;
    }
    if (status === "recorded") {
      return <SoftButton onClick={uploadRecording}>Obtenir le resultat</SoftButton>;
    }
    if (status === "uploading") {
      return <SoftButton disabled>Envoi en cours...</SoftButton>;
    }
    if (status === "done") {
      return <SoftButton onClick={resetRecording}>Recommencer</SoftButton>;
    }
    return null;
  };

  return (
    <div className="jd-screen">
      <div className="jd-panel">
        <button
          className="jd-close"
          type="button"
          onClick={() => {
            if (onClose) onClose();
          }}
          aria-label="Fermer"
        >
          <img src={closeIcon} alt="Fermer" />
        </button>
        <h1 className="jd-title">DEFI JUST DANCE</h1>
        <p className="jd-subtitle">
          Regarde la video, filme-toi pendant 10 secondes, puis on envoie ta
          danse.
        </p>

        <div className="jd-media">
          <div className="jd-media-block">
            <div className="jd-label">Video de reference</div>
            {referenceVideoUrl ? (
              <video
                className="jd-video"
                src={referenceVideoUrl}
                ref={referenceVideoRef}
                controls
                preload="metadata"
                playsInline
              />
            ) : (
              <div className="jd-placeholder">Ajoute l'URL de la video</div>
            )}
          </div>

          <div className="jd-media-block">
            <div className="jd-label">Ta camera</div>
            {!recordedUrl && (
              <video
                className="jd-video jd-video-live"
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
              />
            )}
            {recordedUrl && (
              <div className="jd-preview">
                <div className="jd-label">Apercu 10s</div>
                <video
                  className="jd-video"
                  src={recordedUrl}
                  controls
                  preload="metadata"
                />
              </div>
            )}
          </div>
        </div>

        {error && <div className="jd-error">{error}</div>}

        <div className="jd-actions">{renderPrimaryButton()}</div>
        {scoreStatus === "requesting" && (
          <div className="jd-info">Analyse de la danse en cours...</div>
        )}
        {scoreStatus === "done" && score != null && (
          <div className="jd-success">
            Score danse : <strong>{score}/100</strong>
          </div>
        )}

        {isWinner && (
          <div className="jd-end-screen">
            <button
              className="jd-end-close"
              type="button"
              aria-label="Fermer"
              onClick={() => onClose && onClose()}
            >
              <img src={closeIcon} alt="Fermer" />
            </button>
            <div className="jd-end-body">
              <RewardButton
                label="Réclame ta récompense"
                onClick={() => onClose && onClose()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
