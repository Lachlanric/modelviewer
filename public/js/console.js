function console_log(tag, msg) {
  const nowMs = new Date();
  const pad = (n, z = 2) => n.toString().padStart(z, "0");
  const timeStr = `${pad(nowMs.getHours())}:${pad(nowMs.getMinutes())}:${pad(nowMs.getSeconds())}.${pad(nowMs.getMilliseconds(), 3)}`;
  const container = document.querySelector(".console-container");
  const entry = document.createElement("div");
  entry.className = `console-entry console-${tag}`;
  entry.innerHTML = `<pre>[${timeStr}] ${msg}</pre>`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function clearConsole() {
  document.getElementById("console-container").innerHTML = "";
}
