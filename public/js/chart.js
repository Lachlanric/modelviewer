//  include the following script in the html page
//  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

function downloadCSV(jsonData) {
  if (jsonData.length === 0) return;

  const headers = Object.keys(jsonData[0]);
  const csv = [headers.join(","), ...jsonData.map((row) => headers.map((field) => row[field]).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "drone_data.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function exportData() {
  downloadCSV(
    chart.data.labels.map((time, i) => {
      const row = { time_us: time };
      chart.data.datasets.forEach((ds) => {
        row[ds.label] = ds.data[i];
      });
      return row;
    })
  );
}

const checkbox = document.querySelector("input#hideall"); // CHART.JS
checkbox.addEventListener("change", function () {
  chart.data.datasets.forEach((ds, index) => {
    const checked = this.checked ? this.checked : null;
    const meta = chart.getDatasetMeta(index);
    meta.hidden = !checked;
    ds.hidden = !checked;

    localStorage.setItem(ds.label, !checked);
  });
  chart.update();
});

function getLastNItems(arr, N) {
  return arr.slice(Math.max(arr.length - N, 0));
}

const COLORS = [
  "#F42525",
  "#25F43A",
  "#4E25F4",
  "#F46325",
  "#25F478",
  "#8C25F4",
  "#F4A125",
  "#25F4B6",
  "#CA25F4",
  "#F4DF25",
  "#25F4F4",
  "#F425DF",
  "#CAF425",
  "#25B6FF",
  "#F425FF",
  "#8CF425",
  "#2578F4",
  "#253AF4",
];

let col_idx = 0;

const MAX_DATA_POINTS = 500;

function updateChart(jsonData) {

  // Update charts
  const xVals = jsonData.map((pt) => pt["time_us"]);
  chart.data.labels.push(...xVals);
  chart.data.labels = getLastNItems(chart.data.labels, MAX_DATA_POINTS);

  Object.keys(jsonData[0])
    .filter((key) => key != "time_us")
    .forEach((key) => {
      const yVals = jsonData.map((pt) => pt[key]);
      let existingDataSet = chart.data.datasets.find((ds) => ds.label == key);
      if (existingDataSet != undefined) {
        // add y vals
        existingDataSet.data.push(...yVals);
      } else {
        const col = COLORS[col_idx];
        col_idx = (col_idx + 1) % COLORS.length;
        existingDataSet = {
          data: yVals,
          borderColor: col,
          borderWidth: 3,
          pointRadius: 0, // Disable points for this dataset
          fill: false,
          label: key,
          hidden: JSON.parse(localStorage.getItem(key)),
        };
        chart.data.datasets.push(existingDataSet);
      }

      existingDataSet.data = getLastNItems(existingDataSet.data, MAX_DATA_POINTS);
    });

  chart.update();
}

const chart = new Chart("drone-data-chart", {
  type: "line",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    legend: {
      display: true,
      onClick(e, legendItem) {
        ///// ORIGINAL FUNCTION /////
        var index = legendItem.datasetIndex;
        var ci = this.chart;
        var meta = ci.getDatasetMeta(index);

        // See controller.isDatasetVisible comment
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        chart.data.datasets[index].hidden = meta.hidden ? meta.hidden : null; // extra line (not in original function)

        // We hid a dataset ... rerender the chart
        ci.update();
        ///// ORIGINAL FUNCTION /////

        // Store
        localStorage.setItem(chart.data.datasets[index].label, meta.hidden);
      },
    },
  },
});
