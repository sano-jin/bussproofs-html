---
marp: true
footer: Powered by Aqua / Marp
paginate: true
headingDivider: 1
theme: aqua
math: katex
# style: "div.mermaid { all: unset; }"
---

<!--
_class: lead
_paginate: skip
_footer: ""
-->

# proof-tree-renderer

Render proof tree in bussproofs into html

## 2024.07.06

## sano

# 概要

$\KaTeX{}$ を使えば，
HTML 上で数式のレンダリングができるが，
bussproofs/$\LaTeX{}$ などを用いた証明木のレンダリングはできない．

本スクリプトは HTML 上の bussproofs を用いた証明木をレンダリングする．

![h:400 center](./out.svg)

# 要件

右ラベル前提とする．

# メモ

ラベルの配置とその分のスペースについては，
CSS だけではなくて，
JavaScript での動的な処理も必要．

# 処理の流れ

1. KaTeX を適用して，数式部分をレンダリングする．
2. p, div, li などの DOM 要素を取得する．
3. `\begin{prooftree}...\end{prooftree}` を切り出して DOM fragment を作る．
4. 証明木パートの LaTeX コードを解析して，LaTeX コマンドのリストを作る．
5. LaTeX コマンドのリストを構文解析して，証明木オブジェクトを生成する．
6. DocumentFragment 上で，証明木オブジェクトから証明木の DOM を構築．
   DOM の root は div.prooftree
7. 前後のテキストノードも含めて証明木 DOM をリアル DOM に反映させる．
8. 証明木 DOM を辿りながら要素の大きさの情報を取得し，
   サイズや配置のスタイル情報を更新していく．

# 1. KaTeX の適用

```html
<!-- The loading of KaTeX is deferred to speed up page rendering -->
<script
  defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"
  integrity="sha384-hIoBPJpTUs74ddyc4bFZSM1TVlQDA60VBbJS0oA934VSz82sBx1X7kSx2ATBDIyd"
  crossorigin="anonymous"
></script>

<!-- To automatically render math in text elements, include the auto-render extension: -->
<script
  defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"
  integrity="sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk"
  crossorigin="anonymous"
></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    renderMathInElement(document.body, {
      // customised options
      // • auto-render specific keys, e.g.:
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      // • rendering keys, e.g.:
      throwOnError: false,
    });
  });
</script>
```

# 2. DOM Traversal

> p 要素を取得する．

```ts
const nodeArray = Array.from(
  <HTMLCollectionOf<HTMLElement>>document.body.getElementsByTagName("P")
);
const nodes = nodeArray.filter((node) =>
  node.innerText.includes("\\begin{prooftree}")
);
```

# 3. DOM からの証明木パートの切り出し

> `\begin{prooftree}...\end{prooftree}` を切り出して，証明木パートの DOM fragment を作る．

```ts
interface PrtrFragment {
  // 証明木パートとその前後のテキストノードを含む，元からある DOM 要素のリスト．
  // 後でリアル DOM から削除するために持っておく．
  nodeList: HTMLElement[];

  // 証明木パートのみの DOM 要素のリスト．
  // コメントノードは除外しておく．
  prtrNodeList: HTMLElement[];

  // 証明木パートの前後のテキストノード．
  beforeTextNode: HTMLElement;
  afterTextNode: HTMLElement;
}

const getPrtrFragment = (parentNode: HTMLElement): PrtrFragment {
  //
}
```

---

証明木をレンダリングしたら，
その親の DOM 要素を再度リストに入れてやって，
再度他に証明木がないか探索する．

前提：
`\begin{prooftree}` から `\end{prooftree}` までに連続する改行はないと見做して良い．
もし連続する改行があった場合は，異なる `p` に属するということになり，
`\begin{prooftree}` があるテキストノードの兄弟のテキストノードに
`\end{prooftree}` を見つけられないので，
どのみち失敗する．

Step 1.
childNodes を順に見ていって，テキストノードかどうかを判定．
テキストノードでないなら読み飛ばす．
まずテキストノードから `\begin{prooftree}` を探す．
`\begin{prooftree}` の終了位置を持っておく．
→ これを用いてテキストノードを分割する．

Step 2.
`\begin{prooftree}` があるテキストノードの兄弟のテキストノードから，
`\end{prooftree}` を見つけてくる．

Step 3.
`\begin{prooftree}...\end{prooftree}`
の前後のテキストは別途テキストノードとして DOM にしておく．

Step 4.
`\begin{prooftree}` から `\end{prooftree}` までの範囲の DOM を切り出す．
リストにして持っておく．

Step 5.
リストの中のコメントノードは破棄する．

Step 6.
Step 1 を繰り返す．

# 4. 証明木パートの LaTeX コードの解析

> 証明木パートの LaTeX コードを解析して，LaTeX コマンドのリストを作る．

```ts
const prtrObj: LtxCommands = parsePrtr(prtrNodeList); // Step 3.
```

LaTeX コマンドのリスト．

```ts
type LtxCommand =
  | { type: "AXC"; body: HTMLElement }
  | { type: "UIC"; body: HTMLElement }
  | { type: "BIC"; body: HTMLElement }
  | { type: "TIC"; body: HTMLElement }
  | { type: "QuaternaryInfC"; body: HTMLElement }
  | { type: "RightLabel"; body: HTMLElement };

type LtxCommands = LtxCommand[];
```

構文解析の要件：
以下のいずれかがゼロ個以上連続している．

- RightLabel: `\RightLabel{...}`
- AXC: `\AXC{...}`
- UIC: `\UIC{...}`
- BIC: `\BIC{...}`
- TIC: `\TIC{...}`
- QuaternaryInfC: `\QuaternaryInfC{...}`
- Comment: `^\s*% ...`

まずはリストにして，
そのリストを下から構文解析すれば良さそう．

入力：

- 前後がテキストノードの DOM node のリスト．
  LaTeX コードは前後のテキストノードと同じ階層にある．
  リストでテキストノードのもののみ見ていけば良い．
  - LaTeX コードを読み込もうとして，テキストノード以外のものが来たら，
    エラーを吐いて終了とする．
  - Braces がネストすることや，その対応関係を取るなどのことは今回考慮しない．
    数式部分は KaTeX によってレンダリングされて，テキストノードではなくなるため．
    またバックスラッシュによる brace のエスケープも今回は対応しない．
  - コメントノードはすでに除外されている．
  - リストの長さは 1 以上．
- `begin{prooftree}` が終わった直後の位置．

Step 1.
冒頭のスペースを読み飛ばす．
読み飛ばした結果，テキストノードの終端に達したら，そのテキストノードは破棄する．
テキストノードを破棄した後に，テキストノード以外のノードが来たら，エラーを吐いて終了．
リストのノードを全て破棄したら，字句解析フェーズは完了となる．

Step 2.
改行があった場合はコメントが続くかどうかをチェックする．
コメント行の場合はその行を読み飛ばす．
コメントが続かない場合，
つまりスペースを飛ばしていって `%` 以外の文字が来る場合は，
`\RightLabel{`, `\UIC{` などの LaTeX コマンドが続くかを確認する．

Step 3.
LaTeX コマンドが続くかを確認する．
indexOf() に開始場所を引数として渡すことで確認できる．

Step 4.
`}` を探索する．

Step 4-1.
LaTeX コマンド開始時点と同じテキストノードで終端されていた場合．
テキストノードを `}` indexOf() にコマンドの長さを足した位置を引数として渡して探索する．

Step 4-2.
Step 4-1 に失敗した場合，つまり
LaTeX コマンド開始時点と同じテキストノードでは終端されていなかった場合．
テキストノードになるまでリストを読み飛ばす．
テキストノードになったら，そのテキスト内の最初の `}` を見つける．

テキストノードを分割し，
その前半部分含め，切り出す．

Step 5.
残りのテキストノードから，
再度 Step 1 を繰り返す．

# 5. LaTeX コマンドのリストを構文解析

> LaTeX コマンドのリストを構文解析して，証明木オブジェクトを生成する．

```ts
type ProofTree =
  | { type: "Axiom"; axiom: string }
  | {
      type: "Sequent";
      premises: ProofTree[];
      rightlabel: HTMLElement;
      conclusion: HTMLElement;
    };

const prootTree: ProofTree = parseProofTree(ltxCommands);
```

リストを逆順にした後に，
再帰降下法で構文解析する．

# 5. 証明木の DOM 構築

> DocumentFragment 上で，証明木オブジェクトから証明木の DOM を構築．

```ts
const div = (label: string, children: HTMLElement[]): HTMLElement => {
  const newDiv = document.createElement("div");
  newDiv.classList.add("prtr-" + label);
  children.forEach(newDiv.appendChild);
  return newDiv;
};

const createPrtrDomHelper = (prtrDom: ProofTree): HTMLElement => {
  switch (prtrDom.type) {
    case "Axiom": {
      return div("axiom", [prtrDom.axiom]);
    }
    case "Sequent": {
      return div("sequent", [
        div("premises", prtrDom.premises.map(createPrtrDomHelper)),
        div("horizontal-rule", [div("right-label", [prtrDom.rightlabel])]),
        div("conclusion", [prtrDom.conclusion]),
      ]);
    }
  }
};

const createPrtrDom = (prtrDom: ProofTree): HTMLElement => {
  return div("prooftree", [createPrtrDomHelper(prtrDom)]);
};

const prtrDom: HTMLElement = createPrtrDom(prootTree);
```

以下を 1 要素として構築する．

推論：

```html
<div class="prtr-sequent" id="w3">
  <div class="prtr-premises">...</div>
  <div class="prtr-horizontal-rule">
    <div class="prtr-right-label">Ty-Arrow</div>
  </div>
  <div class="prtr-conclusion">$ \Gamma, P \vdash T : \tau $</div>
</div>
```

公理：

```html
<div class="prtr-axiom" id="w3">$ \Gamma, P \vdash T : \tau $</div>
```

# 6. リアル DOM への反映

> 前後のテキストノードも含めて証明木 DOM をリアル DOM に反映させる．

```ts
const fragment = new DocumentFragment();
fragment.append(beforeNode);
fragment.append(prtrDom);
fragment.append(afterNode);

beforeNode.parent.insertBefore(fragment, nodeList[0]);
nodeList.forEach((node: HTMLElement) => node.remove());
```

# 7. DOM 要素のサイズや配置のスタイル情報の更新

> 証明木 DOM を辿りながら要素の大きさの情報を取得し，
> サイズや配置のスタイル情報を更新していく．

```ts
// Step 6.
const applyStylesToPrtr = (prtrDom: HTMLElement) => {
  //
};

const applyStyles = () => {
  const prooftrees = Array.from(document.getElementsByClassName("prooftree"));
  prooftrees.forEach((pt) => applyStylesToPrtr(pt.children[0]! as HTMLElement)); // Step 6.
};
```

満たすべき要件：

- ラベルが干渉し合わない様な上手い配置にする必要がある．
- 推論の横線について，上下の数式の最大幅に合わせる必要がある．
  - 部分証明木全体の横幅ではない．

# 7.1. DOM 要素のサイズと横線の長さ計算アルゴリズム

```
-------   ---------
     P    Rhooooooo
     --------------
          Theta
```

推論 $D$ について，以下の値を再帰的に計算していく．

- ラベルを除いた横幅 $w(D)$
- ラベルを入れた横幅 $wl(D)$
- 結論の左側のマージン $ml(D)$
- 結論の右側のマージン $mr(D)$

結論の左右のマージンは左右で等しくない場合があることに注意．

推論 $D$ は，
前件 $P_i (i = 1, ..., n)$ と
ラベル $L$ と
結論 $C$ からなるとする．
前件の間は $margin$ 分のスペースがあるものとする．

A.
公理では，
$w(D) = wl(D) = width(C)$,
$ml(D) = mr(D) = 0$
となる．

B.
前件がない推論では，
$w(D) = width(C)$,
$wl(D) = w(D) + width(L)$,
$ml(D) = mr(D) = 0$
となる．

C.
前件が一つ以上あるとき，
最右のラベルの幅を除いた前件の合計の幅
$wp(D)$ は以下の様になる．

$$
wp(D) \triangleq
\sum_{i = 1}^{n - 1} (wl(P_i) + margin) + w(P_n)
$$

また，最右のラベルも含めた前件の合計の幅
$wpl(D)$ は以下の様になる．

$$
wpl(D) \triangleq
\sum_{i = 1}^{n} wl(P_i) + margin \times (n - 1)
$$

従って，
この推論 $D$ のラベルを除いた横幅は，
$w(D) \triangleq \max(wp(D), width(C))$
となる．

推論の横線の長さ $hr(D)$ は以下の様に計算できる．

$$
hr(D) \triangleq
\max(width(C), wp(D) - ml(P_1) - mr(P_n))
$$

また，
この推論のラベルを入れた横幅は以下の様になる．

$$
wl(D) \triangleq
\max(width(C) + width(L),
wp(D) - mr(P_n) + width(L),
wpl(D))
$$

結論の左側のマージン $ml(D)$ と，
結論の右側のマージン $mr(D)$ は以下の様になる．

if $width(C) < wp(D) - ml(P_1) - mr(P_n)$ then

$$
ml(D) \triangleq ml(P_1) + \frac{hr(D) - width(C)}{2}
$$

$$
mr(D) \triangleq mr(P_n) + \frac{hr(D) - width(C)}{2}
$$

else if $width(C) < wp(D)$ then

$$
ml(D) = mr(D) \triangleq \frac{wp(D) - width(C)}{2}
$$

else

$$
ml(D) = mr(D) \triangleq 0
$$

# 7.2. レンダリングにおける CSS

ラベルは
`position: absolute`
にして，
この幅は無視出来る様にする．

ラベル分のマージン
$\max(0, wl(D) - w(D))$
は部分木の padding-right で確保する．

```css
div.prtr-sequent#w7 {
  padding-right: max(0, wl(D) - w(D));
}
```

ラベルの配置はラベルの幅の分 $width(L)$ だけ右にずらす．

```css
div.prtr-horizontal-rule > .prtr-right-label {
  right: -width(L);
}
```

横線の描画は，
横線の幅 $hr(D)$ と，
横線の左側の余り部分の長さ $m(D)$ を用いて行う．

```css
div.prtr-sequent#w1 > div.prtr-horizontal-rule {
  width: hr(D);
  margin-left: m(D);
}
```

# 7.3. コード

必要な値を計算し，スタイルを更新しながら，
以下の値を返す関数を用いる．

- ラベルを除いた横幅 $w(D)$
- ラベルを入れた横幅 $wl(D)$
- 結論の左側のマージン $ml(D)$
- 結論の右側のマージン $mr(D)$

```ts
const applyStylesToPrtr = (node: HTMLElement): PrtrStyle => {
  if (node.classList.contains("prtr-axiom")) {
    const width = node.offsetWidth;
    return { w: width, wl: width, ml: 0, mr: 0 };
  } else if (node.classList.contains("prtr-sequent")) {
    const nodePremises = node.children[0] as HTMLElement;
    const nodeHR = node.children[1] as HTMLElement;
    const nodeConclusion = node.children[2] as HTMLElement;
    const premises = Array.prototype.slice.apply(nodePremises.children);
    if (premises.length === 0) {
      const width = nodeConclusion.offsetWidth;
      const labelWidth = nodeHR.children[0].offsetWidth;
      return { w: width, wl: labelWidth, ml: 0, mr: 0 };
    } else {
      const _premisesStyles = premises.map(applyStylesToPrtr);

      // Calculate the current node's style.
      // Apply the style.
      return { w: 0, wl: 0, ml: 0, mr: 0 };
    }
  } else {
    // error
    console.log("error");
    return { w: 0, wl: 0, ml: 0, mr: 0 };
  }
};
```

https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

# memo

前件が 0 個の推論と，推論でない公理は横線の有無で異なる．
