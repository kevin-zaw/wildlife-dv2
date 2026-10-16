// Millions of Eyes - loads the summary numbers into the text and embeds every chart.
// Each chart's full specification is a readable JSON file in /specs.

// One theme for every chart, so fonts and colours match the page (see css/style.css).
const theme = {
  font: "Atkinson Hyperlegible, Segoe UI, Verdana, sans-serif",
  background: null,
  padding: 4,
  view: { stroke: null },
  axis: {
    labelFontSize: 12, titleFontSize: 12, titleFontWeight: "normal",
    labelColor: "#17261F", titleColor: "#56645C",
    gridColor: "#E1E7E1", domainColor: "#9AA69F", tickColor: "#9AA69F"
  },
  legend: {
    labelFontSize: 12, titleFontSize: 12, titleFontWeight: "bold",
    labelColor: "#17261F", titleColor: "#17261F"
  },
  header: { labelFont: "Zilla Slab, Georgia, serif", labelColor: "#17261F" },
  text: { font: "Atkinson Hyperlegible, Segoe UI, Verdana, sans-serif" }
};

const charts = [
  ["c1", "specs/01_sources_line.vl.json"],
  ["c2", "specs/02_waffle.vl.json"],
  ["c3", "specs/03_marimekko.vl.json"],
  ["c4", "specs/04_choropleth.vl.json"],
  ["c5", "specs/05_binmap.vl.json"],
  ["c6", "specs/06_propsymbol.vl.json"],
  ["c7", "specs/07_treemap.vg.json"],
  ["c8", "specs/08_bump.vl.json"],
  ["c9", "specs/09_heatmap.vl.json"],
  ["c10", "specs/10_radial.vl.json"],
  ["c11", "specs/11_canetoad_dotmap.vl.json"],
  ["c12", "specs/12_dumbbell.vl.json"]
];

// Fill every <span data-k="..."> with the matching value from data/summary.json.
fetch("data/summary.json")
  .then(r => r.json())
  .then(summary => {
    document.querySelectorAll("[data-k]").forEach(el => {
      const v = summary[el.dataset.k];
      if (v !== undefined && v !== "") el.textContent = v;
    });
  })
  .catch(() => console.warn("data/summary.json not found - run scripts/get_data.py"));

async function embed(id, url) {
  const el = document.getElementById(id);
  try {
    const spec = await (await fetch(url)).json();
    // The Vega treemap has a fixed pixel size: fit it to its container.
    if (spec.$schema.includes("/vega/")) {
      spec.width = Math.max(320, Math.floor(el.clientWidth));
      spec.height = spec.width < 600 ? 520 : 440;
    }
    await vegaEmbed(el, spec, { config: theme, actions: false, renderer: "svg" });
  } catch (err) {
    el.innerHTML = `<p class="chart-error">This chart could not load (${url}). ` +
      `If you are the author: run <code>python scripts/get_data.py</code> and serve the page over http.</p>`;
    console.error(url, err);
  }
}

charts.forEach(([id, url]) => embed(id, url));

// Re-fit the treemap when the window is resized.
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => embed("c7", "specs/07_treemap.vg.json"), 250);
});
