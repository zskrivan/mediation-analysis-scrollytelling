<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { config } from "@/lib/config";

@Component({
  name: "DlqiDefinition",
})
export default class DlqiDefinition extends Vue {
  baseUrl = config.baseUrl;
}
</script>

<template>
  <div id="dlqi-definition">
    <div class="container">
      <div class="row h-100" style="min-height: 50vh;">
        <div
          class="col-12 col-md-6 col-lg-4 d-flex flex-column justify-content-end"
        >
          <h2>DLQI</h2>
          <p>
            The Dermatology Life Quality Index (DLQI) questionnaire is designed
            for use in adults, i.e. patients over the age of 16. It is self
            explanatory and can be simply handed to the patient who is asked to
            fill it in without the need for detailed explanation. It is usually
            completed in one or two minutes.
          </p>
        </div>
        <div class="col-12 col-md-6 col-lg-8">
          <img
            id="dlqi-image"
            :src="`${baseUrl}img/dlqi_definition.jpg`"
            alt="DLQI"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#dlqi-definition {
  margin-top: 5rem;
}
#dlqi-image {
  width: 100%;
  clip-path: inset(0 0 0 0 round 2rem);
}
</style>
