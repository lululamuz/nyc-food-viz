// What Does NYC Eat? — top 10 cuisines per borough with Chart.js

// Each cuisine keeps the same color in every borough
const COLORS = {
  "American": "#ff4d2e",
  "Chinese": "#ffd400",
  "Coffee/Tea": "#b08968",
  "Pizza": "#ff8c1a",
  "Latin American": "#2ed573",
  "Mexican": "#9be15d",
  "Japanese": "#ff6fb5",
  "Italian": "#3d8bff",
  "Bakery & Desserts": "#ffb3d1",
  "Caribbean": "#00d1c1",
  "French": "#8f7bff",
  "Other": "#9e9e9e",
  "Chicken": "#ffe08a",
  "Korean": "#c86bff",
  "Spanish": "#ff9f80",
  "Hamburgers": "#d4a373",
  "Donuts": "#ff8fa3",
  "Frozen Desserts": "#7fd8ff",
  "All other cuisines": "#3a3a3a"
};

// One sentence per borough shown under the chart
const INSIGHTS = {
  "All NYC": "Over a third of NYC restaurants serve something outside the top 10 cuisines.",
  "Manhattan": "Manhattan has the most restaurants and the most cuisine types (89).",
  "Brooklyn": "Caribbean food makes Brooklyn's top 5. No other borough's top 5 includes it.",
  "Queens": "In Queens, Chinese restaurants almost tie American ones: 751 vs. 810.",
  "Bronx": "In the Bronx, pizza ranks second and Latin American food is in the top 5.",
  "Staten Island": "Staten Island has the fewest cuisine types of any borough (52)."
};

const select = document.getElementById("borough");
const buttons = document.querySelectorAll(".toggle button");
let data, chart;
let chartType = "doughnut";

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "'Inter Tight', Helvetica, Arial, sans-serif";

// Load data, fill the dropdown, draw the first chart
fetch("data.json")
  .then((res) => res.json())
  .then((json) => {
    data = json;
    data.boroughs.forEach((b) => select.add(new Option(b.name, b.name)));
    drawChart();
  });

// Interaction 1: choose a borough
select.addEventListener("change", drawChart);

// Interaction 2: switch chart type
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    chartType = btn.dataset.type;
    drawChart();
  });
});

function drawChart() {
  const borough = data.boroughs.find((b) => b.name === select.value);
  const labels = borough.top.map((t) => t.cuisine).concat("All other cuisines");
  const values = borough.top.map((t) => t.count).concat(borough.otherCount);
  const colors = labels.map((name) => COLORS[name]);
  const isBar = chartType === "bar";

  document.getElementById("insight").textContent = INSIGHTS[borough.name];

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("cuisineChart"), {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: "Restaurants",
        data: values,
        backgroundColor: colors,
        borderColor: "#000",
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      indexAxis: "y", // horizontal bars (ignored by the doughnut chart)
      plugins: {
        title: {
          display: true,
          text: "Top 10 cuisines in " + borough.name,
          align: "start",
          font: { size: 18, weight: "500" },
          padding: { bottom: 20 }
        },
        legend: {
          position: window.innerWidth < 600 ? "bottom" : "right",
          onClick: null, // legend is for reading only
          labels: {
            boxWidth: 12,
            // show one legend item per cuisine, also in bar mode
            generateLabels: () => labels.map((text, i) => ({
              text: text,
              fillStyle: colors[i],
              strokeStyle: colors[i],
              fontColor: "#fff"
            }))
          }
        },
        // Custom tooltip: count + share of the borough
        tooltip: {
          callbacks: {
            label: (item) => {
              const pct = ((item.raw / borough.totalRestaurants) * 100).toFixed(1);
              return " " + item.raw.toLocaleString() + " restaurants (" + pct + "%)";
            }
          }
        }
      },
      scales: isBar ? {
        x: { title: { display: true, text: "Number of restaurants" }, grid: { color: "#222" } },
        y: { title: { display: true, text: "Cuisine" }, grid: { display: false } }
      } : {}
    }
  });
}
