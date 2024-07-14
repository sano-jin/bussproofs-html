// import "./prooftree.css";
console.log("ProofTree v0.0.1");
const BH = "bussproofs-html__";
const defaultConfig = {
    marginPremises: 20,
    paddingAxiomConclusion: 20,
    marginLabelLeft: 10,
    styleOnLoad: null,
};
const initConfig = (configP) => {
    var _a, _b, _c, _d;
    return ({
        marginPremises: (_a = configP.marginPremises) !== null && _a !== void 0 ? _a : defaultConfig.marginPremises,
        paddingAxiomConclusion: (_b = configP.paddingAxiomConclusion) !== null && _b !== void 0 ? _b : defaultConfig.paddingAxiomConclusion,
        marginLabelLeft: (_c = configP.marginLabelLeft) !== null && _c !== void 0 ? _c : defaultConfig.marginLabelLeft,
        styleOnLoad: (_d = configP.styleOnLoad) !== null && _d !== void 0 ? _d : defaultConfig.styleOnLoad,
    });
};
const style = (cfg) => `div.${BH}proof-tree{width:max-content;margin:20px auto}div.${BH}sequent{width:auto;text-align:center}div.${BH}premises{width:auto;display:flex;flex-direction:row;gap:${cfg.marginPremises}px;align-items:flex-end}div.${BH}horizontal-rule{width:100%;border-bottom:1.3px solid;position:relative}div.${BH}horizontal-rule>.${BH}right-label{position:absolute;height:auto;top:-50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}`;
// Render proof trees on DOMContentLoaded.
export const renderProofTreesOnLoad = (configP = defaultConfig) => {
    console.log(`renderProofTreesOnLoad(${JSON.stringify(configP)})`);
    document.addEventListener("DOMContentLoaded", () => {
        renderProofTrees(configP);
    });
};
// Render proof trees.
export const renderProofTrees = (configP = defaultConfig) => {
    console.log(`renderProofTrees(${JSON.stringify(configP)})`);
    const config = initConfig(configP);
    const styleElem = document.createElement("style");
    styleElem.innerHTML = style(config);
    document.head.appendChild(styleElem);
    const nodeArray = Array.from(document.body.getElementsByTagName("P"));
    const nodes = nodeArray.filter((node) => node.innerHTML.includes("\\begin{prooftree}"));
    nodes.forEach((node) => renderProofTree(node, config));
};
const renderProofTree = (node, config) => {
    try {
        const prtrFragment = getPrtrFragment(node);
        if (!prtrFragment)
            throw new Error("cannot find fragment");
        const ltxCommands = createLtxCommands(prtrFragment);
        if (!ltxCommands)
            throw new Error("error: cannot recognise latex command");
        const proofTree = parseProofTree(ltxCommands);
        if (!proofTree)
            throw new Error("error: cannot construct proof tree");
        prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.nodeList.slice(1).forEach((node) => { var _a; return (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(node); });
        const elem = createPrtrDom(proofTree);
        node.insertBefore(prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.beforeTextNode, prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.nodeList[0]);
        node.insertBefore(elem, prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.nodeList[0]);
        node.insertBefore(prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.afterTextNode, prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.nodeList[0]);
        node.removeChild(prtrFragment === null || prtrFragment === void 0 ? void 0 : prtrFragment.nodeList[0]);
        if (config.styleOnLoad === null) {
            window.addEventListener("load", () => applyStyles(config, elem), false);
        }
        else {
            setTimeout(() => applyStyles(config, elem), config.styleOnLoad);
        }
        if (node.innerHTML.includes("\\begin{prooftree}")) {
            renderProofTree(node, config);
        }
    }
    catch (e) {
        console.error(e);
    }
};
const searchBeginEnd = (delimeter, nodes) => {
    let jiBeginPT = -1;
    let iBeginPT = -1;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType === Node.TEXT_NODE) {
            const j = nodes[i].nodeValue.indexOf(delimeter);
            if (j !== -1) {
                iBeginPT = i;
                jiBeginPT = j;
                break;
            }
        }
    }
    if (jiBeginPT === -1)
        return null;
    const text = nodes[iBeginPT].nodeValue;
    const beforeText = text.slice(0, jiBeginPT);
    const afterBeginPTText = text.slice(jiBeginPT + delimeter.length);
    const beforeTextNode = document.createTextNode(beforeText);
    const afterBeginPTTextNode = document.createTextNode(afterBeginPTText);
    return [iBeginPT, beforeTextNode, afterBeginPTTextNode];
};
const getPrtrFragment = (parentNode) => {
    const nodes = Array.from(parentNode.childNodes);
    const resultBegin = searchBeginEnd("\\begin{prooftree}", nodes);
    if (resultBegin === null)
        return null;
    const [iBeginPT, beforeTextNode, afterBeginPTTextNode] = resultBegin;
    const nodeList = nodes.slice(iBeginPT);
    const prtrNodeList = [...nodeList];
    prtrNodeList.splice(0, 1, afterBeginPTTextNode);
    const resultEnd = searchBeginEnd("\\end{prooftree}", prtrNodeList);
    if (resultEnd === null)
        return null;
    const [iEndPT, beforeEndPTTextNode, afterTextNode] = resultEnd;
    const nodeList2 = nodeList.slice(0, iEndPT + 1);
    const prtrNodeList2 = prtrNodeList;
    prtrNodeList2.splice(iEndPT, prtrNodeList.length - iEndPT, beforeEndPTTextNode);
    const prtrNodeList3 = prtrNodeList2.filter((node) => node.nodeType !== Node.COMMENT_NODE);
    const result3 = {
        nodeList: nodeList2,
        prtrNodeList: prtrNodeList3,
        beforeTextNode: beforeTextNode,
        afterTextNode: afterTextNode,
    };
    return result3;
};
const consumeSpaces = (nodes) => {
    nodes[0].nodeValue = nodes[0].nodeValue.trimStart();
};
// もし true を返すなら，必ずテキストノードが先頭に来る．
const consumeComments = (nodes) => {
    const i = nodes[0].nodeValue.indexOf("\n");
    if (i !== -1) {
        nodes[0].nodeValue = nodes[0].nodeValue.substring(i + 1);
        return true;
    }
    else {
        nodes.shift();
        while (nodes.length > 0) {
            if (nodes[0].nodeType !== Node.TEXT_NODE)
                nodes.shift();
            else
                return consumeComments(nodes);
        }
        return false;
    }
};
// もし true を返すなら，必ずテキストノードが先頭に来る．
const consumeLtxCommand = (nodes, acc) => {
    const text = nodes[0].nodeValue;
    const i = text.indexOf("}");
    if (i !== -1) {
        const finalTextNode = document.createTextNode(text.slice(0, i));
        nodes[0].nodeValue = text.substring(i + 1);
        acc.push(finalTextNode);
        return acc;
    }
    else {
        acc.push(nodes.shift());
        while (nodes.length > 0) {
            if (nodes[0].nodeType !== Node.TEXT_NODE)
                acc.push(nodes.shift());
            else
                return consumeLtxCommand(nodes, acc);
        }
        return null;
    }
};
const createLtxCommands = (prtrFragment) => {
    const nodes = prtrFragment.prtrNodeList;
    let ltxCommands = [];
    let i = 100; // A safeguard to prevent infinite loop (unnecessory)
    while (nodes.length > 0 && i-- > 0) {
        consumeSpaces(nodes);
        if (nodes.length === 0)
            break;
        if (nodes[0].nodeType !== Node.TEXT_NODE)
            return null; // unreachable.
        const text = nodes[0].nodeValue;
        if (text.startsWith("%")) {
            nodes[0].nodeValue = text.substring(1);
            if (!consumeComments(nodes))
                return null;
        }
        else if (text.startsWith("\\AXC{")) {
            nodes[0].nodeValue = text.substring("\\AXC{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "AXC", body: body });
        }
        else if (text.startsWith("\\UIC{")) {
            nodes[0].nodeValue = text.substring("\\UIC{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "UIC", body: body });
        }
        else if (text.startsWith("\\BIC{")) {
            nodes[0].nodeValue = text.substring("\\BIC{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "BIC", body: body });
        }
        else if (text.startsWith("\\TIC{")) {
            nodes[0].nodeValue = text.substring("\\TIC{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "TIC", body: body });
        }
        else if (text.startsWith("\\QuaternaryInfC{")) {
            nodes[0].nodeValue = text.substring("\\QuaternaryInfC{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "QuaternaryInfC", body: body });
        }
        else if (text.startsWith("\\RightLabel{")) {
            nodes[0].nodeValue = text.substring("\\RightLabel{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
            ltxCommands.push({ type: "RightLabel", body: body });
        }
        else if (text.startsWith("\\normalsize{")) {
            nodes[0].nodeValue = text.substring("\\normalsize{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
        }
        else if (text.startsWith("\\normalsize")) {
            nodes[0].nodeValue = text.substring("\\normalsize".length);
        }
        else if (text.startsWith("\\small{")) {
            nodes[0].nodeValue = text.substring("\\small{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
        }
        else if (text.startsWith("\\small")) {
            nodes[0].nodeValue = text.substring("\\small".length);
        }
        else if (text.startsWith("\\footnotesize{")) {
            nodes[0].nodeValue = text.substring("\\footnotesize{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
        }
        else if (text.startsWith("\\footnotesize")) {
            nodes[0].nodeValue = text.substring("\\footnotesize".length);
        }
        else if (text.startsWith("\\scriptsize{")) {
            nodes[0].nodeValue = text.substring("\\scriptsize{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
        }
        else if (text.startsWith("\\scriptsize")) {
            nodes[0].nodeValue = text.substring("\\scriptsize".length);
        }
        else if (text.startsWith("\\tiny{")) {
            nodes[0].nodeValue = text.substring("\\tiny{".length);
            const body = consumeLtxCommand(nodes, []);
            if (body === null)
                return null;
        }
        else if (text.startsWith("\\tiny")) {
            nodes[0].nodeValue = text.substring("\\tiny".length);
        }
        else if (nodes[0].nodeValue.length === 0) {
            // console.log("no more chars");
            // succeed
            nodes.shift();
        }
        else {
            console.error("error: unrecognised charactor", nodes[0].nodeValue);
            return null;
        }
    }
    return ltxCommands;
};
const parseHelper = (ltxCommands, conclusion, degree) => {
    const nextLtxCommand = ltxCommands[0];
    if (!nextLtxCommand)
        return null;
    let rightLabel = [];
    if (nextLtxCommand.type === "RightLabel") {
        ltxCommands.shift();
        rightLabel = nextLtxCommand.body;
    }
    const premises = [];
    for (let i = 0; i < degree; i++) {
        const premise = parseProofTreeHelper(ltxCommands);
        if (!premise)
            return null;
        premises.push(premise);
    }
    return {
        type: "Sequent",
        premises: premises.reverse(),
        rightLabel: rightLabel,
        conclusion: conclusion,
    };
};
const parseProofTreeHelper = (ltxCommands) => {
    const ltxCommand = ltxCommands.shift();
    if (!ltxCommand)
        return null;
    switch (ltxCommand.type) {
        case "AXC": {
            return { type: "Axiom", axiom: ltxCommand.body };
        }
        case "UIC": {
            return parseHelper(ltxCommands, ltxCommand.body, 1);
        }
        case "BIC": {
            return parseHelper(ltxCommands, ltxCommand.body, 2);
        }
        case "TIC": {
            return parseHelper(ltxCommands, ltxCommand.body, 3);
        }
        case "QuaternaryInfC": {
            return parseHelper(ltxCommands, ltxCommand.body, 4);
        }
    }
    return null;
};
const parseProofTree = (ltxCommands) => {
    const result = parseProofTreeHelper(ltxCommands.reverse());
    if (ltxCommands.length > 0)
        return null;
    else
        return result;
};
const div = (label, children) => {
    const newDiv = document.createElement("div");
    newDiv.classList.add(BH + label);
    if (label === "axiom" || label === "right-label" || label === "conclusion") {
        newDiv.style.width = "max-content";
    }
    children.forEach((node) => newDiv.appendChild(node));
    return newDiv;
};
const createPrtrDomHelper = (prtrDom) => {
    switch (prtrDom.type) {
        case "Axiom": {
            return div("axiom", prtrDom.axiom);
        }
        case "Sequent": {
            return div("sequent", [
                div("premises", prtrDom.premises.map(createPrtrDomHelper)),
                div("horizontal-rule", [div("right-label", prtrDom.rightLabel)]),
                div("conclusion", prtrDom.conclusion),
            ]);
        }
    }
};
const createPrtrDom = (prtrDom) => div("proof-tree", [createPrtrDomHelper(prtrDom)]);
const sum = (nums) => nums.reduce((acc, x) => acc + x, 0);
const applyStylesToPrtr = (prtrStyle) => {
    switch (prtrStyle.type) {
        case "PSAxiom": {
            prtrStyle.node.style.width = `${prtrStyle.prtrStyleAux.w}px`;
            return;
        }
        case "PSSequent": {
            const d = prtrStyle.prtrStyleAux;
            prtrStyle.node.style.width = `${d.w}px`;
            prtrStyle.nodePremises.style.marginLeft = `${d.mlp}px`;
            prtrStyle.nodeHR.style.width = `${d.whr}px`;
            prtrStyle.nodeHR.style.marginLeft = `${d.mlhr}px`;
            prtrStyle.nodeHR.style.marginRight = `${d.mrhr}px`;
            prtrStyle.nodeLabel.style.right = `-${d.widthL}px`;
            prtrStyle.nodeConclusion.style.width = `${d.widthC}px`;
            prtrStyle.nodeConclusion.style.marginLeft = `${d.mlc}px`;
            prtrStyle.premises.forEach(applyStylesToPrtr);
            return;
        }
    }
};
const getPrtrStyle = (config) => (node) => {
    if (node.classList.contains(BH + "axiom")) {
        const width = node.offsetWidth + 1 + config.paddingAxiomConclusion * 2;
        // console.log("axiom", width);
        const prtrStyleAux = {
            w: width,
            whr: width,
            mlc: 0,
            mrc: 0,
            mlhr: 0,
            mrhr: 0,
            widthC: width,
            widthL: 0,
            mlp: 0,
        };
        const prtrStyle = {
            type: "PSAxiom",
            prtrStyleAux: prtrStyleAux,
            node: node,
        };
        return prtrStyle;
    }
    else if (node.classList.contains(BH + "sequent")) {
        const nodePremises = node.children[0];
        const nodeHR = node.children[1];
        const nodeLabel = nodeHR.children[0];
        const nodeConclusion = node.children[2];
        const premises = Array.prototype.slice.apply(nodePremises.children);
        const widthC = nodeConclusion.children[0]
            ? nodeConclusion.children[0].offsetWidth +
                1 +
                config.paddingAxiomConclusion * 2
            : nodeConclusion.offsetWidth + 1 + config.paddingAxiomConclusion * 2;
        // console.log("widthC", widthC);
        const widthL = nodeLabel.offsetWidth + config.marginLabelLeft;
        const pss = premises.map(getPrtrStyle(config));
        const ps = pss.map((p) => p.prtrStyleAux);
        if (premises.length === 0) {
            console.error("error: empty premises", premises);
        }
        // $wpc(D) \triangleq
        // \sum_{i}^{n} w(P_i) + margin \times (n - 1) - mlc(P_1) - mrc(P_n)$
        const wpc = sum(ps.map((pi) => pi.w)) +
            config.marginPremises * (ps.length - 1) -
            ps[0].mlc -
            ps[ps.length - 1].mrc;
        // console.log("wpc", wpc);
        // $wpc(D) > width(C)$
        if (wpc > widthC) {
            // $whr(D) \triangleq wpc(D)$
            const whr = wpc;
            // $mlhr(D) \triangleq mlc(P_1)$
            const mlhr = ps[0].mlc;
            // $mlc(D) \triangleq mlhr(D) + \dfrac{wpc(D) - width(C)}{2}$
            const mlc = mlhr + (wpc - widthC) / 2;
            // console.log("mlc", mlc);
            // $mrhr(D) \triangleq \max(mrc(P_n), width(L))$
            const mrhr = Math.max(ps[ps.length - 1].mrc, widthL);
            // $mrc(D) \triangleq mrhr(D) + \dfrac{wpc(D) - width(C)}{2}$
            const mrc = mrhr + (wpc - widthC) / 2;
            // $w(D) \triangleq whr(D) + mrhr(D) + mrhr(D)$
            const w = whr + mlhr + mrhr;
            return {
                type: "PSSequent",
                prtrStyleAux: {
                    w,
                    whr,
                    mlc,
                    mrc,
                    mlhr,
                    mrhr,
                    widthC,
                    widthL,
                    mlp: 0,
                },
                premises: pss,
                node,
                nodePremises,
                nodeHR,
                nodeLabel,
                nodeConclusion,
            };
        }
        else {
            // $wpc(D) < width(C)$
            // $whr(D) \triangleq width(C)$
            const whr = widthC;
            // $mlhr(D) \triangleq mlc(P_1) - \dfrac{width(C) - wpc(D)}{2}$
            const mlhr = Math.max(ps[0].mlc - (widthC - wpc) / 2, 0);
            // console.log("mlhr", mlhr);
            const mlp = Math.max((widthC - wpc) / 2 - ps[0].mlc, 0);
            // $mlc(D) \triangleq mlhr(D)$
            const mlc = mlhr;
            // console.log("mlc", mlc);
            // $mrhr(D) \triangleq
            // \max(mrc(P_n) - \dfrac{width(C) - wpc(D)}{2}, width(L))$
            const mrhr = Math.max(ps[ps.length - 1].mrc - (widthC - wpc) / 2, widthL);
            // $mrc(D) \triangleq mrhr(D)$
            const mrc = mrhr;
            // $w(D) \triangleq whr(D) + mrhr(D) + mrhr(D)$
            const w = whr + mlhr + mrhr;
            return {
                type: "PSSequent",
                prtrStyleAux: { w, whr, mlc, mrc, mlhr, mrhr, widthC, widthL, mlp },
                premises: pss,
                node,
                nodePremises,
                nodeHR,
                nodeLabel,
                nodeConclusion,
            };
        }
    }
    else {
        throw new Error("error");
    }
};
const applyStyles = (config, pt) => {
    const prtrStyle = getPrtrStyle(config)(pt.children[0]);
    applyStylesToPrtr(prtrStyle);
};
