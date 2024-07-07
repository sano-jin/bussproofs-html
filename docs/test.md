---
marp: true
footer: Powered by Aqua / Marp
paginate: true
headingDivider: 1
theme: aqua
math: katex
---

<script type="text/javascript" class="next-head">
console.log("hello world!")
</script>

# Proof Tree Renderer

foo
hige
fai
\begin{prooftree}
\AXC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 1}
\UIC{$1 + 2 + 3$}
\AXC{$1 + 2$}
\RightLabel{Long Label 2}
\UIC{$1 + 2 + 3$}
\RightLabel{Label 3}
\BIC{$1 + 2$}
\AXC{$1 + 2$}
\RightLabel{Label 4}
\UIC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 5}
\BIC{$1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 
11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 +
21 + 22 + 23
$}
\end{prooftree}
hoef barbar
foo
<span>
foooo</span>
hige
fai
\begin{prooftree}
\AXC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 1}
\UIC{$1 + 2 + 3$}
\AXC{$1 + 2$}
\RightLabel{Long Label 2}
\UIC{$1 + 2 + 3$}
\RightLabel{Label 3}
\BIC{$1 + 2$}
\AXC{$1 + 2$}
\RightLabel{Long Long Long Long Long Long Long
Long Long Long Long Long Label 4}
\UIC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 5}
\BIC{$1 + 2 + 3$}
\RightLabel{Label 6}
\UIC{$1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 
11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 + 
21 + 22 + 23
$}
\end{prooftree}
hoef barbar

<span>
  foooo</span>
hige
fai
\begin{prooftree}
\AXC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 1}
\UIC{$1 + 2 + 3$}
\AXC{$1 + 2$}
\RightLabel{Long Label 2}
\UIC{$1 + 2 + 3$}
\RightLabel{Label 3}
\BIC{$1 + 2$}
\AXC{$1 + 2$}
\RightLabel{Long Long Long Long Long Long Long
Long Long Long Long Long Label 4}
\UIC{$1 + 2 + 3 + 4 + 5$}
\RightLabel{Label 5}
\BIC{$1 + 2 + 3$}
\RightLabel{Label 6}
\UIC{$1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10
+ 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20
+ 21 + 22 + 23
$}
\end{prooftree}
hoef barbar

\begin{prooftree}
\AXC{}
\RightLabel{Ty-Var}
\UIC{$\Gamma'\{z[X]: nat(X)\}, P \vdash z[X] : nat(X)$}
\RightLabel{Ty-Alpha}
\UIC{$\Gamma', P \vdash z[W_1] : nat(W_1)$}
\AXC{}
\RightLabel{Ty-Prod}
\UIC{$\Gamma', P \vdash \Nil(X,Z), Y \bowtie Z : dbllist(X,Y,Z)$}
\RightLabel{Ty-Alpha}
\UIC{$\Gamma', P \vdash \Nil(Z,W_2), Y \bowtie W_2 : dbllist(Z,Y,W_2)$}
\RightLabel{Ty-Prod}
\BIC{$\Gamma', P \vdash
 \nu W_1 W_2.(\Cons(W_1,X,W_2,Z),z[W_1],\Nil(Z,W_2),Y \bowtie W_2): dbllist(X,Y,Z)$}
\RightLabel{Ty-Cong}
\UIC{$\Gamma', P \vdash
 \nu W_3.(\Cons(W_3,X,Y,Z),z[W_3],\Nil(Z,Y)): dbllist(X,Y,Z)$}
\RightLabel{Ty-Alpha}
\UIC{$\Gamma', P \vdash
 \nu W_3.(\Cons(W_3,W_2,Y,W_1),z[W_3],\Nil(W_1,Y)): dbllist(W_2,Y,W_1)$}
\RightLabel{Ty-Var$^\ast$}
\UIC{$\begin{array}{lll}
 \Gamma'\{y[W_1, W_2, X, Z]: dbllist(W_2,Y,W_1) \multimap dbllist(X,Y,Z)\}, P \vdash \\
 \quad \nu W_1 W_2 (y[W_1,W_2,X,Z],\nu W_3.(\Cons(W_3,W_2,Y,W_1),z[W_3],\Nil(W_1,Y))) \\
 \quad : dbllist(X,Y,Z)
 \end{array}$}
\RightLabel{Ty-Cong}
\UIC{$\Gamma', P \vdash
 T: dbllist(X,Y,Z)$}
\end{prooftree}

<script type="text/javascript" class="next-head">
  import { renderProofTrees } from "https://sano-jin.github.io/busproofs-html/assets/prooftree.js";
  renderProofTrees();
</script>
