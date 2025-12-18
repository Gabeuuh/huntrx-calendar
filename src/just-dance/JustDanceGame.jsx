import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase/supabase";
import SoftButton from "../button/Button";
import "./just-dance.css";

const RECORD_DURATION_MS = 10000;
const WEBHOOK_URL = "https://apizee.app.n8n.cloud/webhook/getScoreDance";

export function JustDanceGame({ referenceVideoUrl }) {
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [recordedUrl, setRecordedUrl] = useState("");
  const [uploadPath, setUploadPath] = useState("");
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState("idle"); // idle | requesting | done

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
    };
  }, [recordedUrl]);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStatus("ready");
    } catch (err) {
      setError("Caméra inaccessible : " + err.message);
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
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
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
      const match = text.match(/score\s*[:=]\s*([0-9]+)/i);
      const receivedScore = match ? Number(match[1]) : null;
      setScore(receivedScore ?? null);
      setScoreStatus("done");
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
      setUploadPath(path);
      setStatus("done");
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
    setUploadPath("");
    setStatus("ready");
    setScore(null);
    setScoreStatus("idle");
  };

  const renderPrimaryButton = () => {
    if (status === "idle" || status === "error") {
      return (
        <SoftButton onClick={startCamera} disabled={status === "recording"}>
          Ouvrir la caméra
        </SoftButton>
      );
    }
    if (status === "ready") {
      return <SoftButton onClick={startRecording}>Filmer 10s</SoftButton>;
    }
    if (status === "recording") {
      return <SoftButton disabled>Enregistrement...</SoftButton>;
    }
    if (status === "recorded") {
      return (
        <SoftButton onClick={uploadRecording}>Obtenir le résultat</SoftButton>
      );
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
        <h1 className="jd-title">Défi Just Dance</h1>
        <p className="jd-subtitle">
          Regarde la vidéo, filme-toi pendant 10 secondes, puis envoie ta danse.
        </p>

        <div className="jd-media">
          <div className="jd-media-block">
            <div className="jd-label">Vidéo de référence</div>
            {referenceVideoUrl ? (
              <video
                className="jd-video"
                src={referenceVideoUrl}
                controls
                preload="metadata"
              />
            ) : (
              <div className="jd-placeholder">Ajoute l'URL de la vidéo</div>
            )}
          </div>

          <div className="jd-media-block">
            <div className="jd-label">Ta caméra</div>
            {!recordedUrl && (
              <video
                className="jd-video jd-video-live"
                ref={videoRef}
                autoPlay
                playsInline
                muted
              />
            )}
            {recordedUrl && (
              <div className="jd-preview">
                <div className="jd-label">Aperçu 10s</div>
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
      </div>
    </div>
  );
}
