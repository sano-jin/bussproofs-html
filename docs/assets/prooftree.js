console.log("ProofTree v0.0.1");
const f = "bussproofs-html__", B = `div.${f}proof-tree{margin:20px auto}div.${f}sequent{width:auto;text-align:center}div.${f}premises{width:auto;display:flex;flex-direction:row;gap:20px;align-items:flex-end}div.${f}horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.${f}horizontal-rule>.${f}right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}`, X = (t = null) => {
  console.log(`renderProofTreesOnLoad(${t})`), document.addEventListener("DOMContentLoaded", () => {
    $(t);
  });
}, $ = (t = null) => {
  console.log(`renderProofTrees(${t})`);
  const e = document.createElement("style");
  e.innerHTML = B, document.head.appendChild(e), Array.from(
    document.body.getElementsByTagName("P")
  ).filter(
    (s) => s.innerHTML.includes("\\begin{prooftree}")
  ).forEach((s) => N(s, t));
}, N = (t, e) => {
  try {
    const n = v(t);
    if (!n) throw new Error("cannot find fragment");
    const o = z(n);
    if (!o) throw new Error("error: cannot recognise latex command");
    const s = S(o);
    if (!s) throw new Error("error: cannot construct proof tree");
    n == null || n.nodeList.slice(1).forEach((l) => {
      var c;
      return (c = l.parentNode) == null ? void 0 : c.removeChild(l);
    });
    const r = H(s);
    t.insertBefore(n == null ? void 0 : n.beforeTextNode, n == null ? void 0 : n.nodeList[0]), t.insertBefore(r, n == null ? void 0 : n.nodeList[0]), t.insertBefore(n == null ? void 0 : n.afterTextNode, n == null ? void 0 : n.nodeList[0]), t.removeChild(n == null ? void 0 : n.nodeList[0]), e === null ? window.addEventListener("load", () => C(r), !1) : setTimeout(() => C(r), e), t.innerHTML.includes("\\begin{prooftree}") && N(t, e);
  } catch (n) {
    console.error(n);
  }
}, L = (t, e) => {
  let n = -1, o = -1;
  for (let i = 0; i < e.length; i++)
    if (e[i].nodeType === Node.TEXT_NODE) {
      const u = e[i].nodeValue.indexOf(t);
      if (u !== -1) {
        o = i, n = u;
        break;
      }
    }
  if (n === -1) return null;
  const s = e[o].nodeValue, r = s.slice(0, n), l = s.slice(n + t.length), c = document.createTextNode(r), m = document.createTextNode(l);
  return [o, c, m];
}, v = (t) => {
  const e = Array.from(t.childNodes), n = L("\\begin{prooftree}", e);
  if (n === null) return null;
  const [o, s, r] = n, l = e.slice(o), c = [...l];
  c.splice(0, 1, r);
  const m = L("\\end{prooftree}", c);
  if (m === null) return null;
  const [i, u, d] = m, h = l.slice(0, i + 1), y = c;
  y.splice(
    i,
    c.length - i,
    u
  );
  const p = y.filter(
    (x) => x.nodeType !== Node.COMMENT_NODE
  );
  return {
    nodeList: h,
    prtrNodeList: p,
    beforeTextNode: s,
    afterTextNode: d
  };
}, I = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, P = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else return P(t);
  return !1;
}, a = (t, e) => {
  const n = t[0].nodeValue, o = n.indexOf("}");
  if (o !== -1) {
    const s = document.createTextNode(n.slice(0, o));
    return t[0].nodeValue = n.substring(o + 1), e.push(s), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else return a(t, e);
    return null;
  }
}, z = (t) => {
  const e = t.prtrNodeList;
  let n = [], o = 100;
  for (; e.length > 0 && o-- > 0 && (I(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const s = e[0].nodeValue;
    if (s.startsWith("%")) {
      if (e[0].nodeValue = s.substring(1), !P(e)) return null;
    } else if (s.startsWith("\\AXC{")) {
      e[0].nodeValue = s.substring(5);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "AXC", body: r });
    } else if (s.startsWith("\\UIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "UIC", body: r });
    } else if (s.startsWith("\\BIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "BIC", body: r });
    } else if (s.startsWith("\\TIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "TIC", body: r });
    } else if (s.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = s.substring(16);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "QuaternaryInfC", body: r });
    } else if (s.startsWith("\\RightLabel{")) {
      e[0].nodeValue = s.substring(12);
      const r = a(e, []);
      if (r === null) return null;
      n.push({ type: "RightLabel", body: r });
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
}, T = (t, e, n) => {
  const o = t[0];
  if (!o) return null;
  let s = [];
  o.type === "RightLabel" && (t.shift(), s = o.body);
  const r = [];
  for (let l = 0; l < n; l++) {
    const c = V(t);
    if (!c) return null;
    r.push(c);
  }
  return {
    type: "Sequent",
    premises: r.reverse(),
    rightLabel: s,
    conclusion: e
  };
}, V = (t) => {
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
}, S = (t) => {
  const e = V(t.reverse());
  return t.length > 0 ? null : e;
}, g = (t, e) => {
  const n = document.createElement("div");
  return n.classList.add(f + t), (t === "axiom" || t === "right-label" || t === "conclusion") && (n.style.width = "max-content"), e.forEach((o) => n.appendChild(o)), n;
}, E = (t) => {
  switch (t.type) {
    case "Axiom":
      return g("axiom", t.axiom);
    case "Sequent":
      return g("sequent", [
        g("premises", t.premises.map(E)),
        g("horizontal-rule", [g("right-label", t.rightLabel)]),
        g("conclusion", t.conclusion)
      ]);
  }
}, H = (t) => g("proof-tree", [E(t)]), M = 20, w = 20, R = 10, q = (t) => t.reduce((e, n) => e + n, 0), W = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.marginLeft = `${w}px`;
      return;
    }
    case "PSSequent": {
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach(W);
      return;
    }
  }
}, A = (t) => {
  if (t.classList.contains(f + "axiom")) {
    const e = t.offsetWidth + w * 2;
    return {
      type: "PSAxiom",
      prtrStyleAux: {
        w: e,
        whr: e,
        mlc: 0,
        mrc: 0,
        mlhr: 0,
        mrhr: 0,
        widthC: e,
        widthL: 0,
        mlp: 0
      },
      node: t
    };
  } else if (t.classList.contains(f + "sequent")) {
    const e = t.children[0], n = t.children[1], o = n.children[0], s = t.children[2], r = Array.prototype.slice.apply(e.children), l = s.children[0] ? s.children[0].offsetWidth + w * 2 : s.offsetWidth + w * 2, c = o.offsetWidth + R, m = r.map(A), i = m.map((d) => d.prtrStyleAux);
    r.length === 0 && console.error("error: empty premises", r);
    const u = q(i.map((d) => d.w)) + M * (i.length - 1) - i[0].mlc - i[i.length - 1].mrc;
    if (u > l) {
      const d = u, h = i[0].mlc, y = h + (u - l) / 2, p = Math.max(i[i.length - 1].mrc, c), b = p + (u - l) / 2;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: d + h + p, whr: d, mlc: y, mrc: b, mlhr: h, mrhr: p, widthC: l, widthL: c, mlp: 0 },
        premises: m,
        node: t,
        nodePremises: e,
        nodeHR: n,
        nodeLabel: o,
        nodeConclusion: s
      };
    } else {
      const d = l, h = Math.max(i[0].mlc - (l - u) / 2, 0), y = Math.max((l - u) / 2 - i[0].mlc, 0), p = h, b = Math.max(i[i.length - 1].mrc - (l - u) / 2, c), x = b;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: d + h + b, whr: d, mlc: p, mrc: x, mlhr: h, mrhr: b, widthC: l, widthL: c, mlp: y },
        premises: m,
        node: t,
        nodePremises: e,
        nodeHR: n,
        nodeLabel: o,
        nodeConclusion: s
      };
    }
  } else
    throw new Error("error");
}, C = (t) => {
  const e = A(t.children[0]);
  W(e);
};
export {
  $ as renderProofTrees,
  X as renderProofTreesOnLoad
};
