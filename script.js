// What Does NYC Eat? — top 10 cuisines per borough with Chart.js

// Each cuisine keeps the same color in every borough
const COLORS = {
  "American": "#ffd400",
  "Chinese": "#ff4d2e",
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

// Food photos for the doughnut slices (round PNGs in the images/ folder).
// Cuisines without a photo keep their color.
const PHOTO_FILES = {
  "American": "american.png",                // burger patty
  "Chinese": "chinese.png",                  // noodles
  "Coffee/Tea": "coffee-tea.png",            // iced latte
  "Pizza": "pizza.png",                      // pepperoni pizza
  "Italian": "italian.png",                  // salami
  "Bakery & Desserts": "bakery-desserts.png",// donut
  "Latin American": "latin-american.png",    // tomato
  "Mexican": "mexican.png",                  // red onion
  "Japanese": "japanese.png",                // cucumber
  "Caribbean": "caribbean.png",              // kiwi
  "All other cuisines": "all-other-cuisines.png" // empty plate
};
const PHOTOS = {}; // full photos for the slices
const ICONS = {};  // small round versions for the legend

Object.keys(PHOTO_FILES).forEach((cuisine) => {
  const img = new Image();
  img.onload = () => {
    PHOTOS[cuisine] = img;
    // make a 16px icon for the legend
    const icon = document.createElement("canvas");
    icon.width = icon.height = 16;
    icon.getContext("2d").drawImage(img, 0, 0, 16, 16);
    ICONS[cuisine] = icon;
    if (chart) chart.update(); // redraw once the photo has loaded
  };
  img.src = "images/" + PHOTO_FILES[cuisine];
});

// Chart.js plugin: fill each doughnut slice with its slice of a round food photo.
// The photo is centered on the doughnut, so each slice shows a "wedge" of it.
const photoSlices = {
  id: "photoSlices",
  afterDatasetDraw(chart) {
    if (chart.config.type !== "doughnut") return;
    const ctx = chart.ctx;
    chart.getDatasetMeta(0).data.forEach((arc, i) => {
      const img = PHOTOS[chart.data.labels[i]];
      if (!img || !chart.getDataVisibility(i)) return;
      const { x, y, startAngle, endAngle, innerRadius, outerRadius } = arc.getProps(
        ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], true);
      ctx.save();
      // cut out the slice shape
      ctx.beginPath();
      ctx.arc(x, y, outerRadius, startAngle, endAngle);
      ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.clip();
      // draw the whole photo, sized to the doughnut, inside that slice
      ctx.drawImage(img, x - outerRadius, y - outerRadius, outerRadius * 2, outerRadius * 2);
      // black outline between slices
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.restore();
    });
  }
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
    plugins: [photoSlices],
    data: {
      labels: labels,
      datasets: [{
        label: "Restaurants",
        data: values,
        backgroundColor: colors,
        borderColor: "#000",
        borderWidth: 2,
        cutout: "35%"
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
            usePointStyle: true,
            padding: 12,
            // one legend item per cuisine: photo icon on the doughnut, color square on the bar chart
            generateLabels: () => labels.map((text, i) => ({
              text: text,
              fillStyle: colors[i],
              strokeStyle: colors[i],
              fontColor: "#fff",
              pointStyle: (!isBar && ICONS[text]) || "rect"
            }))
          }
        },
        // Custom tooltip: count + share of the borough
        tooltip: {
          usePointStyle: true,
          callbacks: {
            // show the food photo icon in the tooltip (doughnut view)
            labelPointStyle: (item) => ({
              pointStyle: (!isBar && ICONS[item.label]) || "rect",
              rotation: 0
            }),
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
