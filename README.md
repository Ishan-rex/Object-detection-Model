# Object-detection-Model
AI Vision Pro is a full-stack AI project that enables object detection in images, videos, and real-time webcam feeds using the powerful YOLOv8 model. It combines a modern, responsive React frontend with a Flask backend powered by Ultralytics YOLOv8, delivering accurate object classification and visualization.

project-root/
├── backend/
│   ├── app.py
│   ├── yolov8 model files (optional or loaded from ultralytics)
│   └── static/image/ (for annotated outputs)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── ... other React files

-Make sure to install these inside your Python virtual environment:

pip install flask flask-cors ultralytics opencv-python

-Frontend (React + Styling + Icons):

Ensure you're in the frontend folder, then run:

npm install

TO run the project:
1. START the python flask server in the terminal
2. Open cmd and Navigate to frontend folder and type npm start
