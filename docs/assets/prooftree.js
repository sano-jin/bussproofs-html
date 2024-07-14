console.log("ProofTree v0.0.1");
const p = "bussproofs-html__", x = {
  marginPremises: 20,
  paddingAxiomConclusion: 20,
  marginLabelLeft: 10,
  styleOnLoad: null
}, $ = (t) => ({
  marginPremises: t.marginPremises ?? x.marginPremises,
  paddingAxiomConclusion: t.paddingAxiomConclusion ?? x.paddingAxiomConclusion,
  marginLabelLeft: t.marginLabelLeft ?? x.marginLabelLeft,
  styleOnLoad: t.styleOnLoad ?? x.styleOnLoad
}), B = (t) => `div.${p}proof-tree{width:max-content;margin:20px auto}div.${p}sequent{width:auto;text-align:center}div.${p}premises{width:auto;display:flex;flex-direction:row;gap:${t.marginPremises}px;align-items:flex-end}div.${p}horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.${p}horizontal-rule>.${p}right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}`, X = (t = x) => {
  console.log(`renderProofTreesOnLoad(${t})`), document.addEventListener("DOMContentLoaded", () => {
    v(t);
  });
}, v = (t = x) => {
  console.log(`renderProofTrees(${t})`);
  const e = $(t), n = document.createElement("style");
  n.innerHTML = B(e), document.head.appendChild(n), Array.from(
    document.body.getElementsByTagName("P")
  ).filter(
    (o) => o.innerHTML.includes("\\begin{prooftree}")
  ).forEach((o) => P(o, e));
}, P = (t, e) => {
  try {
    const n = I(t);
    if (!n) throw new Error("cannot find fragment");
    const r = S(n);
    if (!r) throw new Error("error: cannot recognise latex command");
    const s = H(r);
    if (!s) throw new Error("error: cannot construct proof tree");
    n == null || n.nodeList.slice(1).forEach((u) => {
      var i;
      return (i = u.parentNode) == null ? void 0 : i.removeChild(u);
    });
    const o = M(s);
    t.insertBefore(n == null ? void 0 : n.beforeTextNode, n == null ? void 0 : n.nodeList[0]), t.insertBefore(o, n == null ? void 0 : n.nodeList[0]), t.insertBefore(n == null ? void 0 : n.afterTextNode, n == null ? void 0 : n.nodeList[0]), t.removeChild(n == null ? void 0 : n.nodeList[0]), e.styleOnLoad === null ? window.addEventListener("load", () => N(e, o), !1) : setTimeout(() => N(e, o), e.styleOnLoad), t.innerHTML.includes("\\begin{prooftree}") && P(t, e);
  } catch (n) {
    console.error(n);
  }
}, C = (t, e) => {
  let n = -1, r = -1;
  for (let a = 0; a < e.length; a++)
    if (e[a].nodeType === Node.TEXT_NODE) {
      const l = e[a].nodeValue.indexOf(t);
      if (l !== -1) {
        r = a, n = l;
        break;
      }
    }
  if (n === -1) return null;
  const s = e[r].nodeValue, o = s.slice(0, n), u = s.slice(n + t.length), i = document.createTextNode(o), f = document.createTextNode(u);
  return [r, i, f];
}, I = (t) => {
  const e = Array.from(t.childNodes), n = C("\\begin{prooftree}", e);
  if (n === null) return null;
  const [r, s, o] = n, u = e.slice(r), i = [...u];
  i.splice(0, 1, o);
  const f = C("\\end{prooftree}", i);
  if (f === null) return null;
  const [a, l, m] = f, d = u.slice(0, a + 1), h = i;
  h.splice(
    a,
    i.length - a,
    l
  );
  const L = h.filter(
    (g) => g.nodeType !== Node.COMMENT_NODE
  );
  return {
    nodeList: d,
    prtrNodeList: L,
    beforeTextNode: s,
    afterTextNode: m
  };
}, z = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, V = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else return V(t);
  return !1;
}, c = (t, e) => {
  const n = t[0].nodeValue, r = n.indexOf("}");
  if (r !== -1) {
    const s = document.createTextNode(n.slice(0, r));
    return t[0].nodeValue = n.substring(r + 1), e.push(s), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else return c(t, e);
    return null;
  }
}, S = (t) => {
  const e = t.prtrNodeList;
  let n = [], r = 100;
  for (; e.length > 0 && r-- > 0 && (z(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const s = e[0].nodeValue;
    if (s.startsWith("%")) {
      if (e[0].nodeValue = s.substring(1), !V(e)) return null;
    } else if (s.startsWith("\\AXC{")) {
      e[0].nodeValue = s.substring(5);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "AXC", body: o });
    } else if (s.startsWith("\\UIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "UIC", body: o });
    } else if (s.startsWith("\\BIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "BIC", body: o });
    } else if (s.startsWith("\\TIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "TIC", body: o });
    } else if (s.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = s.substring(16);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "QuaternaryInfC", body: o });
    } else if (s.startsWith("\\RightLabel{")) {
      e[0].nodeValue = s.substring(12);
      const o = c(e, []);
      if (o === null) return null;
      n.push({ type: "RightLabel", body: o });
    } else if (s.startsWith("\\normalsize{")) {
      if (e[0].nodeValue = s.substring(12), c(e, []) === null) return null;
    } else if (s.startsWith("\\normalsize"))
      e[0].nodeValue = s.substring(11);
    else if (s.startsWith("\\small{")) {
      if (e[0].nodeValue = s.substring(7), c(e, []) === null) return null;
    } else if (s.startsWith("\\small"))
      e[0].nodeValue = s.substring(6);
    else if (s.startsWith("\\footnotesize{")) {
      if (e[0].nodeValue = s.substring(14), c(e, []) === null) return null;
    } else if (s.startsWith("\\footnotesize"))
      e[0].nodeValue = s.substring(13);
    else if (s.startsWith("\\scriptsize{")) {
      if (e[0].nodeValue = s.substring(12), c(e, []) === null) return null;
    } else if (s.startsWith("\\scriptsize"))
      e[0].nodeValue = s.substring(11);
    else if (s.startsWith("\\tiny{")) {
      if (e[0].nodeValue = s.substring(6), c(e, []) === null) return null;
    } else if (s.startsWith("\\tiny"))
      e[0].nodeValue = s.substring(5);
    else if (e[0].nodeValue.length === 0)
      e.shift();
    else
      return console.error("error: unrecognised charactor", e[0].nodeValue), null;
  }
  return n;
}, T = (t, e, n) => {
  const r = t[0];
  if (!r) return null;
  let s = [];
  r.type === "RightLabel" && (t.shift(), s = r.body);
  const o = [];
  for (let u = 0; u < n; u++) {
    const i = E(t);
    if (!i) return null;
    o.push(i);
  }
  return {
    type: "Sequent",
    premises: o.reverse(),
    rightLabel: s,
    conclusion: e
  };
}, E = (t) => {
  const e = t.shift();
  if (!e) return null;
  switch (e.type) {
    case "AXC":
      return { type: "Axiom", axiom: e.body };
    case "UIC":
      return T(t, e.body, 1);
    case "BIC":
      return T(t, e.body, 2);
    case "TIC":
      return T(t, e.body, 3);
    case "QuaternaryInfC":
      return T(t, e.body, 4);
  }
  return null;
}, H = (t) => {
  const e = E(t.reverse());
  return t.length > 0 ? null : e;
}, y = (t, e) => {
  const n = document.createElement("div");
  return n.classList.add(p + t), (t === "axiom" || t === "right-label" || t === "conclusion") && (n.style.width = "max-content"), e.forEach((r) => n.appendChild(r)), n;
}, A = (t) => {
  switch (t.type) {
    case "Axiom":
      return y("axiom", t.axiom);
    case "Sequent":
      return y("sequent", [
        y("premises", t.premises.map(A)),
        y("horizontal-rule", [y("right-label", t.rightLabel)]),
        y("conclusion", t.conclusion)
      ]);
  }
}, M = (t) => y("proof-tree", [A(t)]), R = (t) => t.reduce((e, n) => e + n, 0), W = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.width = `${t.prtrStyleAux.w}px`;
      return;
    }
    case "PSSequent": {
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach(W);
      return;
    }
  }
}, O = (t) => (e) => {
  if (e.classList.contains(p + "axiom")) {
    const n = e.offsetWidth + 1 + t.paddingAxiomConclusion * 2;
    return {
      type: "PSAxiom",
      prtrStyleAux: {
        w: n,
        whr: n,
        mlc: 0,
        mrc: 0,
        mlhr: 0,
        mrhr: 0,
        widthC: n,
        widthL: 0,
        mlp: 0
      },
      node: e
    };
  } else if (e.classList.contains(p + "sequent")) {
    const n = e.children[0], r = e.children[1], s = r.children[0], o = e.children[2], u = Array.prototype.slice.apply(n.children), i = o.children[0] ? o.children[0].offsetWidth + 1 + t.paddingAxiomConclusion * 2 : o.offsetWidth + 1 + t.paddingAxiomConclusion * 2, f = s.offsetWidth + t.marginLabelLeft, a = u.map(O(t)), l = a.map((d) => d.prtrStyleAux);
    u.length === 0 && console.error("error: empty premises", u);
    const m = R(l.map((d) => d.w)) + t.marginPremises * (l.length - 1) - l[0].mlc - l[l.length - 1].mrc;
    if (m > i) {
      const d = m, h = l[0].mlc, L = h + (m - i) / 2, b = Math.max(l[l.length - 1].mrc, f), g = b + (m - i) / 2;
      return {
        type: "PSSequent",
        prtrStyleAux: {
          w: d + h + b,
          whr: d,
          mlc: L,
          mrc: g,
          mlhr: h,
          mrhr: b,
          widthC: i,
          widthL: f,
          mlp: 0
        },
        premises: a,
        node: e,
        nodePremises: n,
        nodeHR: r,
        nodeLabel: s,
        nodeConclusion: o
      };
    } else {
      const d = i, h = Math.max(l[0].mlc - (i - m) / 2, 0), L = Math.max((i - m) / 2 - l[0].mlc, 0), b = h, g = Math.max(
        l[l.length - 1].mrc - (i - m) / 2,
        f
      ), w = g;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: d + h + g, whr: d, mlc: b, mrc: w, mlhr: h, mrhr: g, widthC: i, widthL: f, mlp: L },
        premises: a,
        node: e,
        nodePremises: n,
        nodeHR: r,
        nodeLabel: s,
        nodeConclusion: o
      };
    }
  } else
    throw new Error("error");
}, N = (t, e) => {
  const n = O(t)(e.children[0]);
  W(n);
};
export {
  v as renderProofTrees,
  X as renderProofTreesOnLoad
};
