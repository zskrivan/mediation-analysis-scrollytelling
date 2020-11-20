let baseUrl = "/mediation-analysis-scrollytelling/";
if (window.location.hostname === "lrlweb.am.lilly.com") {
  baseUrl = "/~v6x9878/projects/mediation-analysis-scrollytelling/";
}

export const config = {
  baseUrl,
  pathToSource: `${baseUrl}data/demo.csv`,
};
