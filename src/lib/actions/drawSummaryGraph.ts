import * as d3 from "d3";
import { Margin, SourceDatum } from "../models";

interface SummaryStat {
  treatment: number;
  visit: number;
  dlqi: number;
  bsa: number;
  easi: number;
  itch: number;
}

interface XVarPath {
  (sourceDatum: SourceDatum): number;
}

interface XVar {
  label: string;
  path: XVarPath;
  max: number;
  ticks: number;
}

const margin: Margin = { top: 32, right: 8, bottom: 40, left: 40 };
const spaceBetweenGraphs = 32;
const visits = [0];
const circleRadius = 3;

/**
 * Define our x variables in a single place so we can loop over elements.
 */
const xVars: XVar[] = [
  {
    label: "BSA",
    path: (d: SourceDatum): number => d.bsa,
    max: 100,
    ticks: 6,
  },
  {
    label: "Redness",
    path: (d: SourceDatum): number => d.easi,
    max: 60,
    ticks: 7,
  },
  {
    label: "Itch",
    path: (d: SourceDatum): number => d.itch,
    max: 10,
    ticks: 6,
  },
];

const stats: SummaryStat[] = [
  {
    treatment: 0,
    visit: 0,
    dlqi: 16.005,
    bsa: 37.7986,
    easi: 24.12815,
    itch: 7.35945,
  },
  {
    treatment: 0,
    visit: 1,
    dlqi: 16.245,
    bsa: 27.4341,
    easi: 17.3549,
    itch: 6.5363,
  },
  {
    treatment: 1,
    visit: 0,
    dlqi: 11.115,
    bsa: 35.39355,
    easi: 21.47455,
    itch: 5.64805,
  },
  {
    treatment: 1,
    visit: 1,
    dlqi: 10.81,
    bsa: 24.56045,
    easi: 12.6407,
    itch: 4.7133,
  },
];

function drawYAxis(
  parent: d3.Selection<SVGGElement, {}, d3.BaseType, {}>,
  yScale: d3.ScaleLinear<number, number>,
  graphHeight: number,
): void {
  parent
    .append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale).ticks(6));
  parent
    .append("g")
    .classed("y-label", true)
    .attr(
      "transform",
      `translate(${margin.left * 0.3}, ${margin.top + graphHeight / 2})`,
    )
    .append("text")
    .attr("transform", "rotate(270)")
    .attr("text-anchor", "middle")
    .text("DLQI")
    .append("tspan")
    .classed("text-muted", true)
    .text(" *");
}

function regression(
  visit: number,
  treatment: number,
  xLabel: string,
  x: number,
): number {
  let bIntercept = 0;
  let bTreatment = 0;
  let bX = 0;
  switch (visit) {
    case 0:
      switch (xLabel) {
        case "BSA":
          bIntercept = 16.0292312;
          bTreatment = -4.8915418;
          bX = -0.0006411;
          break;
        case "Redness":
          bIntercept = 16.90054;
          bTreatment = -4.98849;
          bX = -0.03712;
          break;
        case "Itch":
          bIntercept = 2.3492;
          bTreatment = -1.7144;
          bX = 1.8556;
          break;
      }
      break;
    case 1:
      switch (xLabel) {
        case "BSA":
          bIntercept = 16.2347477;
          bTreatment = -5.4339261;
          bX = 0.0003737;
          break;
        case "Redness":
          bIntercept = 16.213779;
          bTreatment = -5.426519;
          bX = 0.001799;
          break;
        case "Itch":
          bIntercept = 4.60514;
          bTreatment = -2.1886;
          bX = 1.7808;
          break;
      }
      break;
  }
  return bIntercept + bTreatment * treatment + bX * x;
}

export function drawSummaryGraph(sourceData: SourceDatum[]): void {
  const svg: d3.Selection<SVGSVGElement, {}, d3.BaseType, {}> = d3.select(
    "svg#summary-graphic",
  );
  svg.selectAll("*").remove();

  const width = 1200;
  const height = 400;
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const graphWidth =
    (width - margin.left - margin.right - 3 * spaceBetweenGraphs) / 3;
  const visitHeight = height / visits.length;
  const graphHeight = visitHeight - margin.top - margin.bottom;

  const y = d3
    .scaleLinear()
    .domain([0, 30])
    .range([graphHeight, 0])
    .nice();

  visits.forEach((visit, visitIdx) => {
    const visitData = sourceData.filter((d) => d.visit === visit);

    const gVisit = svg
      .append("g")
      .classed("visit", true)
      .classed(`visit-${visit}`, true)
      .attr("transform", `translate(0, ${visitHeight * visitIdx})`);

    drawYAxis(gVisit, y, graphHeight);

    xVars.forEach((xVar: XVar, xIdx: number): void => {
      const x = d3
        .scaleLinear()
        .domain([0, xVar.max])
        .range([0, graphWidth])
        .nice();

      const sigLabels = xIdx < 2 ? " +" : " +#";

      const gXVar = gVisit
        .append("g")
        .classed(`x-${xVar.label.toLowerCase()}`, true)
        .attr(
          "transform",
          `translate(${margin.left +
            (xIdx + 1) * spaceBetweenGraphs +
            xIdx * graphWidth}, ${margin.top})`,
        );
      gXVar
        .append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(d3.axisBottom(x).ticks(xVar.ticks));
      gXVar
        .append("g")
        .classed("x-label", true)
        .attr(
          "transform",
          `translate(${graphWidth / 2}, ${graphHeight + margin.bottom})`,
        )
        .append("text")
        .text(`${xVar.label}`)
        .append("tspan")
        .classed("text-muted", true)
        .text(sigLabels);

      const gData = gXVar.append("g").classed("data", true);

      gData
        .selectAll<SVGCircleElement, SourceDatum>("circle.datum")
        .data(visitData, (d: SourceDatum): number => d.subject)
        .join("circle")
        .classed("datum", true)
        .classed("pbo-datum", (d) => d.treatment === 0)
        .classed("rx-datum", (d) => d.treatment === 1)
        .attr("cx", (d) => x(xVar.path(d)) || 0)
        .attr("cy", (d) => y(d.dlqi) || 0)
        .attr("r", circleRadius)
        .attr("opacity", 0.5);

      let xPboMean = 0;
      let xRxMean = 0;
      const yPboMean =
        stats.find((d) => d.visit === visit && d.treatment === 0)?.dlqi || 0;
      const yRxMean =
        stats.find((d) => d.visit && d.treatment === 1)?.dlqi || 0;
      switch (xVar.label) {
        case "BSA":
          xPboMean =
            stats.find((d) => d.visit === visit && d.treatment === 0)?.bsa || 0;
          xRxMean = stats.find((d) => d.visit && d.treatment === 1)?.bsa || 0;
          break;
        case "Redness":
          xPboMean =
            stats.find((d) => d.visit === visit && d.treatment === 0)?.easi ||
            0;
          xRxMean = stats.find((d) => d.visit && d.treatment === 1)?.easi || 0;
          break;
        case "Itch":
          xPboMean =
            stats.find((d) => d.visit === visit && d.treatment === 0)?.itch ||
            0;
          xRxMean = stats.find((d) => d.visit && d.treatment === 1)?.itch || 0;
          break;
      }

      gData
        .append("line")
        .classed("mean pbo-line", true)
        .attr("x1", x(0) || 0)
        .attr("x2", x(xVar.max) || 0)
        .attr("y1", y(yPboMean) || 0)
        .attr("y2", y(yPboMean) || 0);
      gData
        .append("line")
        .classed("mean rx-line", true)
        .attr("x1", x(0) || 0)
        .attr("x2", x(xVar.max) || 0)
        .attr("y1", y(yRxMean) || 0)
        .attr("y2", y(yRxMean) || 0);

      gData
        .append("line")
        .classed("mean pbo-line", true)
        .attr("x1", x(xPboMean) || 0)
        .attr("x2", x(xPboMean) || 0)
        .attr("y1", y(0) || 0)
        .attr("y2", y(30) || 0);
      gData
        .append("line")
        .classed("mean rx-line", true)
        .attr("x1", x(xRxMean) || 0)
        .attr("x2", x(xRxMean) || 0)
        .attr("y1", y(0) || 0)
        .attr("y2", y(30) || 0);
      gData
        .append("line")
        .classed("regression pbo-line", true)
        .attr("x1", x(0) || 0)
        .attr("x2", x(xVar.max) || 0)
        .attr("y1", y(regression(visit, 0, xVar.label, 0)) || 0)
        .attr("y2", y(regression(visit, 0, xVar.label, xVar.max)) || 0);
      gData
        .append("line")
        .classed("regression rx-line", true)
        .attr("x1", x(0) || 0)
        .attr("x2", x(xVar.max) || 0)
        .attr("y1", y(regression(visit, 1, xVar.label, 0)) || 0)
        .attr("y2", y(regression(visit, 1, xVar.label, xVar.max)) || 0);
    });
  });
}
