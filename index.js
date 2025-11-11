const express = require("express");
const { SerialPort } = require("serialport");
const { DelimiterParser } = require("@serialport/parser-delimiter");

const app = express();
const expressWs = require("express-ws")(app);

app.use(express.json());
app.use(express.static("public")); // 'public' is the name of your static directory

let SERIAL_PORT = null;
let WS_HANDLE = null;

function init_parsers() {
  const parser = SERIAL_PORT.pipe(new DelimiterParser({ delimiter: Buffer.from(">>>") })); // ">>>" in hex
  parser.on("data", (preceeding) => {
    const beginStr = "<<<";
    const bufferStr = preceeding.toString("ascii");
    if (!bufferStr.includes(beginStr)) {
      return;
    }
    const jsonStr = bufferStr.split(beginStr).slice(1).join("");

    // Forward onto the browser
    try {
      if (WS_HANDLE && JSON.parse(jsonStr)) {
        WS_HANDLE.send(jsonStr);
      }
    } catch {
      console.log("Dropped bad msg.");
    }
  });

  const cameraParser = SERIAL_PORT.pipe(new DelimiterParser({ delimiter: Buffer.from("$$$$$") })); // ">>>" in hex
  cameraParser.on("data", (preceeding) => {
    const beginPattern = Buffer.from("#####");
    const startIdx = preceeding.indexOf(beginPattern);
    const jpegData = preceeding.slice(startIdx + 5);

    // Forward onto the browser
    if (WS_HANDLE) {
      WS_HANDLE.send(jpegData);
    }
  });
}
class MSG_TYPES {
  static SERIAL_DRONE_PARAMS = 0;
  static SERIAL_DRONE_DATA = 1;
  static SERIAL_DRONE_CALIBRATE = 2;
  static SERIAL_COMMS_MSG = 3;
  static SERIAL_JOYSTICK = 4;
  static SERIAL_REQUEST_DRONE_PARAMS = 5;
  static SERIAL_RECEIVE_DRONE_PARAMS = 6;
}

function msg_type_byte(msg_type) {
  return Buffer.from(new Uint8Array([msg_type]).buffer);
}

function floats_to_buf(data) {
  // data can be array of floats or stringified floats
  return Buffer.from(new Float32Array(data).buffer);
}

function close_serial(callback) {
  if (SERIAL_PORT) {
    SERIAL_PORT.close(() => {
      console.log("Serial port closed");
      WS_HANDLE.send(JSON.stringify({ msg_type: MSG_TYPES.SERIAL_COMMS_MSG, data: "Serial port closed" }));
      SERIAL_PORT = null;
      if (callback) {
        callback();
      }
    });
  } else {
    if (callback) {
      callback();
    }
  }
}

app.post("/params", (req, res) => {
  if (SERIAL_PORT) {
    const { data } = req.body;
    SERIAL_PORT.write(Buffer.concat([msg_type_byte(MSG_TYPES.SERIAL_DRONE_PARAMS), floats_to_buf(data)]));
  }
  res.status(200).json({ message: "Received" });
});

app.post("/calibrate", (req, res) => {
  if (SERIAL_PORT) {
    SERIAL_PORT.write(msg_type_byte(MSG_TYPES.SERIAL_DRONE_CALIBRATE));
  }
  res.status(200).json({ message: "Calibrated" });
});

app.post("/obtain_pid", (req, res) => {
  if (SERIAL_PORT) {
    SERIAL_PORT.write(msg_type_byte(MSG_TYPES.SERIAL_REQUEST_DRONE_PARAMS));
  }
  res.status(200).json({ message: "Requested PID params" });
});

app.post("/serial_close", (req, res) => {
  close_serial();
  res.status(200).json({ message: "Received" });
});

app.post("/serial_open", (req, res) => {
  const { port, baudRate } = req.body;
  close_serial(() => {
    SERIAL_PORT = new SerialPort({ path: port, baudRate: baudRate }, (err) => {
      let msg;
      if (err) {
        msg = `${err}`;
      } else {
        msg = `Serial port ${port} opened with baud rate ${baudRate}`;
      }
      console.log(msg);
      WS_HANDLE.send(JSON.stringify({ msg_type: MSG_TYPES.SERIAL_COMMS_MSG, data: msg }));
    });
    init_parsers();
    res.status(200).json({ message: "Received" });
  });
});

app.get("/serial_list", async (req, res) => {
  const available_ports = await SerialPort.list();
  const res_lst = available_ports.map((p) => p.path);
  res.send(JSON.stringify({ ports: res_lst }));
});

app.ws("/comms", (ws, req) => {
  ws.on("message", (msg) => {
    console.log(msg);
  });
  WS_HANDLE = ws;
  console.log("Connected to ws");
});

app.get("/", (req, res) => {
  res.sendFile("./index.html");
});

app.listen(3000);
