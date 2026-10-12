# What Does NYC Eat? — Exploring Cuisine Diversity Across New York City

**Live site:** https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/  ← replace with your GitHub Pages link

An interactive Chart.js visualization of the most common restaurant cuisines in each NYC borough. Choose a borough from the dropdown to update the chart, switch between a doughnut chart and a bar chart, hover over a slice or bar to see the count and percentage, and click legend items to hide or show a cuisine.

## Project structure

| File | Purpose |
|---|---|
| `index.html` | Page layout: title, controls, stat cards, chart canvas, data notes. Loads Chart.js from the jsDelivr CDN. |
| `style.css` | Page styling (colors, fonts, cards, toggle buttons, mobile layout). |
| `script.js` | Loads `data.json`, fills the borough dropdown, and draws and redraws the Chart.js chart. |
| `data.json` | Processed dataset: top 10 cuisines + "all other" count for All NYC and each of the 5 boroughs. |
| `prepare_data.py` | Python/pandas script that turns the raw CSV into `data.json`. |
| `sketches/` | Phase 1 sketches. |

## Features

- **Chart.js chart** with a title, axis labels (bar view), and a legend
- **Borough dropdown** to filter the data (All NYC, Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- **Chart type toggle** (doughnut ↔ bar)
- **Custom tooltips** showing the restaurant count and its share of the borough
- **Clickable legend** to hide or show cuisines
- Stat cards and a short insight for each borough
- Each cuisine keeps the same color in every borough, so boroughs are easy to compare

## Dataset

[NYCFoodInspectionSimple](https://data.cityofnewyork.us/Health/NYCFoodInspectionSimple/sfd3-axrg) from NYC Open Data (Department of Health and Mental Hygiene), downloaded October 11, 2026. The raw CSV has about 297,000 rows, but each row is an inspection or violation, not a restaurant. So the data was deduplicated to about 31,000 unique restaurants (same name + street + ZIP). After removing restaurants with no cuisine listed (mostly new places not yet inspected) or no borough, 27,320 restaurants remain. The final `data.json` has 6 groups × 11 categories = 66 data points.

## Phase 1: Design

### Why this dataset

<!-- TODO: rewrite this paragraph in your own words -->
I chose the NYC restaurant inspection dataset because food is one of the easiest ways to see how diverse New York City is. Every restaurant in the city is inspected, so this dataset works almost like a census of what New Yorkers can eat and where. I wanted to show which cuisines are the most common across the city, and how the mix changes from borough to borough. For example, Chinese food almost ties American food in Queens, Caribbean food is in Brooklyn's top 5, and Staten Island has far fewer cuisine types than Manhattan. I also wanted to ask whether areas with more restaurants also have more variety.

### Sketches

<!-- TODO: add photos/screenshots of your 3 sketches to the sketches/ folder and update the file names below -->

**Sketch 1: Bar chart, Top 10 cuisines in NYC**
![Sketch 1](sketches/sketch1.jpg)
X-axis: cuisine type. Y-axis: number of restaurants.
Chart.js features: `bar` chart type, axis titles (`scales.x.title`, `scales.y.title`), hover tooltips, chart title plugin.

**Sketch 2: Doughnut chart, Cuisine distribution by borough** ← *developed in Phase 2*
![Sketch 2](sketches/sketch2.jpg)
A dropdown switches between the five boroughs.
Chart.js features: `doughnut` chart type, legend plugin, `chart.destroy()` / redraw when the dropdown changes, custom tooltip callbacks.

**Sketch 3: Scatter plot, Restaurant count vs. cuisine diversity by ZIP code**
![Sketch 3](sketches/sketch3.jpg)
Each point is a ZIP code. X-axis: number of restaurants. Y-axis: number of different cuisine types.
Chart.js features: `scatter` chart type, linear axes with titles, tooltip callbacks that show the ZIP code.

## External resources & AI use

- **Chart.js documentation** (https://www.chartjs.org/docs/latest/): doughnut and bar chart options, legend `generateLabels`, tooltip callbacks.
- **NYC Open Data** column descriptions for the dataset.
- **Claude (Anthropic)**: <!-- TODO: edit this to match exactly what you used it for -->
  - Used for: cleaning and summarizing the CSV (`prepare_data.py`), writing the first draft of `index.html`, `style.css` and `script.js`, and drafting this README. I then reviewed, tested and edited the code and text.
  - Example prompts:
    - "I'm working on Assignment 2: Data Visualization using Chart.js. I decided to use the NYCFoodInspectionSimple dataset… I am leaning toward something with a borough dropdown/filter."
    - "Help me build the index.html, script.js, style.css and README for the doughnut chart with a borough dropdown."
