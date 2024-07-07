# proof-tree-renderer

Render proof tree in bussproofs into html

## 要件

右ラベル前提とする．

## 処理の流れ

1. KaTeX を適用して，数式部分をレンダリングする．
2. P 要素を取得する．
3. `\begin{prooftree}...\end{prooftree}` を切り出して DOM fragment を作る．
4. 証明木パートの LaTeX コードを解析して，LaTeX コマンドのリストを作る．
5. LaTeX コマンドのリストを構文解析して，証明木オブジェクトを生成する．
6. 証明木オブジェクトから証明木の DOM を構築．
7. 前後のテキストノードも含めて証明木 DOM をリアル DOM に反映させる．
8. 証明木 DOM を辿りながら要素の大きさの情報を取得し，
   サイズや配置のスタイル情報を更新していく．

用語整理：

- 証明木パート：
  `\begin{prooftree}` を含むテキストノードから，
  `\end{prooftree}` を含むテキストノードまでの HTML の断片.
  PrtrFragment を同一視するかは考え中．
- LaTeX コマンドのリスト:
  LtxCommands
- 証明木オブジェクト:
  ProofTree
- 証明木 DOM:
  - ProofTree を DOM にしたもの．
  - 全ての要素に prtr- から始まるクラス名が付与されている．
  - root は div.prtr-proof-tree.
- リアル DOM:
  ブラウザによって描画されている DOM.

## 1. KaTeX の適用

以下のスクリプトタグを head 内に配置する．
KaTeX 対応している通常の previewer などに対してはこの処理は行わなくとも良い．

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

## 2. DOM Traversal

> p 要素を取得する．

```ts
const nodeArray = Array.from(
  <HTMLCollectionOf<HTMLElement>>document.body.getElementsByTagName("P")
);
const nodes = nodeArray.filter((node) =>
  node.innerText.includes("\\begin{prooftree}")
);
```

LI, BLOCKQUOTE などは今回は対応しない．

## 3. DOM からの証明木パートの切り出し

> `\begin{prooftree}...\end{prooftree}` を切り出して，証明木パートの DOM fragment を作る．

証明木のレンダリングが完了したら，
その親の DOM 要素を再度リストに入れてやって，
再度他に証明木パートがないか探索する．

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

const searchBeginEnd = (
  delimeter: string,
  nodes: Node[]
): [number, Node, Node] | null => {
  let jiBeginPT = -1;
  let iBeginPT: number = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType === Node.TEXT_NODE) {
      const j = nodes[i].nodeValue!.indexOf(delimeter);
      if (j !== -1) {
        console.log(delimeter);
        iBeginPT = i;
        jiBeginPT = j;
        break;
      }
    }
  }
  if (jiBeginPT === -1) return null;

  const text = nodes[iBeginPT].nodeValue!;
  const beforeText = text.slice(0, jiBeginPT);
  const afterBeginPTText = text.slice(jiBeginPT);
  const beforeTextNode = document.createTextNode(beforeText);
  const afterBeginPTTextNode = document.createTextNode(afterBeginPTText);
  return [iBeginPT, beforeTextNode, afterBeginPTTextNode];
};

const getPrtrFragment = (parentNode: HTMLElement): PrtrFragment | null => {
  const nodes: Node[] = Array.from(parentNode.childNodes);

  // Step 1.
  const result1 = searchBeginEnd("\\begin{prooftree}", nodes);
  if (result1 === null) return null;
  const [iBeginPT, beforeTextNode, afterBeginPTTextNode] = result1;
  const nodeList = nodes.slice(iBeginPT);
  const prtrNodeList = nodeList.splice(0, 1, afterBeginPTTextNode);

  const result2 = searchBeginEnd("\\end{prooftree}", prtrNodeList);
  if (result2 === null) return null;
  const [iEndPT, afterTextNode, beforeEndPTTextNode] = result2;
  const nodeList2 = nodeList.slice(0, iEndPT);
  const prtrNodeList2 = prtrNodeList.splice(
    iEndPT,
    prtrNodeList.length - iEndPT,
    beforeEndPTTextNode
  );

  return {
    nodeList: nodeList2,
    prtrNodeList: prtrNodeList2,
    beforeTextNode: beforeTextNode,
    afterTextNode: afterTextNode,
  };
};
```

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

## 4. 証明木パートの LaTeX コードの解析

> 証明木パートの LaTeX コードを解析して，LaTeX コマンドのリストを作る．

```ts
const prtrObj: LtxCommands = createLtxCommands(prtrFragment); // Step 3.
```

LaTeX コマンドのリスト．

```ts
type LtxCommand =
  | { type: "AXC"; body: Node[] }
  | { type: "UIC"; body: Node[] }
  | { type: "BIC"; body: Node[] }
  | { type: "TIC"; body: Node[] }
  | { type: "QuaternaryInfC"; body: Node[] }
  | { type: "RightLabel"; body: Node[] };
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
  - LaTeX コメントに関して，数式の釣り合いが取れていないようなものは考えない．
    例えば以下のようなものについて，
    本来なら 3, 4 が描画されるべきだが，
    $1, 2, 3, 4, 5, 6$ 全てがコメントアウトされることになる．
    ```latex
    % foo $1, 2
    3, 4,
    % 5, 6$ bar
    ```
- `begin{prooftree}` が終わった直後の位置．

% foo $1, 2,
3, 4,
% 5, 6$ bar

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

## 5. LaTeX コマンドのリストを構文解析

> LaTeX コマンドのリストを構文解析して，証明木オブジェクトを生成する．

```ts
type ProofTree =
  | { type: "Axiom"; axiom: Node[] }
  | {
      type: "Sequent";
      premises: ProofTree[];
      rightLabel: Node[];
      conclusion: Node[];
    };

const prootTree: ProofTree = parseProofTree(ltxCommands);
```

リストを逆順にした後に，
再帰降下法で構文解析する．

## 5. 証明木の DOM 構築

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

## 6. リアル DOM への反映

> 前後のテキストノードも含めて証明木 DOM をリアル DOM に反映させる．

```ts
const fragment = new DocumentFragment();
fragment.append(beforeNode);
fragment.append(prtrDom);
fragment.append(afterNode);

beforeNode.parent.insertBefore(fragment, nodeList[0]);
nodeList.forEach((node: HTMLElement) => node.remove());
```

## 6. DOM 要素のサイズや配置のスタイル情報の更新

> 証明木 DOM を辿りながら要素の大きさの情報を取得し，
> サイズや配置のスタイル情報を更新していく．

ラベルの配置とその分のスペースについては，
CSS だけではなくて，
JavaScript での動的な処理も必要．

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
  - それに加えて少し余裕を持たせたい．
    width(C), width(L) でマージンを含めた長さを返すことにすれば良さそう．

随時適用して回ると，おかしな挙動になったりするので，
まず先にサイズを計算しておいて，
後で一気に適用することにする．

### DOM 要素のサイズと横線の長さ計算アルゴリズム

推論 $D$ について，以下の値を再帰的に計算していく．

- ラベルを除いた横幅 $w(D)$
- ラベルを入れた横幅 $wl(D)$
- 結論の左側のマージン $ml(D)$
  - これは結論の式の最左端が部分証明木全体の最左端との間の距離．
  - 横線には言及していない．
- 結論の右側のマージン $mr(D)$
- 横線の左側のマージン $mlhr(D)$．
  - 横線の左端と部分証明木全体の最左端との間の距離．

結論の左右のマージンは左右で等しくない場合があることに注意．

最終的に必要なもの：

```css
div.prtr-sequent {
  width: w(D);
  padding-right: mrhr(D);
}
div.prtr-sequent#w1 > div.prtr-horizontal-rule {
  width: hr(D);
  margin-left: mlhr(D);
}
div.prtr-right-label {
  right: -width(L);
}
div.prtr-conclusion {
  width: width(C);
  margin-left: ml(D);
}
```

---

推論 $D$ は，
前件 $P_i (i = 1, ..., n)$ と
ラベル $L$ と
結論 $C$ からなるとする．
前件の間は $margin$ 分のスペースがあるものとする．

A.
公理では，
$w(D) = whr(D) = width(C)$,
$mlc(D) = mrc(D) = mlhr(D) = mrhr(D) = 0$
となる．

B.
前件が一つ以上あるとき：

最左の前件の結論の最左端と最右の前件の結論の最右端の幅
$wpc(D)$
は，以下のように計算できる．
$wpc(D) \triangleq
\sum_{i}^{n} w(P_i) + margin \times (n - 1) - mlc(P_1) - mrc(P_n)$

最左の前件の結論の最左端と最右の前件の結論の最右端の幅
$wpc(D)$
が

- Label 3:
  $wpc(D) > width(C)$
  のとき，

  横線の長さ $hr(D)$ は，
  $whr(D) \triangleq wpc(D)$

  横線の左側のマージンは，
  1 番目の前件の結論の左側のマージン $mlc(P_1)$ に等しい．
  つまり，
  $mlhr(D) \triangleq mlc(P_1)$

  結論の左側のマージン $mlc(D)$ は
  $mlc(D) \triangleq mlhr(D) + \dfrac{wpc(D) - width(C)}{2}$

  横線の右側のマージンは，
  最右の前件の結論の右側のマージン $mrc(P_n)$ とラベルの分の長さの大きい方．
  つまり，
  $mrhr(D) \triangleq \max(mrc(P_n), width(L))$

  結論の右側のマージン $mrc(D)$ は
  $mrc(D) \triangleq mrhr(D) + \dfrac{wpc(D) - width(C)}{2}$

  部分証明木全体の横幅は，
  $w(D) \triangleq whr(D) + mrhr(D) + mrhr(D)$

- Label 5:
  $wpc(D) < width(C)$
  のとき，

  横線の長さ $whr(D)$ は，
  $whr(D) \triangleq width(C)$

  横線の左側のマージンは，
  $mlhr(D) \triangleq mlc(P_1) - \dfrac{width(C) - wpc(D)}{2}$
  となる．
  ここで，
  $\dfrac{width(C) - wpc(D)}{2}$
  は，横線が前件の結論に対してどれくらいはみ出すか．

  結論の左側のマージン $mlc(D)$ は
  $mlc(D) \triangleq mlhr(D)$

  横線の右側のマージンは，
  $mrhr(D) \triangleq 
  \max(mrc(P_n) - \dfrac{width(C) - wpc(D)}{2}, width(L))$

  場合分けを明示的に書くと，以下のようになる．

  - if $mrc(P_n) < \dfrac{width(C) - wpc(D)}{2} + width(L)$:
    $mrhr(D) \triangleq width(L)$
  - else:
    $mrhr(D) \triangleq 
    mrc(P_n) - \dfrac{width(C) - wpc(D)}{2} + width(L)$

  結論の右側のマージン $mrc(D)$ は
  $mrc(D) \triangleq mrhr(D)$

部分証明木全体の横幅は，
$w(D) \triangleq whr(D) + mrhr(D) + mrhr(D)$

### レンダリングにおける CSS

ラベルは
`position: absolute`
にして，
この幅は無視出来る様にする．

最終的に必要なもの：

```css
div.prtr-sequent {
  width: w(D);
  padding-right: mrhr(D);
}
div.prtr-sequent#w1 > div.prtr-horizontal-rule {
  width: hr(D);
  margin-left: mlhr(D);
}
div.prtr-right-label {
  right: -width(L);
}
div.prtr-conclusion {
  width: width(C);
  margin-left: mlc(D);
}
```

### コード

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

| Node               | Type | Example                                           |
| ------------------ | ---- | ------------------------------------------------- |
| ELEMENT_NODE       | 1    | `<h1 class="heading">W3Schools</h1>`              |
| ATTRIBUTE_NODE     | 2    | class = "heading" (deprecated)                    |
| TEXT_NODE          | 3    | W3Schools                                         |
| COMMENT_NODE       | 8    | `<!-- This is a comment -->`                      |
| DOCUMENT_NODE      | 9    | The HTML document itself (the parent of `<html>`) |
| DOCUMENT_TYPE_NODE | 10   | <!Doctype html>                                   |
