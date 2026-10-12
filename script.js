// What Does NYC Eat? — Chart.js visualization of cuisine counts by borough

// Fixed color per cuisine so the same cuisine keeps its color in every borough
const COLORS = {
  "American": "#d9480f",
  "Chinese": "#c92a2a",
  "Coffee/Tea": "#8d6e63",
  "Pizza": "#f59f00",
  "Latin American": "#2f9e44",
  "Mexican": "#66a80f",
  "Japanese": "#e64980",
  "Italian": "#1c7ed6",
  "Bakery & Desserts": "#f783ac",
  "Caribbean": "#0ca678",
  "French": "#5c7cfa",
  "Other": "#868e96",
  "Chicken": "#fab005",
  "Korean": "#ae3ec9",
  "Spanish": "#e8590c",
  "Hamburgers": "#a0522d",
  "Donuts": "#ff8787",
  "Frozen Desserts": "#74c0fc",
  "All other cuisines": "#dee2e6"
};

// Short notes shown under the chart for each borough
const INSIGHTS = {
  "All NYC": "American food leads citywide, but no single cuisine is more than about 1 in 6 restaurants. Over a third of restaurants fall outside the top 10, which shows how spread out NYC's food scene is.",
  "Manhattan": "Manhattan has the most restaurants and the most cuisine types. Italian, Japanese and French appear in its top 10, a different mix from the outer boroughs.",
  "Brooklyn": "Caribbean food is in Brooklyn's top 5, which no other borough has.",
  "Queens": "In Queens, Chinese restaurants almost tie American ones (751 vs. 810), and Latin American is third.",
  "Bronx": "Pizza ranks second in the Bronx, and Latin American and Mexican food are both in the top 5.",
  "Staten Island": "Staten Island has the fewest restaurants and cuisine types. Its top 5 is mostly American, pizza, Chinese and Italian."
};

const select = document.getElementById("borough");
const buttons = document.querySelectorAll(".toggle button");
const ctx = document.getElementById("cuisineChart");

let data = null;
let chart = null;
let chartType = "doughnut";

// Load the JSON data, fill the dropdown, draw the first chart
fetch("data.json")
  .then((res) => res.json())
  .then((json) => {
    data = json;
    data.boroughs.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.name;
      opt.textContent = b.name;
      select.appendChild(opt);
    });
    render();
  })
  .catch((err) => {
    document.getElementById("insight").textContent =
      "Could not load data.json. If you opened this file directly, run it through a local server (for example VS Code Live Server).";
    console.error(err);
  });

// Interaction 1: borough dropdown
select.addEventListener("change", render);

// Interaction 2: switch between doughnut and bar
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    chartType = btn.dataset.type;
    render();
  });
});

function render() {
  const borough = data.boroughs.find((b) => b.name === select.value) || data.boroughs[0];

  const labels = borough.top.map((t) => t.cuisine).concat("All other cuisines");
  const values = borough.top.map((t) => t.count).concat(borough.otherCount);
  const colors = labels.map((l) => COLORS[l] || "#adb5bd");

  // Update stat cards and insight text
  document.getElementById("stat-total").textContent = borough.totalRestaurants.toLocaleString();
  document.getElementById("stat-cuisines").textContent = borough.distinctCuisines;
  document.getElementById("stat-top").textContent = borough.top[0].cuisine;
  document.getElementById("insight").textContent = INSIGHTS[borough.name] || "";

  if (chart) chart.destroy();

  const isBar = chartType === "bar";

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [{
        label: "Number of restaurants",
        data: values,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: isBar ? 0 : 2,
        borderRadius: isBar ? 6 : 0,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isBar ? "y" : "x",
      cutout: isBar ? undefined : "55%",
      plugins: {
        title: {
          display: true,
          text: `Top 10 Cuisines in ${borough.name} (by number of restaurants)`,
          font: { size: 17, weight: "600", family: "Inter" },
          color: "#2a2420",
          padding: { bottom: 16 }
        },
        legend: {
          display: true,
          position: window.innerWidth < 600 ? "bottom" : "right",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            font: { family: "Inter" },
            // one legend entry per cuisine in both chart types
            generateLabels: (c) => c.data.labels.map((text, i) => ({
              text,
              fillStyle: colors[i],
              strokeStyle: colors[i],
              pointStyle: "circle",
              hidden: !c.getDataVisibility(i),
              index: i
            }))
          },
          // click a legend item to hide/show that cuisine
          onClick: (e, item, legend) => {
            legend.chart.toggleDataVisibility(item.index);
            legend.chart.update();
          }
        },
        // Custom tooltip: count plus share of the borough's restaurants
        tooltip: {
          callbacks: {
            label: (item) => {
              const n = item.raw;
              const pct = ((n / borough.totalRestaurants) * 100).toFixed(1);
              return ` ${n.toLocaleString()} restaurants (${pct}% of ${borough.name})`;
            }
          }
        }
      },
      scales: isBar ? {
        x: {
          title: { display: true, text: "Number of restaurants" },
          grid: { color: "#f1ebe3" }
        },
        y: {
          title: { display: true, text: "Cuisine" },
          grid: { display: false }
        }
      } : {}
    }
  });
}
