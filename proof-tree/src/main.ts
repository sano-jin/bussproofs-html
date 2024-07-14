import "./style.css";
import { renderProofTrees } from "./lib/prooftree";

document.addEventListener("DOMContentLoaded", function () {
  renderProofTrees();
});

// renderProofTreesOnLoad({
//   marginPremises: 100,
//   paddingAxiomConclusion: 0,
//   marginLabelLeft: 0,
//   styleOnLoad: 100,
// });
