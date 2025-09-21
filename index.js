const express = require("express");
const { SerialPort } = require("serialport");
// const { DelimiterParser  } = require("@serialport/parser-regex");
const { DelimiterParser } = require("@serialport/parser-delimiter");

const app = express();
const expressWs = require("express-ws")(app);

app.use(express.json());
app.use(express.static("public")); // 'public' is the name of your static directory

const serialport = new SerialPort({ path: "COM6", baudRate: 115200 });

// const parser = serialport.pipe(new DelimiterParser({ delimiter: Buffer.from(">>>") })); // ">>>" in hex
// parser.on("data", (preceeding) => {
//   const beginStr = "3c3c3c"; // "<<<" in hex
//   const bufferStr = preceeding.toString("hex");
//   if (bufferStr.includes(beginStr)) {
//     const hexDataStr = bufferStr.split(beginStr).slice(1).join("");
//     console.log("");
//     console.log("Msg type: " + getMsgType(hexDataStr));
//     console.log("Floats: " + getFloatData(hexDataStr));
//   }
// });

let ws_handle = null;

const parser = serialport.pipe(new DelimiterParser({ delimiter: Buffer.from(">>>") })); // ">>>" in hex
parser.on("data", (preceeding) => {
  const beginStr = "<<<";
  const bufferStr = preceeding.toString("ascii");
  if (!bufferStr.includes(beginStr)) {
    return;
  }
  const jsonStr = bufferStr.split(beginStr).slice(1).join("");

  // Forward onto the browser
  if (ws_handle && JSON.parse(jsonStr)) {
    ws_handle.send(jsonStr);
  }
});

// Read data that is available but keep the stream in "paused mode"
serialport.on("readable", function () {
  process.stdout.write(serialport.read());
});

class MSG_TYPES {
  static SERIAL_DRONE_PARAMS = 0;
  static SERIAL_DRONE_DATA = 1;
  static SERIAL_DRONE_CALIBRATE = 2;
  static SERIAL_COMMS_MSG = 3;
}

function getMsgType(hexDataStr) {
  return Uint8Array.from(Buffer.from(hexDataStr.slice(0, 2), "hex"))[0];
}

function getFloatData(hexDataStr) {
  return hexStringToFloat32Array(hexDataStr.slice(2));
}

function hexStringToFloat32Array(hexString) {
  // Ensure the hex string has an even length
  if (hexString.length % 2 !== 0) {
    throw new Error("Hex string must have an even length.");
  }

  const byteLength = hexString.length / 2;
  const buffer = new ArrayBuffer(byteLength);
  const uint8View = new Uint8Array(buffer);

  // Populate the Uint8Array with bytes from the hex string
  for (let i = 0; i < byteLength; i++) {
    const byteHex = hexString.substring(i * 2, i * 2 + 2);
    uint8View[i] = parseInt(byteHex, 16);
  }

  // Create a Float32Array view over the same buffer
  // The endianness of the Float32Array will depend on the system's native endianness
  // or how the original hex string was generated.
  const float32Array = new Float32Array(buffer);

  return Array.from(float32Array);
}

function msg_type_byte(msg_type) {
  return Buffer.from(new Uint8Array([msg_type]).buffer);
}

function floats_to_buf(data) {
  // data can be array of floats or stringified floats
  return Buffer.from(new Float32Array(data).buffer);
}

app.post("/params", (req, res) => {
  const { data } = req.body;
  serialport.write(Buffer.concat([msg_type_byte(MSG_TYPES.SERIAL_DRONE_PARAMS), floats_to_buf(data)]));
  res.status(200).json({ message: "Received" });
});

app.post("/calibrate", (req, res) => {
  serialport.write(msg_type_byte(MSG_TYPES.SERIAL_DRONE_CALIBRATE));
  res.status(200).json({ message: "Calibrated" });
});

app.ws("/comms", (ws, req) => {
  ws.on("message", (msg) => {
    console.log(msg);
  });
  ws_handle = ws;
  console.log("Connected to ws");
});

app.get("/", (req, res) => {
  res.sendFile("./index.html");
});

app.listen(3000);
