# proof-tree-renderer

Render proof tree in bussproofs into html

## 要件

右ラベル前提とする．

## 処理の流れ

1. KaTeX を適用して，数式部分をレンダリングする．
2. P 要素のリストを取得する．
   LI, BLOCKQUOTE などは未対応．
3. `\begin{prooftree}...\end{prooftree}` を切り出して，
   DOM fragment `PrtrFragment`を作る．
4. 証明木パートの LaTeX コードを解析して，
   LaTeX コマンドのリスト `LtxCommand[]` を作る．
5. LaTeX コマンドのリストを構文解析して，
   証明木オブジェクト `ProofTree` を生成する．
6. 証明木オブジェクトから証明木の DOM を構築．
   - 全ての要素に prtr- から始まるクラス名が付与されている．
   - root は div.prtr-proof-tree.
7. 前後のテキストノードも含めて証明木 DOM をリアル DOM に反映させる．
8. 証明木 DOM を辿りながら要素の大きさの情報を取得し，
   サイズや配置のスタイル情報を更新していく．

`\begin{prooftree}...\end{prooftree}` を切り出して，
証明木パートの DOM fragment を作る．

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

証明木オブジェクトを生成する．

```ts
type ProofTree =
  | { type: "Axiom"; axiom: Node[] }
  | {
      type: "Sequent";
      premises: ProofTree[];
      rightLabel: Node[];
      conclusion: Node[];
    };
```

証明木の DOM を構築．
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

## 6. DOM 要素のサイズや配置のスタイル情報の更新について

満たすべき要件：

- ラベルが干渉し合わない様な上手い配置にする必要がある．
- 推論の横線について，上下の数式の最大幅に合わせる必要がある．
  - 部分証明木全体の横幅ではない．
  - それに加えて少し余裕を持たせたい．
    width(C), width(L) でマージンを含めた長さを返すことにすれば良さそう．

随時適用して回ると，おかしな挙動になったりするので，
まず先にサイズを計算しておいて，
後で一気に適用することにする．

### DOM 要素のサイズと横線の長さ計算アルゴリズムの概要

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

### DOM 要素のサイズと横線の長さ計算アルゴリズム

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
