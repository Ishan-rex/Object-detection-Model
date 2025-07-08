from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

model = YOLO("yolov8n.pt")  # Downloaded automatically

def save_annotated(image_path, results, output_name):
    annotated_frame = results[0].plot()
    output_path = os.path.join(OUTPUT_FOLDER, output_name)
    cv2.imwrite(output_path, annotated_frame)
    return output_path

@app.route("/detect/image", methods=["POST"])
def detect_image():
    file = request.files["file"]
    filename = str(uuid.uuid4()) + ".jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    results = model(path)
    detections = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls_id]
            detections.append({"label": name, "confidence": conf})

    output_file = save_annotated(path, results, filename)
    return jsonify({
        "detections": detections,
        "image_path": output_file
    })

@app.route("/detect/video", methods=["POST"])
def detect_video():
    file = request.files["file"]
    filename = str(uuid.uuid4()) + ".mp4"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    cap = cv2.VideoCapture(path)
    ret, frame = cap.read()
    cap.release()

    temp_img = os.path.join(OUTPUT_FOLDER, "frame.jpg")
    cv2.imwrite(temp_img, frame)
    results = model(temp_img)

    detections = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls_id]
            detections.append({"label": name, "confidence": conf})

    output_file = save_annotated(temp_img, results, "video_preview.jpg")
    return jsonify({
        "detections": detections,
        "image_path": output_file
    })

@app.route("/detect/frame", methods=["POST"])
def detect_frame():
    file = request.files["frame"]
    filename = str(uuid.uuid4()) + ".jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    results = model(path)
    detections = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls_id]
            detections.append({"label": name, "confidence": conf})

    output_file = save_annotated(path, results, "live_" + filename)
    return jsonify({
        "detections": detections,
        "image_path": output_file
    })

@app.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True)
