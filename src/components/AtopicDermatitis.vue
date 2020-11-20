<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { config } from "@/lib/config";

@Component({
  name: "AtopicDermatitis",
})
export default class AtopicDermatitis extends Vue {
  baseUrl = config.baseUrl;

  get backgroundImage(): string {
    return `url(${this.baseUrl}img/atopic_dermatitis.png)`;
  }
}
</script>

<template>
  <div id="atopic-dermatitis" :style="{ 'background-image': backgroundImage }">
    <div
      class="container d-flex flex-column justify-content-end pt-5 pb-5"
      style="min-height: 100vh;"
    >
      <div class="row">
        <div class="col-12 col-lg-8 col-xl-6">
          <div id="atopic-dermatitis-card">
            <h1>Autoimmune</h1>
            <h2>Mediation Analysis</h2>
            <p>
              A mediation model seeks to identify and explain the mechanism or
              process that underlies an observed relationship between an
              independent variable and a dependent variable via the inclusion of
              a third hypothetical variable, known as a mediator variable (also
              a mediating variable, intermediary variable, or intervening
              variable). Rather than a direct causal relationship between the
              independent variable and the dependent variable, a mediation model
              proposes that the independent variable influences the
              (non-observable) mediator variable, which in turn influences the
              dependent variable. Thus, the mediator variable serves to clarify
              the nature of the relationship between the independent and
              dependent variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  color: white;
}

#atopic-dermatitis {
  width: 100vw;
  min-height: 100vh;

  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  position: relative;
}

#atopic-dermatitis-card {
  background: #d52b1e;
  color: white;
  border-radius: 2rem;
  padding: 2rem;

  width: 100%;
}
</style>
