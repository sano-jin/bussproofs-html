console.log("ProofTree v0.0.1");
const u = "bussproofs-html__", W = `div.${u}proof-tree{max-width:100%;margin:20px auto}div.${u}sequent{width:auto;text-align:center}div.${u}premises{width:auto;display:flex;flex-direction:row;gap:20px;align-items:flex-end}div.${u}horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.${u}horizontal-rule>.${u}right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}`, X = () => {
  console.log("renderProofTreesOnLoad()"), document.addEventListener("DOMContentLoaded", function() {
    B();
  });
}, B = () => {
  console.log("renderProofTrees()");
  const t = document.createElement("style");
  t.innerHTML = W, document.head.appendChild(t), Array.from(
    document.body.getElementsByTagName("P")
  ).filter(
    (o) => o.innerHTML.includes("\\begin{prooftree}")
  ).forEach((o) => C(o));
}, C = (t) => {
  try {
    const e = $(t);
    if (!e) throw new Error("cannot find fragment");
    const s = I(e);
    if (!s) throw new Error("error: cannot recognise latex command");
    const o = z(s);
    if (!o) throw new Error("error: cannot construct proof tree");
    e == null || e.nodeList.slice(1).forEach((r) => {
      var l;
      return (l = r.parentNode) == null ? void 0 : l.removeChild(r);
    });
    const n = S(o);
    t.insertBefore(e == null ? void 0 : e.beforeTextNode, e == null ? void 0 : e.nodeList[0]), t.insertBefore(n, e == null ? void 0 : e.nodeList[0]), t.insertBefore(e == null ? void 0 : e.afterTextNode, e == null ? void 0 : e.nodeList[0]), t.removeChild(e == null ? void 0 : e.nodeList[0]), setTimeout(R, 0), t.innerHTML.includes("\\begin{prooftree}") && C(t);
  } catch (e) {
    console.error(e);
  }
}, w = (t, e) => {
  let s = -1, o = -1;
  for (let i = 0; i < e.length; i++)
    if (e[i].nodeType === Node.TEXT_NODE) {
      const a = e[i].nodeValue.indexOf(t);
      if (a !== -1) {
        o = i, s = a;
        break;
      }
    }
  if (s === -1) return null;
  const n = e[o].nodeValue, r = n.slice(0, s), l = n.slice(s + t.length), c = document.createTextNode(r), m = document.createTextNode(l);
  return [o, c, m];
}, $ = (t) => {
  const e = Array.from(t.childNodes), s = w("\\begin{prooftree}", e);
  if (s === null) return null;
  const [o, n, r] = s, l = e.slice(o), c = [...l];
  c.splice(0, 1, r);
  const m = w("\\end{prooftree}", c);
  if (m === null) return null;
  const [i, a, h] = m, f = l.slice(0, i + 1), y = c;
  y.splice(
    i,
    c.length - i,
    a
  );
  const p = y.filter(
    (x) => x.nodeType !== Node.COMMENT_NODE
  );
  return {
    nodeList: f,
    prtrNodeList: p,
    beforeTextNode: n,
    afterTextNode: h
  };
}, v = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, N = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else return N(t);
  return !1;
}, d = (t, e) => {
  const s = t[0].nodeValue, o = s.indexOf("}");
  if (o !== -1) {
    const n = document.createTextNode(s.slice(0, o));
    return t[0].nodeValue = s.substring(o + 1), e.push(n), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else return d(t, e);
    return null;
  }
}, I = (t) => {
  const e = t.prtrNodeList;
  let s = [], o = 100;
  for (; e.length > 0 && o-- > 0 && (v(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const n = e[0].nodeValue;
    if (n.startsWith("%")) {
      if (e[0].nodeValue = n.substring(1), !N(e)) return null;
    } else if (n.startsWith("\\AXC{")) {
      e[0].nodeValue = n.substring(5);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "AXC", body: r });
    } else if (n.startsWith("\\UIC{")) {
      e[0].nodeValue = n.substring(5);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "UIC", body: r });
    } else if (n.startsWith("\\BIC{")) {
      e[0].nodeValue = n.substring(5);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "BIC", body: r });
    } else if (n.startsWith("\\TIC{")) {
      e[0].nodeValue = n.substring(5);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "TIC", body: r });
    } else if (n.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = n.substring(16);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "QuaternaryInfC", body: r });
    } else if (n.startsWith("\\RightLabel{")) {
      e[0].nodeValue = n.substring(12);
      const r = d(e, []);
      if (r === null) return null;
      s.push({ type: "RightLabel", body: r });
    } else if (n.startsWith("\\normalsize{")) {
      if (e[0].nodeValue = n.substring(12), d(e, []) === null) return null;
    } else if (n.startsWith("\\normalsize"))
      e[0].nodeValue = n.substring(11);
    else if (n.startsWith("\\small{")) {
      if (e[0].nodeValue = n.substring(7), d(e, []) === null) return null;
    } else if (n.startsWith("\\small"))
      e[0].nodeValue = n.substring(6);
    else if (n.startsWith("\\footnotesize{")) {
      if (e[0].nodeValue = n.substring(14), d(e, []) === null) return null;
    } else if (n.startsWith("\\footnotesize"))
      e[0].nodeValue = n.substring(13);
    else if (n.startsWith("\\scriptsize{")) {
      if (e[0].nodeValue = n.substring(12), d(e, []) === null) return null;
    } else if (n.startsWith("\\scriptsize"))
      e[0].nodeValue = n.substring(11);
    else if (n.startsWith("\\tiny{")) {
      if (e[0].nodeValue = n.substring(6), d(e, []) === null) return null;
    } else if (n.startsWith("\\tiny"))
      e[0].nodeValue = n.substring(5);
    else if (e[0].nodeValue.length === 0)
      e.shift();
    else
      return console.error("error: unrecognised charactor", e[0].nodeValue), null;
  }
  return s;
}, T = (t, e, s) => {
  const o = t[0];
  if (!o) return null;
  let n = [];
  o.type === "RightLabel" && (t.shift(), n = o.body);
  const r = [];
  for (let l = 0; l < s; l++) {
    const c = P(t);
    if (!c) return null;
    r.push(c);
  }
  return {
    type: "Sequent",
    premises: r.reverse(),
    rightLabel: n,
    conclusion: e
  };
}, P = (t) => {
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
}, z = (t) => {
  const e = P(t.reverse());
  return t.length > 0 ? null : e;
}, g = (t, e) => {
  const s = document.createElement("div");
  return s.classList.add(u + t), (t === "axiom" || t === "right-label" || t === "conclusion") && (s.style.width = "max-content"), e.forEach((o) => s.appendChild(o)), s;
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
}, S = (t) => {
  const e = g("proof-tree", [E(t)]);
  return e.classList.add(u + "unrendered"), e;
}, O = 20, L = 20, H = 10, M = (t) => t.reduce((e, s) => e + s, 0), V = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.marginLeft = `${L}px`;
      return;
    }
    case "PSSequent": {
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach(V);
      return;
    }
  }
}, A = (t) => {
  if (t.classList.contains(u + "axiom")) {
    const e = t.offsetWidth + L * 2;
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
  } else if (t.classList.contains(u + "sequent")) {
    const e = t.children[0], s = t.children[1], o = s.children[0], n = t.children[2], r = Array.prototype.slice.apply(e.children), l = n.children[0].offsetWidth + L * 2, c = o.offsetWidth + H, m = r.map(A), i = m.map((h) => h.prtrStyleAux);
    r.length === 0 && console.error("error: empty premises", r);
    const a = M(i.map((h) => h.w)) + O * (i.length - 1) - i[0].mlc - i[i.length - 1].mrc;
    if (a > l) {
      const h = a, f = i[0].mlc, y = f + (a - l) / 2, p = Math.max(i[i.length - 1].mrc, c), b = p + (a - l) / 2;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: h + f + p, whr: h, mlc: y, mrc: b, mlhr: f, mrhr: p, widthC: l, widthL: c, mlp: 0 },
        premises: m,
        node: t,
        nodePremises: e,
        nodeHR: s,
        nodeLabel: o,
        nodeConclusion: n
      };
    } else {
      const h = l, f = Math.max(i[0].mlc - (l - a) / 2, 0), y = Math.max((l - a) / 2 - i[0].mlc, 0), p = f, b = Math.max(i[i.length - 1].mrc - (l - a) / 2, c), x = b;
      return {
        type: "PSSequent",
        prtrStyleAux: { w: h + f + b, whr: h, mlc: p, mrc: x, mlhr: f, mrhr: b, widthC: l, widthL: c, mlp: y },
        premises: m,
        node: t,
        nodePremises: e,
        nodeHR: s,
        nodeLabel: o,
        nodeConclusion: n
      };
    }
  } else
    throw new Error("error");
}, R = () => {
  const t = Array.from(
    document.getElementsByClassName(`${u}proof-tree ${u}unrendered`)
  );
  console.log(t), t.forEach((e) => {
    const s = A(e.children[0]);
    V(s), e.classList.remove(u + "unrendered");
  });
};
export {
  B as renderProofTrees,
  X as renderProofTreesOnLoad
};
