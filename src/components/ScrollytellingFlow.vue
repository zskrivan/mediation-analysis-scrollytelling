<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as d3 from "d3";
import scrollama from "scrollama";
import { initializeScrolling } from "@/lib/actions/initializeScrolling";
import { SourceDatum } from "@/lib/models";
import { config } from "@/lib/config";

@Component({
  name: "ScrollytellingFlow",
})
export default class ScrollytellingFlow extends Vue {
  countSteps = -1;
  pathToSource = config.pathToSource;
  scroller: scrollama.ScrollamaInstance = scrollama();
  sourceData: SourceDatum[] = [];

  get scrollyHeight(): number {
    return this.countSteps * this.windowHeight;
  }

  get windowHeight(): number {
    return window.innerHeight;
  }

  async fetchSource(): Promise<void> {
    const csv = await d3.csv(this.pathToSource, d3.autoType);
    this.sourceData = csv.map((d) => d as SourceDatum);
  }

  async mounted(): Promise<void> {
    await this.fetchSource();
    this.$nextTick(() => {
      this.countSteps = this.$el.querySelectorAll(".step").length;
      this.scroller
        .setup({
          step: ".step",
          offset: 0.7,
          progress: false,
          debug: false,
        })
        .onStepEnter(initializeScrolling(this.sourceData));
    });
  }
}
</script>

<template>
  <div id="scrollytelling-flow" class="scroll">
    <div class="container">
      <div class="row">
        <div class="col-4">
          <article
            class="scroll-article"
            :style="{ height: `${scrollyHeight}px` }"
          >
            <div
              class="step"
              data-step="0"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                We begin a mediation analysis with a collection of 400
                observations at visit 6.
              </p>
            </div>
            <div
              class="step"
              data-step="1"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Our dependent variable, DLQI, is shown along the y-axis.
                Observations are shown reflective to their DLQI values.
              </p>
            </div>
            <div
              class="step"
              data-step="2"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Next, we separate our data by treatment arm. Subjects receiving
                <span class="pbo">placebo</span> are
                <span class="pbo">colored in gray</span>. Subjects receiving
                <span class="rx">treatment</span> are
                <span class="rx">colored in blue</span>. We have also separated
                the stacks for further clarity.
              </p>
            </div>
            <div
              class="step"
              data-step="3"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Let's collapse each treatment arm to its mean value for DLQI.
                The mean for <span class="pbo">placebo</span> is
                <span class="pbo">16.2.</span> The mean for
                <span class="rx">treatment</span> is
                <span class="rx">10.8</span>. This difference of
                <strong>5.4</strong> is the effect of treatment on DLQI. This
                was found to be statistically significant.
              </p>
            </div>
            <div
              class="step"
              data-step="4"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Next, let's add an x-axis for itch. We will move the points for
                <span class="pbo">placebo</span> and
                <span class="rx">treatment</span> to their respective mean
                values.
              </p>
            </div>
            <div
              class="step"
              data-step="5"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Treatment was a statistically significant predictor of itch, the
                potential mediator variable. The
                <span class="pbo">placebo</span> arm has a mean itch value of
                <span class="pbo">6.5</span>. The
                <span class="rx">treatment</span> arm has a mean value of
                <span class="rx">4.7</span>. The effect of treatment on itch is
                <strong>1.8</strong>.
              </p>
            </div>
            <div
              class="step"
              data-step="6"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Now, let's show all points as a scatterplot of DLQI vs itch.
              </p>
            </div>
            <div
              class="step"
              data-step="7"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                Let's add regression lines for
                <span class="pbo">placebo</span> and
                <span class="rx">treatment</span>.
              </p>
              <p>
                The line for
                <span class="pbo">placebo</span> is<br />
                <span class="mono">DLQI = 4.6 + 1.78 * (itch)</span>
              </p>
              <p>
                The line for <span class="rx">treatment</span> is<br />
                <span class="mono">DLQI = 2.41 + 1.78 * (itch)</span>.
              </p>
            </div>
            <div
              class="step"
              data-step="8"
              :style="{ 'min-height': `${windowHeight}px` }"
            >
              <p>
                The treatment difference in DLQI without itch was
                <strong>5.4</strong>. When itch was accounted for the treatment
                difference in DLQI was reduced to <strong>2.19</strong> and itch
                was still a significant predictor of DLQI when treatment was in
                the model. This is evidence that itch is a mediator variable for
                the treatment effect on DLQI.
              </p>
            </div>
          </article>
        </div>
        <div class="col-8">
          <figure
            class="scroll-figure"
            :style="{ height: `${windowHeight}px` }"
          >
            <svg id="mediator-analysis-graphic">
              <defs>
                <marker
                  id="startarrow"
                  orient="auto"
                  markerWidth="2"
                  markerHeight="4"
                  refX="0.1"
                  refY="2"
                >
                  <path fill="black" d="M2,0 V4 L0,2 Z" />
                </marker>
                <marker
                  id="endarrow"
                  orient="auto"
                  markerWidth="2"
                  markerHeight="4"
                  refX="1.9"
                  refY="2"
                >
                  <path fill="black" d="M0,0 V4 L2,2 Z" />
                </marker>
              </defs>
              <g class="x-axis" transform="translate(0, 0)" opacity="0" />
              <g class="x-label" transform="translate(0, 0)" opacity="0">
                <text>Itch</text>
              </g>
              <g class="y-axis" transform="translate(0, 0)" opacity="0" />
              <g class="y-label" transform="translate(0, 0)" opacity="0">
                <text transform="rotate(-90)">DLQI</text>
              </g>
              <g class="data" transform="translate(0, 0)">
                <line
                  class="mean dlqi-mean pbo-dlqi-mean pbo-line"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                />
                <line
                  class="mean dlqi-mean rx-dlqi-mean rx-line"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                />
                <line
                  class="mean-difference dlqi-mean-difference"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                  marker-start="url(#startarrow)"
                  marker-end="url(#endarrow)"
                />
                <text class="dlqi-mean-difference" fill="black" opacity="0" />
                <line
                  class="mean itch-mean pbo-itch-mean pbo-line"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                />
                <line
                  class="mean itch-mean rx-itch-mean rx-line"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                />
                <line
                  class="mean-difference itch-mean-difference"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                  marker-start="url(#startarrow)"
                  marker-end="url(#endarrow)"
                />
                <text
                  class="itch-mean-difference"
                  opacity="0"
                  text-anchor="middle"
                />
                <line
                  class="regression pbo-regression pbo-line"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="0"
                  opacity="0"
                />
                <line
                  class="regression rx-regression rx-line"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="0"
                  opacity="0"
                />
                <line
                  class="mediator-effect"
                  x1="-100"
                  x2="-100"
                  y1="-100"
                  y2="-100"
                  stroke="black"
                  stroke-width="4"
                  opacity="0"
                  marker-start="url(#startarrow)"
                  marker-end="url(#endarrow)"
                />
                <text
                  class="dlqi-annotation"
                  transform="translate(130, 320)"
                  font-size="12"
                  opacity="0"
                >
                  <tspan x="0">Treatment effect on DLQI,</tspan>
                  <tspan x="0" y="16">ignoring all other covariates</tspan>
                </text>
              </g>
            </svg>
          </figure>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/scss/svg";

.scroll-article {
  padding: 5rem 0;
}

.scroll-figure {
  position: sticky;
  top: 0;
  padding: 5rem 0;
}

#mediator-analysis-graphic {
  width: 100%;
  height: 100%;
  display: block;
  background: white;
  border: 1px solid #e0e0e0;
}

.step {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

span.pbo {
  color: $pbo-color;
}

span.rx {
  color: $rx-color;
}

span.mono {
  font-family: Monoco, Consolas, Cambria, monospace;
}
</style>
