import { defineAsyncComponent } from "vue";
import type { ClientConfig } from "vuepress/client";
import { defineClientConfig } from "vuepress/client";

// The comparison report is only used on the comparison page, so it is loaded lazily to keep the
// comparison data out of the shared application bundle.
const ComparisonReport = defineAsyncComponent(() => import("./components/ComparisonReport.vue"));

const clientConfig: ClientConfig = defineClientConfig({
  enhance: ({ app }) => {
    app.component("ComparisonReport", ComparisonReport);
  },
});

export default clientConfig;
