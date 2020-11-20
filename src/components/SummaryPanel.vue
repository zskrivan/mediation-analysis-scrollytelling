<script lang="ts">
import * as d3 from "d3";
import { Component, Vue } from "vue-property-decorator";
import { config } from "@/lib/config";
import { SourceDatum } from "@/lib/models";
import { drawSummaryGraph } from "@/lib/actions/drawSummaryGraph";

@Component({
  name: "SummaryPanel",
})
export default class SummaryPanel extends Vue {
  pathToSource = config.pathToSource;
  sourceData: SourceDatum[] = [];

  async fetchSource(): Promise<void> {
    const csv = await d3.csv(this.pathToSource, d3.autoType);
    this.sourceData = csv.map((d) => d as SourceDatum);
  }

  async mounted(): Promise<void> {
    await this.fetchSource();
    this.$nextTick(() => {
      drawSummaryGraph(this.sourceData);
    });
  }
}
</script>

<template>
  <div id="summary-panel">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <svg id="summary-graphic" viewBox="0 0 1200 400" />
        </div>
      </div>

      <div class="row">
        <div class="col-3"></div>
        <div class="col-6">
          <p class="text-muted">
            <small>
              * statistically significant treatment effect on DLQI. Step 1 of
              mediator analysis.
            </small>
          </p>
          <p class="text-muted">
            <small>
              + statistically significant treatment effect of treatment on
              covariate. Step 2 of mediator analysis.
            </small>
          </p>
          <p class="text-muted">
            <small>
              # mediator variable is still statistically significant predictor
              of DLQI with treatment in the model, and the treatment effect is
              reduced when accounting for the mediator variable. Step 3 of
              mediator analysis.
            </small>
          </p>
        </div>
        <div class="col-3"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#summary-panel {
  width: 100vw;
  padding-top: 3rem;
  padding-bottom: 6rem;
  background: white;
}

#summary-graphic {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
