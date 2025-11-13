// Joystick viz
const canvas = document.getElementById("joystickCanvas");
const ctx = canvas.getContext("2d");
const radius = 50;
const pad = (canvas.width - 4 * radius) / 4; // padding
const center_left = radius + pad;
const center_right = canvas.width - radius - pad;
const centerY = canvas.height / 2;

function drawJoystick(lx = 0, ly = 0, rx = 0, ry = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw outer squares
  ctx.beginPath();
  ctx.rect(center_left - radius, centerY - radius, radius * 2, radius * 2);
  ctx.strokeStyle = "gray";
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(center_right - radius, centerY - radius, radius * 2, radius * 2);
  ctx.strokeStyle = "gray";
  ctx.stroke();

  // Draw joystick position
  ctx.beginPath();
  ctx.arc(center_left + lx * radius, centerY + ly * radius, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(center_right + rx * radius, centerY + ry * radius, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
}
