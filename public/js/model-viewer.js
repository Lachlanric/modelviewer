const modelViewer = document.querySelector("model-viewer");

function updateModelViewer(roll, pitch, yaw) {
  modelViewer.orientation = `${-roll}deg ${pitch}deg ${yaw}deg`;
  modelViewer.scale = `1.5 1.5 1.5`;
}
