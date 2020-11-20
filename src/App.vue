<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import "@/assets/scss/app.scss";
import AtopicDermatitis from "@/components/AtopicDermatitis.vue";
import DlqiDefinition from "@/components/DlqiDefinition.vue";
import ScrollytellingFlow from "@/components/ScrollytellingFlow.vue";
import SummaryPanel from "@/components/SummaryPanel.vue";

@Component({
  name: "App",
  components: {
    AtopicDermatitis,
    DlqiDefinition,
    ScrollytellingFlow,
    SummaryPanel,
  },
})
export default class App extends Vue {}
</script>

<template>
  <div id="app">
    <atopic-dermatitis />
    <dlqi-definition />
    <scrollytelling-flow />
    <summary-panel />
  </div>
</template>

<style lang="scss"></style>
