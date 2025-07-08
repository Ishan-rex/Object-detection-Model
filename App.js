import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [annotatedPath, setAnnotatedPath] = useState(null);
  const [realtimeResult, setRealtimeResult] = useState([]);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const font = document.createElement("link");
    font.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/25/audio_a14d1bb402.mp3");

    const playSound = () => {
      if (audio.readyState >= 3) {
        audio.play().catch((e) => console.warn("Audio play error:", e));
      }
    };

    const elements = document.querySelectorAll("button, input[type='file']");
    elements.forEach(el => el.addEventListener("click", playSound));

    return () => {
      elements.forEach(el => el.removeEventListener("click", playSound));
    };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:5000/detect/image", formData);
      setResult(res.data.detections);
      setAnnotatedPath("http://localhost:5000/image/" + res.data.image_path.split("/").pop());
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    setVideo(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:5000/detect/video", formData);
      setResult(res.data.detections);
      setAnnotatedPath("http://localhost:5000/image/" + res.data.image_path.split("/").pop());
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      intervalRef.current = setInterval(async () => {
        const canvas = document.createElement("canvas");
        const video = videoRef.current;
        if (!video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("frame", blob);
          try {
            const res = await axios.post("http://localhost:5000/detect/frame", formData);
            setRealtimeResult(res.data.detections);
            setAnnotatedPath("http://localhost:5000/image/" + res.data.image_path.split("/").pop());
          } catch (err) {
            console.error(err);
          }
        }, "image/jpeg");
      }, 2000);
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setRealtimeResult([]);
  };

  return (
    <div className="App">
      <header className="navbar">
        <div className="nav-container">
          <div className="logo neon-flicker">AI Vision</div>
          <ul className="nav-menu">
            <li><a href="#image">Image</a></li>
            <li><a href="#video">Video</a></li>
            <li><a href="#realtime">Real-Time</a></li>
          </ul>
        </div>
      </header>

      <main className="main-content">
        <section id="image" className="section fade-in">
          <div className="detection-header">
            <h2 className="neon-flicker">Image Detection</h2>
            <p>Upload an image to detect objects</p>
          </div>

          <div className="detection-container">
            <div className="upload-area">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="upload-btn scale-hover" />
              <p>Supported: JPG, PNG, WebP</p>
            </div>

            <div className="demo-area">
              {annotatedPath ? (
                <img src={annotatedPath} alt="Annotated Result" className="demo-image scale-hover" />
              ) : (
                <div className="demo-image">🖼️ Annotated result will appear here</div>
              )}

              {result && (
                <div className="detection-results">
                  <h4>Detected Objects:</h4>
                  {result.map((obj, idx) => (
                    <div key={idx} className="object-tag">
                      {obj.name || obj.label} ({(obj.confidence || obj.conf || 0).toFixed(2)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="video" className="section fade-in">
          <div className="detection-header">
            <h2 className="neon-flicker">Video Detection</h2>
            <p>Upload a video file for frame detection</p>
          </div>

          <div className="detection-container">
            <div className="upload-area">
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="upload-btn scale-hover" />
              <p>Supported: MP4, AVI, MOV</p>
            </div>

            <div className="demo-area">
              {annotatedPath ? (
                <img src={annotatedPath} alt="Detected Frame" className="demo-image scale-hover" />
              ) : (
                <div className="demo-image">🎞️ Frame analysis result appears here</div>
              )}

              {result && (
                <div className="detection-results">
                  <h4>Detected Objects:</h4>
                  {result.map((obj, idx) => (
                    <div key={idx} className="object-tag">
                      {obj.name || obj.label} ({(obj.confidence || obj.conf || 0).toFixed(2)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="realtime" className="section fade-in">
          <div className="detection-header">
            <h2 className="neon-flicker">Real-time Detection</h2>
            <p>Live camera feed with object detection</p>
          </div>

          <div className="detection-container">
            <div>
              <div className="camera-feed">
                <video ref={videoRef} autoPlay muted playsInline className="demo-image" />
              </div>
              <div className="control-panel">
                <button className="control-btn scale-hover pulse-btn" onClick={startCamera}>Start</button>
                <button className="control-btn scale-hover" onClick={stopCamera}>Stop</button>
              </div>
            </div>

            <div className="demo-area">
              {annotatedPath && (
                <img src={annotatedPath} alt="Live Detection" className="demo-image scale-hover" />
              )}
              {realtimeResult.length > 0 && (
                <div className="detection-results">
                  <h4>Live Detected Objects:</h4>
                  {realtimeResult.map((obj, idx) => (
                    <div key={idx} className="object-tag">
                      {obj.name || obj.label} ({(obj.confidence || obj.conf || 0).toFixed(2)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
