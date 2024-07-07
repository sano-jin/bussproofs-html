# bussproofs-html

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
