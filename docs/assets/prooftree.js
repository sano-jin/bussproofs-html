console.log("ProofTree v0.0.1");
const v = "div.prooftree,div.prtr-proof-tree{width:fit-content;margin:20px auto}div.prtr-sequent{width:auto;text-align:center}div.prtr-premises{width:auto;display:flex;flex-direction:row;gap:20px;align-items:flex-end}div.prtr-horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.prtr-horizontal-rule>.prtr-right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}", X = () => {
  console.log("renderProofTreesOnLoad"), document.addEventListener("DOMContentLoaded", function() {
    B();
  });
}, B = () => {
  console.log("renderProofTrees");
  const t = document.createElement("style");
  t.innerHTML = v, document.head.appendChild(t);
  const e = Array.from(
    document.body.getElementsByTagName("P")
  );
  console.log("nodes with tag P", e);
  const o = e.filter(
    (n) => n.innerHTML.includes("\\begin{prooftree}")
  );
  console.log("filtered nodes", o), console.log(o.map((n) => C(n))), o.forEach((n) => w(n));
}, w = (t) => {
  const e = C(t);
  if (!e) {
    console.log("cannot find fragment");
    return;
  }
  const o = O(e);
  if (console.log(o), !o) {
    console.log("parsing error");
    return;
  }
  const n = S(o);
  if (!n) {
    console.log("parsing error");
    return;
  }
  e == null || e.nodeList.slice(1).forEach((r) => {
    var i;
    return (i = r.parentNode) == null ? void 0 : i.removeChild(r);
  }), console.log(n);
  const s = R(n);
  t.insertBefore(e == null ? void 0 : e.beforeTextNode, e == null ? void 0 : e.nodeList[0]), t.insertBefore(s, e == null ? void 0 : e.nodeList[0]), t.insertBefore(e == null ? void 0 : e.afterTextNode, e == null ? void 0 : e.nodeList[0]), t.removeChild(e == null ? void 0 : e.nodeList[0]), setTimeout($, 0), t.innerHTML.includes("\\begin{prooftree}") && w(t);
}, L = (t, e) => {
  let o = -1, n = -1;
  for (let l = 0; l < e.length; l++)
    if (e[l].nodeType === Node.TEXT_NODE) {
      const u = e[l].nodeValue.indexOf(t);
      if (u !== -1) {
        console.log(t), n = l, o = u;
        break;
      }
    }
  if (o === -1) return null;
  const s = e[n].nodeValue, r = s.slice(0, o), i = s.slice(o + t.length), c = document.createTextNode(r), h = document.createTextNode(i);
  return [n, c, h];
}, C = (t) => {
  const e = Array.from(t.childNodes), o = L("\\begin{prooftree}", e);
  if (o === null) return null;
  const [n, s, r] = o, i = e.slice(n), c = [...i];
  c.splice(0, 1, r);
  const h = L("\\end{prooftree}", c);
  if (h === null) return null;
  const [l, u, a] = h, d = i.slice(0, l + 1), m = c;
  m.splice(
    l,
    c.length - l,
    u
  );
  const f = m.filter(
    (x) => x.nodeType !== Node.COMMENT_NODE
  ), p = {
    nodeList: d,
    prtrNodeList: f,
    beforeTextNode: s,
    afterTextNode: a
  };
  return console.log(p), p;
}, I = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, N = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else
      return N(t);
  return !1;
}, g = (t, e) => {
  const o = t[0].nodeValue, n = o.indexOf("}");
  if (n !== -1) {
    const s = document.createTextNode(o.slice(0, n));
    return t[0].nodeValue = o.substring(n + 1), e.push(s), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else
        return g(t, e);
    return null;
  }
}, O = (t) => {
  const e = t.prtrNodeList;
  let o = [], n = 20;
  for (; e.length > 0 && n-- > 0 && (I(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const s = e[0].nodeValue;
    if (s.startsWith("%")) {
      if (e[0].nodeValue = s.substring(1), console.log("consumeComments"), !N(e)) return null;
    } else if (s.startsWith("\\AXC{")) {
      e[0].nodeValue = s.substring(5);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "AXC", body: r });
    } else if (s.startsWith("\\UIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "UIC", body: r });
    } else if (s.startsWith("\\BIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "BIC", body: r });
    } else if (s.startsWith("\\TIC{")) {
      e[0].nodeValue = s.substring(5);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "TIC", body: r });
    } else if (s.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = s.substring(16);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "QuaternaryInfC", body: r });
    } else if (s.startsWith("\\RightLabel{")) {
      e[0].nodeValue = s.substring(12);
      const r = g(e, []);
      if (r === null) return null;
      o.push({ type: "RightLabel", body: r });
    } else if (e[0].nodeValue.length === 0)
      console.log("oghi"), e.shift();
    else
      return console.log("error1", e[0].nodeValue), null;
  }
  return console.log("reached"), o;
}, T = (t, e, o) => {
  const n = t[0];
  if (!n) return null;
  let s = [];
  n.type === "RightLabel" && (t.shift(), s = n.body);
  const r = [];
  for (let i = 0; i < o; i++) {
    const c = P(t);
    if (!c) return null;
    r.push(c);
  }
  return {
    type: "Sequent",
    premises: r.reverse(),
    rightLabel: s,
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
}, S = (t) => {
  const e = P(t.reverse());
  return t.length > 0 ? null : e;
}, y = (t, e) => {
  const o = document.createElement("div");
  return o.classList.add("prtr-" + t), o.style.width = "max-content", e.forEach((n) => o.appendChild(n)), o;
}, E = (t) => {
  switch (t.type) {
    case "Axiom":
      return y("axiom", t.axiom);
    case "Sequent":
      return y("sequent", [
        y("premises", t.premises.map(E)),
        y("horizontal-rule", [y("right-label", t.rightLabel)]),
        y("conclusion", t.conclusion)
      ]);
  }
}, R = (t) => y("proof-tree", [E(t)]), H = 20, b = 20, M = 10, W = (t) => t.reduce((e, o) => e + o, 0), A = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.marginLeft = `${b}px`;
      return;
    }
    case "PSSequent": {
      console.log(t);
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach(A);
      return;
    }
  }
}, V = (t) => {
  if (t.classList.contains("prtr-axiom")) {
    const e = t.offsetWidth + b * 2;
    return console.log("axiom", e), {
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
  } else if (t.classList.contains("prtr-sequent")) {
    const e = t.children[0], o = t.children[1], n = o.children[0], s = t.children[2], r = Array.prototype.slice.apply(e.children), i = s.children[0].offsetWidth + b * 2;
    console.log("widthC", i);
    const c = n.offsetWidth + M, h = r.map(V), l = h.map((a) => a.prtrStyleAux);
    r.length === 0 && console.log("error: empty premises", r);
    const u = W(l.map((a) => a.w)) + H * (l.length - 1) - l[0].mlc - l[l.length - 1].mrc;
    if (console.log("wpc", u), u > i) {
      const a = u, d = l[0].mlc, m = d + (u - i) / 2;
      console.log("mlc", m);
      const f = Math.max(l[l.length - 1].mrc, c), p = f + (u - i) / 2;
      return {
        type: "PSSequent",
        //
        prtrStyleAux: {
          w: a + d + f,
          whr: a,
          mlc: m,
          mrc: p,
          mlhr: d,
          mrhr: f,
          widthC: i,
          widthL: c,
          mlp: 0
        },
        //
        premises: h,
        //
        node: t,
        nodePremises: e,
        nodeHR: o,
        nodeLabel: n,
        nodeConclusion: s
      };
    } else {
      const a = i, d = Math.max(l[0].mlc - (i - u) / 2, 0);
      console.log("mlc", d);
      const m = Math.max((i - u) / 2 - l[0].mlc, 0), f = d;
      console.log("mlc", f);
      const p = Math.max(l[l.length - 1].mrc - (i - u) / 2, c), x = p;
      return {
        type: "PSSequent",
        //
        prtrStyleAux: {
          w: a + d + p,
          whr: a,
          mlc: f,
          mrc: x,
          mlhr: d,
          mrhr: p,
          widthC: i,
          widthL: c,
          mlp: m
        },
        //
        premises: h,
        //
        node: t,
        nodePremises: e,
        nodeHR: o,
        nodeLabel: n,
        nodeConclusion: s
      };
    }
  } else
    throw console.log("error"), new RangeError();
}, $ = () => {
  const t = Array.from(
    document.getElementsByClassName("prtr-proof-tree")
  );
  console.log(t), t.forEach((e) => {
    const o = V(e.children[0]);
    A(o);
  });
};
export {
  B as renderProofTrees,
  X as renderProofTreesOnLoad
};
