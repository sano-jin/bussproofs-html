const V = "div.prooftree,div.prtr-proof-tree{width:fit-content;margin:20px auto}div.prtr-sequent{width:auto;text-align:center}div.prtr-premises{width:auto;display:flex;flex-direction:row;gap:20px;align-items:flex-end}div.prtr-horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.prtr-horizontal-rule>.prtr-right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}", O = () => {
  const t = document.createElement("style");
  t.innerHTML = V, document.head.appendChild(t);
  const n = Array.from(
    document.body.getElementsByTagName("P")
  ).filter(
    (o) => o.innerHTML.includes("\\begin{prooftree}")
  );
  console.log("nodes", n), console.log(n.map((o) => w(o))), n.forEach((o) => L(o));
}, L = (t) => {
  const e = w(t);
  if (!e) {
    console.log("cannot find fragment");
    return;
  }
  const n = I(e);
  if (console.log(n), !n) {
    console.log("parsing error");
    return;
  }
  const o = v(n);
  if (!o) {
    console.log("parsing error");
    return;
  }
  e == null || e.nodeList.slice(1).forEach((s) => {
    var i;
    return (i = s.parentNode) == null ? void 0 : i.removeChild(s);
  }), console.log(o);
  const r = R(o);
  t.insertBefore(e == null ? void 0 : e.beforeTextNode, e == null ? void 0 : e.nodeList[0]), t.insertBefore(r, e == null ? void 0 : e.nodeList[0]), t.insertBefore(e == null ? void 0 : e.afterTextNode, e == null ? void 0 : e.nodeList[0]), t.removeChild(e == null ? void 0 : e.nodeList[0]), setTimeout(W, 0), t.innerText.includes("\\begin{prooftree}") && L(t);
}, b = (t, e) => {
  let n = -1, o = -1;
  for (let l = 0; l < e.length; l++)
    if (e[l].nodeType === Node.TEXT_NODE) {
      const u = e[l].nodeValue.indexOf(t);
      if (u !== -1) {
        console.log(t), o = l, n = u;
        break;
      }
    }
  if (n === -1) return null;
  const r = e[o].nodeValue, s = r.slice(0, n), i = r.slice(n + t.length), c = document.createTextNode(s), h = document.createTextNode(i);
  return [o, c, h];
}, w = (t) => {
  const e = Array.from(t.childNodes), n = b("\\begin{prooftree}", e);
  if (n === null) return null;
  const [o, r, s] = n, i = e.slice(o), c = [...i];
  c.splice(0, 1, s);
  const h = b("\\end{prooftree}", c);
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
    beforeTextNode: r,
    afterTextNode: a
  };
  return console.log(p), p;
}, B = (t) => {
  t[0].nodeValue = t[0].nodeValue.trimStart();
}, C = (t) => {
  const e = t[0].nodeValue.indexOf(`
`);
  if (e !== -1)
    return t[0].nodeValue = t[0].nodeValue.substring(e + 1), !0;
  for (t.shift(); t.length > 0; )
    if (t[0].nodeType !== Node.TEXT_NODE) t.shift();
    else
      return C(t);
  return !1;
}, g = (t, e) => {
  const n = t[0].nodeValue, o = n.indexOf("}");
  if (o !== -1) {
    const r = document.createTextNode(n.slice(0, o));
    return t[0].nodeValue = n.substring(o + 1), e.push(r), e;
  } else {
    for (e.push(t.shift()); t.length > 0; )
      if (t[0].nodeType !== Node.TEXT_NODE) e.push(t.shift());
      else
        return g(t, e);
    return null;
  }
}, I = (t) => {
  const e = t.prtrNodeList;
  let n = [], o = 20;
  for (; e.length > 0 && o-- > 0 && (B(e), e.length !== 0); ) {
    if (e[0].nodeType !== Node.TEXT_NODE) return null;
    const r = e[0].nodeValue;
    if (r.startsWith("%")) {
      if (e[0].nodeValue = r.substring(1), console.log("consumeComments"), !C(e)) return null;
    } else if (r.startsWith("\\AXC{")) {
      e[0].nodeValue = r.substring(5);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "AXC", body: s });
    } else if (r.startsWith("\\UIC{")) {
      e[0].nodeValue = r.substring(5);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "UIC", body: s });
    } else if (r.startsWith("\\BIC{")) {
      e[0].nodeValue = r.substring(5);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "BIC", body: s });
    } else if (r.startsWith("\\TIC{")) {
      e[0].nodeValue = r.substring(5);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "TIC", body: s });
    } else if (r.startsWith("\\QuaternaryInfC{")) {
      e[0].nodeValue = r.substring(16);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "QuaternaryInfC", body: s });
    } else if (r.startsWith("\\RightLabel{")) {
      e[0].nodeValue = r.substring(12);
      const s = g(e, []);
      if (s === null) return null;
      n.push({ type: "RightLabel", body: s });
    } else if (e[0].nodeValue.length === 0)
      console.log("oghi"), e.shift();
    else
      return console.log("error1", e[0].nodeValue), null;
  }
  return console.log("reached"), n;
}, T = (t, e, n) => {
  const o = t[0];
  if (!o) return null;
  let r = [];
  o.type === "RightLabel" && (t.shift(), r = o.body);
  const s = [];
  for (let i = 0; i < n; i++) {
    const c = N(t);
    if (!c) return null;
    s.push(c);
  }
  return {
    type: "Sequent",
    premises: s.reverse(),
    rightLabel: r,
    conclusion: e
  };
}, N = (t) => {
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
}, v = (t) => {
  const e = N(t.reverse());
  return t.length > 0 ? null : e;
}, y = (t, e) => {
  const n = document.createElement("div");
  return n.classList.add("prtr-" + t), n.style.width = "max-content", e.forEach((o) => n.appendChild(o)), n;
}, P = (t) => {
  switch (t.type) {
    case "Axiom":
      return y("axiom", t.axiom);
    case "Sequent":
      return y("sequent", [
        y("premises", t.premises.map(P)),
        y("horizontal-rule", [y("right-label", t.rightLabel)]),
        y("conclusion", t.conclusion)
      ]);
  }
}, R = (t) => y("proof-tree", [P(t)]);
const S = (t) => t.reduce((e, n) => e + n, 0), E = (t) => {
  switch (t.type) {
    case "PSAxiom": {
      t.node.style.marginLeft = "20px";
      return;
    }
    case "PSSequent": {
      console.log(t);
      const e = t.prtrStyleAux;
      t.node.style.width = `${e.w}px`, t.nodePremises.style.marginLeft = `${e.mlp}px`, t.nodeHR.style.width = `${e.whr}px`, t.nodeHR.style.marginLeft = `${e.mlhr}px`, t.nodeHR.style.marginRight = `${e.mrhr}px`, t.nodeLabel.style.right = `-${e.widthL}px`, t.nodeConclusion.style.width = `${e.widthC}px`, t.nodeConclusion.style.marginLeft = `${e.mlc}px`, t.premises.forEach(E);
      return;
    }
  }
}, A = (t) => {
  if (t.classList.contains("prtr-axiom")) {
    const e = t.offsetWidth + 40;
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
    const e = t.children[0], n = t.children[1], o = n.children[0], r = t.children[2], s = Array.prototype.slice.apply(e.children), i = r.children[0].offsetWidth + 20 * 2;
    console.log("widthC", i);
    const c = o.offsetWidth + 10, h = s.map(A), l = h.map((a) => a.prtrStyleAux);
    s.length === 0 && console.log("error: empty premises", s);
    const u = S(l.map((a) => a.w)) + 20 * (l.length - 1) - l[0].mlc - l[l.length - 1].mrc;
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
        nodeHR: n,
        nodeLabel: o,
        nodeConclusion: r
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
        nodeHR: n,
        nodeLabel: o,
        nodeConclusion: r
      };
    }
  } else
    throw console.log("error"), new RangeError();
}, W = () => {
  const t = Array.from(
    document.getElementsByClassName("prtr-proof-tree")
  );
  console.log(t), t.forEach((e) => {
    const n = A(e.children[0]);
    E(n);
  });
};
export {
  O as renderProofTrees
};
