console.log("ProofTree v0.0.1");
const p = "bussproofs-html__", T = (t, e) => t === void 0 ? e : t, P = (t) => ({
  marginPremises: T(t.marginPremises, 20),
  paddingAxiomConclusion: T(t.paddingAxiomConclusion, 20),
  marginLabelLeft: T(t.marginLabelLeft, 10),
  styleOnLoad: T(t.styleOnLoad, null)
}), V = P({}), B = (t) => `div.${p}proof-tree{width:max-content;margin:20px auto}div.${p}sequent{width:auto;text-align:center}div.${p}premises{width:auto;display:flex;flex-direction:row;gap:${t.marginPremises}px;align-items:flex-end}div.${p}horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.${p}horizontal-rule>.${p}right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}`, _ = (t = V) => {
  console.log(`renderProofTreesOnLoad(${JSON.stringify(t)})`), document.addEventListener("DOMContentLoaded", () => {
    I(t);
  });
}, I = (t = V) => {
  console.log(`renderProofTrees(${JSON.stringify(t)})`);
  const e = P(t), n = document.createElement("style");
  n.innerHTML = B(e), document.head.appendChild(n), Array.from(
    document.body.getElementsByTagName("P")
  ).filter(
    (o) => o.innerHTML.includes("\\begin{prooftree}")
  ).forEach((o) => E(o, e));
}, E = (t, e) => {
  try {
    const n = z(t);
    if (!n) throw new Error("cannot find fragment");
    const r = H(n);
    if (!r) throw new Error("error: cannot recognise latex command");
    const s = M(r);
    if (!s) throw new Error("error: cannot construct proof tree");
    n == null || n.nodeList.slice(1).forEach((u) => {
      var i;
      return (i = u.parentNode) == null ? void 0 : i.removeChild(u);
    });
    const o = R(s);
    t.insertBefore(n == null ? void 0 : n.beforeTextNode, n == null ? void 0 : n.nodeList[0]), t.insertBefore(o, n == null ? void 0 : n.nodeList[0]), t.insertBefore(n == null ? void 0 : n.afterTextNode, n == null ? void 0 : n.nodeList[0]), t.removeChild(n == null ? void 0 : n.nodeList[0]), e.styleOnLoad === null ? window.addEventListener("load", () => N(e, o), !1) : setTimeout(() => N(e, o), e.styleOnLoad), t.innerHTML.includes("\\begin{prooftree}") && E(t, e);
  } catch (n) {
    console.error(n);
  }
}, C = (t, e) => {
  let n = -1, r = -1;
  for (let c = 0; c < e.length; c++)
    if (e[c].nodeType === Node.TEXT_NODE) {
      const l = e[c].nodeValue.indexOf(t);
      if (l !== -1) {
        r = c, n = l;
        break;
      }
    }
  if (n === -1) return null;
  const s = e[r].nodeValue, o = s.slice(0, n), u = s.slice(n + t.length), i = document.createTextNode(o), f = document.createTextNode(u);
  return [r, i, f];
}, z = (t) => {
  const e = Array.from(t.childNodes), n = C("\\begin{prooftree}", e);
  if (n === null) return null;
  const [r, s, o] = n, u = e.slice(r), i = [...u];
  i.splice(0, 1, o);
  const f = C("\\end{prooftree}", i);
  if (f === null) return null;
  const [c, l, m] = f, d = u.slice(0, c + 1), h = i;
  h.splice(
    c,
    i.length - c,
    l
  );
  const x = h.filter(
    (y) => y.nodeType !== Node.COMMENT_NODE
  );
  return {
    nodeList: d,
    prtrNodeList: x,
    beforeTextNode: s,
    afterTextNode: m
  };
}, S = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, A = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else return A(t);
  return !1;
}, a = (t, e) => {
  const n = t[0].nodeValue, r = n.indexOf("}");
  if (r !== -1) {
    const s = document.createTextNode(n.slice(0, r));
    return t[0].nodeValue = n.substring(r + 1), e.push(s), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else return a(t, e);
    return null;
  }
}, H = (t) => {
  const e = t.prtrNodeList;
  let n = [], r = 100;
  for (; e.length > 0 && r-- > 0 && (S(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const s = e[0].nodeValue;
    if (s.startsWith("%")) {
      if (e[0].nodeValue = s.substring(1), !A(e)) return null;
    } else if (s.startsWith("\\AXC{")) {
      e[0].nodeValue = s.substring(5);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "AXC", body: o });
    } else if (s.startsWith("\\UIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "UIC", body: o });
    } else if (s.startsWith("\\BIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "BIC", body: o });
    } else if (s.startsWith("\\TIC{")) {
      e[0].nodeValue = s.substring(5);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "TIC", body: o });
    } else if (s.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = s.substring(16);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "QuaternaryInfC", body: o });
    } else if (s.startsWith("\\RightLabel{")) {
      e[0].nodeValue = s.substring(12);
      const o = a(e, []);
      if (o === null) return null;
      n.push({ type: "RightLabel", body: o });
    } else if (s.startsWith("\\normalsize{")) {
      if (e[0].nodeValue = s.substring(12), a(e, []) === null) return null;
    } else if (s.startsWith("\\normalsize"))
      e[0].nodeValue = s.substring(11);
    else if (s.startsWith("\\small{")) {
      if (e[0].nodeValue = s.substring(7), a(e, []) === null) return null;
    } else if (s.startsWith("\\small"))
      e[0].nodeValue = s.substring(6);
    else if (s.startsWith("\\footnotesize{")) {
      if (e[0].nodeValue = s.substring(14), a(e, []) === null) return null;
    } else if (s.startsWith("\\footnotesize"))
      e[0].nodeValue = s.substring(13);
    else if (s.startsWith("\\scriptsize{")) {
      if (e[0].nodeValue = s.substring(12), a(e, []) === null) return null;
    } else if (s.startsWith("\\scriptsize"))
      e[0].nodeValue = s.substring(11);
    else if (s.startsWith("\\tiny{")) {
      if (e[0].nodeValue = s.substring(6), a(e, []) === null) return null;
    } else if (s.startsWith("\\tiny"))
      e[0].nodeValue = s.substring(5);
    else if (e[0].nodeValue.length === 0)
      e.shift();
    else
      return console.error("error: unrecognised charactor", e[0].nodeValue), null;
  }
  return n;
}, L = (t, e, n) => {
  const r = t[0];
  if (!r) return null;
  let s = [];
  r.type === "RightLabel" && (t.shift(), s = r.body);
  const o = [];
  for (let u = 0; u < n; u++) {
    const i = W(t);
    if (!i) return null;
    o.push(i);
  }
  return {
    type: "Sequent",
    premises: o.reverse(),
    rightLabel: s,
    conclusion: e
  };
}, W = (t) => {
  const e = t.shift();
  if (!e) return null;
  switch (e.type) {
    case "AXC":
      return { type: "Axiom", axiom: e.body };
    case "UIC":
      return L(t, e.body, 1);
    case "BIC":
      return L(t, e.body, 2);
    case "TIC":
      return L(t, e.body, 3);
    case "QuaternaryInfC":
      return L(t, e.body, 4);
  }
  return null;
}, M = (t) => {
  const e = W(t.reverse());
  return t.length > 0 ? null : e;
}, g = (t, e) => {
  const n = document.createElement("div");
  return n.classList.add(p + t), (t === "axiom" || t === "right-label" || t === "conclusion") && (n.style.width = "max-content"), e.forEach((r) => n.appendChild(r)), n;
}, O = (t) => {
  switch (t.type) {
    case "Axiom":
      return g("axiom", t.axiom);
    case "Sequent":
      return g("sequent", [
        g("premises", t.premises.map(O)),
        g("horizontal-rule", [g("right-label", t.rightLabel)]),
        g("conclusion", t.conclusion)
      ]);
  }
}, R = (t) => g("proof-tree", [O(t)]), q = (t) => t.reduce((e, n) => e + n, 0), $ = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.width = `${t.prtrStyleAux.w}px`;
      return;
    }
    case "PSSequent": {
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach($);
      return;
    }
  }
}, v = (t) => (e) => {
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
    const n = e.children[0], r = e.children[1], s = r.children[0], o = e.children[2], u = Array.prototype.slice.apply(n.children), i = o.children[0] ? o.children[0].offsetWidth + 1 + t.paddingAxiomConclusion * 2 : o.offsetWidth + 1 + t.paddingAxiomConclusion * 2, f = s.offsetWidth + t.marginLabelLeft, c = u.map(v(t)), l = c.map((d) => d.prtrStyleAux);
    u.length === 0 && console.error("error: empty premises", u);
    const m = q(l.map((d) => d.w)) + t.marginPremises * (l.length - 1) - l[0].mlc - l[l.length - 1].mrc;
    if (m > i) {
      const d = m, h = l[0].mlc, x = h + (m - i) / 2, b = Math.max(l[l.length - 1].mrc, f), y = b + (m - i) / 2;
      return {
        type: "PSSequent",
        prtrStyleAux: {
          w: d + h + b,
          whr: d,
          mlc: x,
          mrc: y,
          mlhr: h,
          mrhr: b,
          widthC: i,
          widthL: f,
          mlp: 0
        },
        premises: c,
        node: e,
        nodePremises: n,
        nodeHR: r,
        nodeLabel: s,
        nodeConclusion: o
      };
    } else {
      const d = i, h = Math.max(l[0].mlc - (i - m) / 2, 0), x = Math.max((i - m) / 2 - l[0].mlc, 0), b = h, y = Math.max(
        l[l.length - 1].mrc - (i - m) / 2,
        f
      ), w = y;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: d + h + y, whr: d, mlc: b, mrc: w, mlhr: h, mrhr: y, widthC: i, widthL: f, mlp: x },
        premises: c,
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
  const n = v(t)(e.children[0]);
  $(n);
};
export {
  I as renderProofTrees,
  _ as renderProofTreesOnLoad
};
