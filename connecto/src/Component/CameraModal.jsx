import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaTimes, FaCamera, FaVideo, FaBroadcastTower, FaCircle, FaStop } from 'react-icons/fa';
import { AuthContext } from '../Context/AuthContext';
import styles from '../css/CameraModal.module.css';
import { buildHeaders, jsonHeaders } from './authFetch';

const MODES = ['POST', 'STORY', 'REEL', 'LIVE'];

function CameraModal({ onClose }) {
  const { token } = useContext(AuthContext);
  const [mode, setMode] = useState('STORY');
  const [stream, setStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Failed to access webcam:", err);
        setCameraError(true);
      }
    };
    getMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (mode === 'LIVE') {
      if (isLive) {
        setIsLive(false);
        onClose();
      } else {
        setIsLive(true);
      }
      return;
    }

    if (mode === 'POST' || mode === 'STORY') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedMedia({ type: 'image', url, blob });
      }, 'image/jpeg');
    }
  };

  const startRecording = () => {
    if ((mode === 'REEL' || mode === 'STORY') && stream) {
      chunksRef.current = [];
      
      let options = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          options = { mimeType: 'video/webm;codecs=vp9' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }
      }
      
      try {
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const mimeType = mediaRecorder.mimeType || 'video/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setCapturedMedia({ type: 'video', url, blob });
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("MediaRecorder creation failed, trying default options:", err);
        try {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          mediaRecorder.onstop = () => {
            const mimeType = mediaRecorder.mimeType || 'video/webm';
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            setCapturedMedia({ type: 'video', url, blob });
          };
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
          setIsRecording(true);
        } catch (e2) {
          console.error("Failed to start MediaRecorder:", e2);
        }
      }
    }
  };

  const stopRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleShare = async () => {
    if (!capturedMedia || uploading) return;
    setUploading(true);

    try {
      const formData = new FormData();
      const mimeType = capturedMedia.blob.type || '';
      const isMp4 = mimeType.includes('mp4');
      const ext = capturedMedia.type === 'image' 
        ? '.jpg' 
        : (isMp4 ? '.mp4' : '.webm');
      formData.append('file', capturedMedia.blob, `capture_${Date.now()}${ext}`);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: buildHeaders(token),
        body: formData
      });

      let url = '';
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        url = data.url;
      } else {
       
        url = capturedMedia.url;
      }

      let endpoint = '';
      let bodyData = {};

      if (mode === 'POST') {
        endpoint = '/api/posts';
        bodyData = { caption, image: url };
      } else if (mode === 'REEL') {
        endpoint = '/api/reels';
        bodyData = { caption, videoUrl: url };
      } else if (mode === 'STORY') {
        endpoint = '/api/stories';
        bodyData = { caption, mediaUrl: url, mediaType: capturedMedia.type };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify(bodyData)
      });

      onClose();
    } catch (err) {
      console.error(err);
      onClose(); 
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.cameraOverlay} onClick={onClose}>
      <div className={styles.cameraModal} onClick={e => e.stopPropagation()}>
        
        <div className={styles.cameraHeader}>
          <h3>Create {mode}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        
        <div className={styles.modeTabs}>
          {MODES.map(m => (
            <button
              key={m}
              className={`${styles.modeTab} ${mode === m ? styles.active : ''}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {cameraError ? (
          <div className={styles.noCameraState}>
            <FaCamera />
            <p>Camera access denied or not available.<br />Please allow camera access and try again.</p>
            <div style={{ marginTop: '20px' }}>
              <button
                className={styles.uploadBtn}
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = mode === 'REEL' ? 'video/*' : 'image/*,video/*';
                  fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCapturedMedia({
                        type: file.type.startsWith('video') ? 'video' : 'image',
                        url,
                        blob: file
                      });
                      setCameraError(false);
                    }
                  };
                  fileInput.click();
                }}
              >
                Upload File from Device
              </button>
            </div>
          </div>
        ) : !capturedMedia ? (
          <>
           
            <div className={styles.videoPreview}>
              {isLive && (
                <div className={styles.liveIndicator}>
                  <div className={styles.liveDot} />
                  LIVE
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <textarea
              className={styles.captionInput}
              placeholder="Add a caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={2}
            />

            <div className={styles.cameraControls}>
              <button className={styles.actionBtn} title="Flip camera">
                <FaCamera />
              </button>

              <button
                className={`${styles.captureBtn} ${isRecording ? styles.recording : ''}`}
                onClick={handleCapture}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              >
                <span className={styles.captureBtnIcon}>
                  {mode === 'LIVE' ? (isLive ? <FaStop /> : <FaBroadcastTower />) :
                   isRecording ? <FaStop /> : <FaCircle />}
                </span>
              </button>

              <button className={styles.actionBtn} title="Video mode">
                <FaVideo />
              </button>
            </div>
          </>
        ) : (
          <>
           
            <div className={styles.capturedPreview}>
              {capturedMedia.type === 'image' ? (
                <img src={capturedMedia.url} alt="preview" />
              ) : (
                <video src={capturedMedia.url} controls autoPlay loop />
              )}
            </div>

            <textarea
              className={styles.captionInput}
              placeholder="Add a caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={2}
            />

            <div className={styles.postActions}>
              <button className={styles.retakeBtn} onClick={() => setCapturedMedia(null)}>
                Retake
              </button>
              <button className={styles.uploadBtn} onClick={handleShare} disabled={uploading}>
                {uploading ? 'Sharing...' : `Share to ${mode}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CameraModal;
