const port_selector = document.querySelector("select#serial_port");

async function serial_refresh() {
  const res = await fetch("/serial_list", {
    method: "GET", // Specify the HTTP method as POST
  });
  const { ports } = await res.json();
  port_selector.innerHTML = ports
    .sort()
    .reverse()
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");
}

document.querySelector("#serial_refresh").addEventListener("click", serial_refresh);

document.querySelector("#serial_open").addEventListener("click", async () => {
  const port = port_selector.value;
  const baudRate = 921600;
  await fetch("/serial_open", {
    method: "POST", // Specify the HTTP method as POST
    headers: {
      "Content-Type": "application/json", // Indicate that the body contains JSON data
    },
    body: JSON.stringify({ port: port, baudRate: baudRate }), // Convert the JavaScript object to a JSON string
  });
});

document.querySelector("#serial_close").addEventListener("click", async () => {
  const res = await fetch("/serial_close", {
    method: "POST", // Specify the HTTP method as POST
  });
});

serial_refresh();
