"use client";

import { useEffect, useRef, useState } from "react";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream = null;
    let stopped = false;
    let timer = null;

    async function start() {
      try {
        const detector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
        });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onDetected(codes[0].rawValue);
              return;
            }
          } catch (e) {
            setError("The camera frame could not be read.");
          }
          timer = setTimeout(scan, 400);
        };
        scan();
      } catch (e) {
        setError("The camera could not be opened. Allow camera access or type the barcode number instead.");
      }
    }

    start();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <video ref={videoRef} className="w-full rounded-xl bg-black" playsInline muted></video>
      {error && <p className="mt-2 text-sm text-badfg" role="alert">{error}</p>}
      <button type="button" className="btn-soft mt-3" onClick={onClose}>Close camera</button>
    </div>
  );
}
