// Visual explorers (la/visual.js) in each concept's Playground, after the step-by-step walkthrough: optional free play
// once the walkthrough's picture has shown you what's going on.
// The vectors to sort in the "spaces" widget were checked with a computer algebra system (the widget also computes them).
(function () {
"use strict";
const play = (id, p) => { const c = window.STUDY.content[id]; (c.playground = c.playground || []).push(p); };
const how = "<p>Do the missions in order: each one asks you to make something happen, then explains what you just saw. After that it's free play.</p>";

const A1 = { A: [[1, 2, 3], [2, 4, 6]], items: [[3, 0, -1], [1, 2], [1, 1, 1], [2, 1], [0, 0, 0]] };
const A2 = { A: [[1, 0], [0, 1], [1, 1]], items: [[1, 1, 2], [2, -1], [1, 1, 0], [0, 0]] };
const A3 = { A: [[1, 2, 0, 1], [0, 0, 1, 2], [1, 2, 1, 3]], items: [[-2, 1, 0, 0], [1, 0, 1], [1, 1, 1, 1], [1, 1, 1], [-1, 0, -2, 1], [2, 3, 5]] };
const A4 = { A: [[1, 1, 0], [0, 1, 1], [1, 0, 1]], items: [{ v: [1, -1, 1], role: "in" }, { v: [5, -3, 2], role: "out" }, { v: [0, 0, 0], role: "in" }] };

play("toolbox", { id: "see-transform", widget: "transform2d", lec: [4, 5], title: "Play with it: what a matrix does to the plane",
  intro: how + "<p>A matrix is a machine that moves every point of the plane. The left picture is the inputs, the right picture is where they land. The red and blue arrows on the right are the <b>columns</b> of A.</p>",
  config: { missions: ["e1", "rot90", "scale", "refl", "flat"] } });

play("kernel-image", { id: "see-spaces", widget: "spaces", lec: [7, 8], title: "Play with it: where ker A and im A live",
  intro: "<p>The #1 confusion on this topic is <b>which space</b> an answer belongs to. Kernel vectors are inputs, image vectors are outputs, and they usually don't even have the same number of entries. Predict, then sort vectors into the right place.</p>",
  config: { matrices: [A1, A2, A3, A4] } });
play("kernel-image", { id: "see-transform", widget: "transform2d", lec: [7, 8], title: "Play with it: kernel and image as pictures",
  intro: how + "<p>Left: inputs (where ker A lives, in orange). Right: outputs (where im A lives, in green). Squash the plane and watch both appear.</p>",
  config: { missions: ["e1", "flat", "kernel", "proj"] } });

play("basis-dimension", { id: "see-spaces", widget: "spaces", lec: [8], title: "Play with it: rank–nullity, column by column",
  intro: "<p>Every column of A is either a pivot column (one more dimension of im A) or a free column (one more direction in ker A). Predict the dimensions, then check.</p>",
  config: { matrices: [A3, A1, A4] } });

play("orth-complement", { id: "see-3d", widget: "proj3d", lec: [11], title: "Play with it: V and V⊥ in 3D",
  intro: how + "<p>The green sheet is a plane V. The orange dashed line is V⊥: every vector perpendicular to all of V. Drag the picture to turn it.</p>",
  config: { missions: ["perp", "edge", "line"] } });

play("projections", { id: "see-3d", widget: "proj3d", lec: [11], title: "Play with it: projecting onto a plane",
  intro: how + "<p>x (purple) splits into x∥ (green, lying in V) plus x⊥ (orange, along V⊥). Projecting = keeping only x∥. Move x with the sliders, drag the picture to turn it.</p>",
  config: { missions: ["inV", "perp", "edge", "line"] } });

play("coordinates", { id: "see-grid", widget: "basisgrid", lec: [9], title: "Play with it: coordinates are steps along a basis",
  intro: how + "<p>A basis gives you a new (slanted) grid. [x]<sub>B</sub> = (c₁, c₂) means: take c₁ steps along v₁, then c₂ steps along v₂.</p>",
  config: { v1: [2, 1], v2: [-1, 1], x: [1, 2], missions: ["reach", "move", "std", "flat"] } });

const T = [[1, 2], [2, 1]];
play("b-matrix", { id: "see-grid", widget: "basisgrid", lec: [10], title: "Play with it: the same T in a better basis",
  intro: how + "<p>T is the matrix A below. Drag v₁ and v₂ and watch the B-matrix change. In the right basis, T turns out to be just stretching.</p>",
  config: { T, v1: [1, 0], v2: [0, 1], missions: ["col1", "diag", "swap"] } });

play("similarity", { id: "see-grid", widget: "basisgrid", lec: [10], title: "Play with it: similar matrices are one map in two grids",
  intro: how + "<p>Every invertible S = [v₁ v₂] gives a matrix B = S<sup>−1</sup>AS similar to A. Drag the basis: B changes, but det and trace never do.</p>",
  config: { T, v1: [2, 1], v2: [0, 1], missions: ["diag", "swap", "flat"] } });
})();
