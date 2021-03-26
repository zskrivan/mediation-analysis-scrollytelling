import * as d3 from "d3";
import scrollama from "scrollama";
import { Margin, Size, SourceDatum } from "../models";

interface Action {
  (): void;
}
type GSelection = d3.Selection<SVGGElement, {}, d3.BaseType, {}>;
type SVGSelection = d3.Selection<SVGSVGElement, {}, d3.BaseType, {}>;
type CircleSelection = d3.Selection<
  SVGCircleElement,
  SourceDatum,
  d3.BaseType,
  {}
>;

interface GroupByDlqi {
  dlqi: number;
  data: SourceDatum[];
}

const axisOffset = 200;
const circleRadius = 5;
const margin: Margin = { top: 40, right: 40, bottom: 80, left: 80 };
const transitionDuration = 750;
const pboTreatment = 0;
const rxTreatment = 1;
const visitValue = 1;

let svg: SVGSelection = d3.select("svg");
let gData: GSelection = d3.select("g");
let gXAxis: GSelection = d3.select("g.x-axis");
let gXLabel: GSelection = d3.select("g.x-label");
let gYAxis: GSelection = d3.select("g.y-axis");
let gYLabel: GSelection = d3.select("g.y-label");
let circles: CircleSelection = d3.selectAll<SVGCircleElement, SourceDatum>(
  "circle",
);
let vueId = "";
let gDataSize: Size = { width: 0, height: 0 };
let svgSize: Size = { width: 0, height: 0 };

let xScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
let yScale: d3.ScaleLinear<number, number> = d3.scaleLinear();

// summary statistics
const pboDlqiMean = 16.245;
const pboItchMean = 6.5363;
const rxDlqiMean = 10.81;
const rxItchMean = 4.7133;
const dlqiMidpoint = (pboDlqiMean + rxDlqiMean) / 2;
const itchMidpoint = (pboItchMean + rxItchMean) / 2;
const bIntercept = 4.60514;
const bTreatment = -2.1886;
const bItch = 1.7808;

function regression(treatment: number, itch: number): number {
  return bIntercept + bTreatment * treatment + bItch * itch;
}

function drawCircles(sourceData: SourceDatum[]): void {
  circles = gData
    .selectAll<SVGCircleElement, SourceDatum>("circle.datum")
    .data(sourceData, (d) => d.subject)
    .join("circle")
    .classed("datum", true)
    .attr(vueId, true)
    .attr("cx", (d) => d.x1 || 0)
    .attr("cy", (d) => yScale(d.dlqi) || 0)
    .attr("r", circleRadius)
    .attr("opacity", 1);
}

function drawLine(
  selector: string,
  xStart: number,
  x1: number,
  x2: number,
  yStart: number,
  y1: number,
  y2: number,
  transitionDelay: number,
): void {
  gData
    .select(selector)
    .transition()
    .delay(transitionDelay)
    .duration(0)
    .attr("opacity", 1)
    .attr("x1", xScale(xStart) || 0)
    .attr("x2", xScale(xStart) || 0)
    .attr("y1", yScale(yStart) || 0)
    .attr("y2", yScale(yStart) || 0)
    .transition()
    .duration(transitionDuration)
    .attr("x1", xScale(x1) || 0)
    .attr("x2", xScale(x2) || 0)
    .attr("y1", yScale(y1) || 0)
    .attr("y2", yScale(y2) || 0);
}

function drawHorizontalLine(
  selector: string,
  xStart: number,
  x1: number,
  x2: number,
  y: number,
  transitionDelay: number,
): void {
  const line = gData.select(selector);
  if (line && +line.attr("opacity") > 0) {
    return;
  }
  drawLine(selector, xStart, x1, x2, y, y, y, transitionDelay);
}

function drawVerticalLine(
  selector: string,
  x: number,
  yStart: number,
  y1: number,
  y2: number,
  transitionDelay: number,
): void {
  const line = gData.select(selector);
  if (line && +line.attr("opacity") > 0) {
    return;
  }
  drawLine(selector, x, x, x, yStart, y1, y2, transitionDelay);
}

function drawRegressionLine(treatment: number): void {
  const selector =
    treatment === pboTreatment ? "line.pbo-regression" : "line.rx-regression";
  const line = gData.select(selector);
  if (line && +line.attr("opacity") > 0) {
    return;
  }
  drawLine(
    selector,
    0,
    0,
    10,
    regression(treatment, 0),
    regression(treatment, 0),
    regression(treatment, 10),
    transitionDuration,
  );
}

function drawXAxis(offsetY: number, opacity: number): void {
  gXAxis
    .call(d3.axisBottom(xScale))
    .transition()
    .duration(transitionDuration)
    .attr("opacity", opacity)
    .attr(
      "transform",
      `translate(${margin.left}, ${margin.top + gDataSize.height + offsetY})`,
    );

  gXLabel
    .transition()
    .duration(transitionDuration)
    .attr("opacity", opacity)
    .attr(
      "transform",
      `translate(${margin.left + 0.5 * gDataSize.width}, ${svgSize.height -
        0.5 * margin.bottom +
        offsetY})`,
    );
}

function drawYAxis(offsetX: number, opacity: number): void {
  gYAxis
    .call(d3.axisLeft(yScale))
    .transition()
    .duration(transitionDuration)
    .attr("opacity", opacity)
    .attr("transform", `translate(${margin.left - offsetX}, ${margin.top})`);

  gYLabel
    .transition()
    .duration(transitionDuration)
    .attr("opacity", opacity)
    .attr(
      "transform",
      `translate(${0.5 * margin.left - offsetX}, ${margin.top +
        0.5 * gDataSize.height})`,
    );
}

function drawHorizontalMeanLines(): void {
  drawHorizontalLine(
    "line.pbo-dlqi-mean",
    0,
    0,
    10,
    pboDlqiMean,
    transitionDuration,
  );
  drawHorizontalLine(
    "line.rx-dlqi-mean",
    0,
    0,
    10,
    rxDlqiMean,
    transitionDuration,
  );
}

function drawMediatorEffect(): void {
  const yPbo = regression(0, itchMidpoint);
  const yRx = regression(1, itchMidpoint);
  const yMid = (yPbo + yRx) / 2;
  drawVerticalLine(
    "line.mediator-effect",
    itchMidpoint,
    yMid,
    yPbo,
    yRx,
    transitionDuration,
  );
}

function eraseLine(
  selector: string,
  x1: number,
  x2: number,
  xEnd: number,
  y1: number,
  y2: number,
  yEnd: number,
  transitionDelay: number,
): void {
  gData
    .select(selector)
    .transition()
    .delay(transitionDelay)
    .duration(0)
    .attr("x1", xScale(x1) || 0)
    .attr("x2", xScale(x2) || 0)
    .attr("y1", yScale(y1) || 0)
    .attr("y2", yScale(y2) || 0)
    .transition()
    .duration(transitionDuration)
    .attr("x1", xScale(xEnd) || 0)
    .attr("x2", xScale(xEnd) || 0)
    .attr("y1", yScale(yEnd) || 0)
    .attr("y2", yScale(yEnd) || 0)
    .transition()
    .duration(0)
    .attr("opacity", 0);
}

function eraseHorizontalLine(
  selector: string,
  x1: number,
  x2: number,
  xEnd: number,
  y: number,
  transitionDelay: number,
): void {
  const line = gData.select(selector);
  if (line && +line.attr("opacity") === 0) {
    return;
  }
  eraseLine(selector, x1, x2, xEnd, y, y, y, transitionDelay);
}

function eraseVerticalLine(
  selector: string,
  x: number,
  y1: number,
  y2: number,
  yEnd: number,
  transitionDelay: number,
): void {
  const line = gData.select(selector);
  if (line && +line.attr("opacity") === 0) {
    return;
  }
  eraseLine(selector, x, x, x, y1, y2, yEnd, transitionDelay);
}

function eraseDlqiMeanDifference(): void {
  eraseVerticalLine(
    "line.dlqi-mean-difference",
    1.5,
    pboDlqiMean,
    rxDlqiMean,
    dlqiMidpoint,
    0,
  );
}

function eraseItchMeanDifference(): void {
  eraseHorizontalLine(
    "line.itch-mean-difference",
    rxItchMean,
    pboItchMean,
    itchMidpoint,
    4,
    0,
  );
}

function eraseHorizontalMeanLines(): void {
  eraseHorizontalLine("line.pbo-dlqi-mean", 0, 10, 0, pboDlqiMean, 0);
  eraseHorizontalLine("line.rx-dlqi-mean", 0, 10, 0, rxDlqiMean, 0);
}

function eraseRegressionLine(treatment: number): void {
  const selector =
    treatment === pboTreatment ? "line.pbo-regression" : "line.rx-regression";
  const line = gData.select(selector);
  if (line && +line.attr("opacity") === 0) {
    return;
  }
  eraseLine(
    selector,
    0,
    10,
    0,
    regression(treatment, 0),
    regression(treatment, 10),
    regression(treatment, 0),
    transitionDuration,
  );
}

function eraseMediatorEffect(): void {
  const yPbo = regression(0, itchMidpoint);
  const yRx = regression(1, itchMidpoint);
  const yMid = (yPbo + yRx) / 2;
  eraseVerticalLine(
    "line.mediator-effect",
    itchMidpoint,
    yPbo,
    yRx,
    yMid,
    transitionDuration,
  );
}

function getExtent(
  sourceData: SourceDatum[],
  path: (d: SourceDatum) => number,
): [number, number] {
  const extent = d3.extent(sourceData, path);
  if (extent[0] === undefined || extent[1] === undefined) {
    return [0, 0];
  }
  return extent;
}

function setDimensions(): void {
  svg = d3.select("#mediator-analysis-graphic");
  const svgClientRect = svg.node()?.getBoundingClientRect();
  svgSize = {
    width: svgClientRect?.width || 0,
    height: svgClientRect?.height || 0,
  };
  gDataSize = {
    width: svgSize.width - margin.left - margin.right,
    height: svgSize.height - margin.top - margin.bottom,
  };
  console.log(`SVG dimensions: ${svgSize.width} x ${svgSize.height}`);
}

function setVueId(): void {
  const attributeNames: string[] = svg.node()?.getAttributeNames() || [];
  vueId = attributeNames.find((n) => n.startsWith("data-v-")) || "";
  console.log(`Vue ID: ${vueId}`);
}

function setX1Position(sourceData: SourceDatum[]): void {
  sourceData
    .reduce((prev: GroupByDlqi[], curr): GroupByDlqi[] => {
      const found = prev.find((d) => d.dlqi === curr.dlqi);
      if (found) {
        found.data.push(curr);
      } else {
        prev.push({
          dlqi: curr.dlqi,
          data: [curr],
        });
      }
      return prev;
    }, [])
    .sort((a, b) => d3.ascending(a.dlqi, b.dlqi))
    .forEach((yGroup) => {
      const length = 2 * circleRadius * yGroup.data.length;
      const halfLength = length / 2;
      yGroup.data.forEach((datum, i) => {
        datum.x1 = (xScale(5) || 0) - halfLength + i * 2 * circleRadius;
      });
    });
}

function setX2Position(sourceData: SourceDatum[]): void {
  [0, 1].forEach((treatment) => {
    const scalePosition = treatment === 0 ? 3 : 7;
    sourceData
      .filter((d) => d.treatment === treatment)
      .reduce((prev: GroupByDlqi[], curr): GroupByDlqi[] => {
        const found = prev.find((d) => d.dlqi === curr.dlqi);
        if (found) {
          found.data.push(curr);
        } else {
          prev.push({
            dlqi: curr.dlqi,
            data: [curr],
          });
        }
        return prev;
      }, [])
      .sort((a, b) => d3.ascending(a.dlqi, b.dlqi))
      .forEach((yGroup) => {
        const length = 2 * circleRadius * yGroup.data.length;
        const halfLength = length / 2;
        yGroup.data.forEach((datum, i) => {
          datum.x2 =
            (xScale(scalePosition) || 0) - halfLength + i * 2 * circleRadius;
        });
      });
  });
}

function transformGData(): void {
  gData.attr("transform", `translate(${margin.left}, ${margin.top})`);
}

const steps: Record<number, Action> = {
  0: (): void => {
    drawXAxis(axisOffset, 0);
    drawYAxis(axisOffset, 0);
    circles
      .classed("pbo-datum", false)
      .classed("rx-datum", false)
      .attr("opacity", 1);
    eraseRegressionLine(pboTreatment);
    eraseRegressionLine(rxTreatment);
    eraseDlqiMeanDifference();
    eraseItchMeanDifference();
  },
  1: (): void => {
    drawYAxis(0, 1);
    circles
      .classed("pbo-datum", false)
      .classed("rx-datum", false)
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) => d.x1 || 0)
      .attr("cy", (d) => yScale(d.dlqi) || 0);
  },
  2: (): void => {
    eraseHorizontalMeanLines();
    eraseDlqiMeanDifference();
    circles
      .classed("pbo-datum", (d) => d.treatment === 0)
      .classed("rx-datum", (d) => d.treatment === 1)
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) => d.x2 || 0)
      .attr("cy", (d) => yScale(d.dlqi) || 0);
  },
  3: (): void => {
    circles
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) =>
        d.treatment === pboTreatment ? xScale(3) || 0 : xScale(7) || 0,
      )
      .attr("cy", (d) =>
        d.treatment === pboTreatment
          ? yScale(pboDlqiMean) || 0
          : yScale(rxDlqiMean) || 0,
      );

    drawHorizontalMeanLines();
    drawVerticalLine(
      "line.dlqi-mean-difference",
      1.5,
      dlqiMidpoint,
      pboDlqiMean,
      rxDlqiMean,
      2 * transitionDuration,
    );
  },
  4: (): void => {
    eraseVerticalLine(
      "line.dlqi-mean-difference",
      1.5,
      pboDlqiMean,
      rxDlqiMean,
      dlqiMidpoint,
      0,
    );
    drawXAxis(0, 1);
    circles
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) =>
        d.treatment === pboTreatment
          ? xScale(pboItchMean) || 0
          : xScale(rxItchMean) || 0,
      )
      .attr("cy", (d) =>
        d.treatment === pboTreatment
          ? yScale(pboDlqiMean) || 0
          : yScale(rxDlqiMean) || 0,
      );

    eraseVerticalLine("line.pbo-itch-mean", pboItchMean, 0, 30, 0, 0);
    eraseVerticalLine("line.rx-itch-mean", rxItchMean, 0, 30, 0, 0);
    eraseHorizontalLine(
      "line.itch-mean-difference",
      pboItchMean,
      rxItchMean,
      itchMidpoint,
      4,
      0,
    );
  },
  5: (): void => {
    // ensure that all mean lines are visible
    gData.selectAll("line.dlqi-mean").attr("opacity", 1);

    // draw vertical lines for mean itch
    drawVerticalLine("line.pbo-itch-mean", pboItchMean, 0, 0, 30, 0);
    drawVerticalLine("line.rx-itch-mean", rxItchMean, 0, 0, 30, 0);

    // draw the line indicating the mean itch difference
    drawHorizontalLine(
      "line.itch-mean-difference",
      itchMidpoint,
      rxItchMean,
      pboItchMean,
      4,
      transitionDuration,
    );

    // ensure the circles are in the correct placement
    circles
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) =>
        d.treatment === pboTreatment
          ? xScale(pboItchMean) || 0
          : xScale(rxItchMean) || 0,
      )
      .attr("cy", (d) =>
        d.treatment === pboTreatment
          ? yScale(pboDlqiMean) || 0
          : yScale(rxDlqiMean) || 0,
      );

    // erase the vertical mean DLQI difference
    eraseDlqiMeanDifference();
  },
  6: (): void => {
    eraseItchMeanDifference();
    gData.selectAll("line.mean").attr("opacity", 0.5);
    circles
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) => xScale(d.itch) || 0)
      .attr("cy", (d) => yScale(d.dlqi) || 0);

    eraseRegressionLine(pboTreatment);
    eraseRegressionLine(rxTreatment);
  },
  7: (): void => {
    // soften the mean lines
    gData.selectAll("line.mean").attr("opacity", 0.5);

    // soften the circles
    circles
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) => xScale(d.itch) || 0)
      .attr("cy", (d) => yScale(d.dlqi) || 0)
      .attr("opacity", 0.5);

    // draw 2 regression lines
    drawRegressionLine(pboTreatment);
    drawRegressionLine(rxTreatment);

    // erase difference guides
    eraseDlqiMeanDifference();
    eraseItchMeanDifference();

    // erase mediation effect
    eraseMediatorEffect();

    // Erase the DLQI annotation.
    gData
      .select("text.dlqi-annotation")
      .transition()
      .duration(transitionDuration)
      .attr("opacity", 0);
  },
  8: (): void => {
    drawMediatorEffect();
    eraseItchMeanDifference();
    drawVerticalLine(
      "line.dlqi-mean-difference",
      1.5,
      dlqiMidpoint,
      pboDlqiMean,
      rxDlqiMean,
      transitionDuration,
    );
    gData
      .select("text.dlqi-annotation")
      .attr("transform", `translate(${xScale(0.5)}, ${yScale(17.5)})`)
      .transition()
      .duration(transitionDuration)
      .delay(transitionDuration * 2)
      .attr("opacity", 1);
  },
};

export function initializeScrolling(
  sourceData: SourceDatum[],
): scrollama.StepCallback {
  setDimensions();
  setVueId();

  const itchExtent = getExtent(sourceData, (d) => d.itch);
  const dlqiExtent = getExtent(sourceData, (d) => d.dlqi);
  sourceData = sourceData.filter((d) => d.visit === visitValue);
  console.log(`Source data contains ${sourceData.length} rows`);

  gData = d3.select("g.data");
  gXAxis = d3.select("g.x-axis");
  gXLabel = d3.select("g.x-label");
  gYAxis = d3.select("g.y-axis");
  gYLabel = d3.select("g.y-label");

  xScale = d3
    .scaleLinear()
    .domain(itchExtent)
    .range([0, gDataSize.width])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain(dlqiExtent)
    .range([gDataSize.height, 0])
    .nice();

  setX1Position(sourceData);
  setX2Position(sourceData);
  transformGData();
  drawCircles(sourceData);

  return (event: scrollama.CallbackResponse): void => {
    console.log(`Invoke step ${event.index}`);
    if (typeof steps[event.index] === "function") {
      steps[event.index]();
    } else {
      console.warn(`No step ${event.index} is defined`);
    }
  };
}
