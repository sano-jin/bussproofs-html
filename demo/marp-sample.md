---
marp: true
math: katex
paginate: true
footer: https://github.com/sano-jin/bussproofs-html
---

# Integration with Marp is easy!

Here comes a proof tree:
\begin{prooftree}
\AXC{$1 + 2$}
\AXC{$1 + 2 + 3$}
\BIC{$1 + 2$}
\AXC{$1 + 2 + 3$}
\RightLabel{Label}
\BIC{$1 + 2 + 3 + 4$}
\end{prooftree}

---

# Here is the code for the previous page.

```md
# Integration with Marp is easy!

Here comes a proof tree:
\begin{prooftree}
\AXC{$1 + 2$}
\AXC{$1 + 2 + 3$}
\BIC{$1 + 2$}
\AXC{$1 + 2 + 3$}
\RightLabel{Label}
\BIC{$1 + 2 + 3 + 4$}
\end{prooftree}

<script type="module">
  import { renderProofTreesOnLoad } from "https://sano-jin.github.io/bussproofs-html/assets/prooftree.js";
  renderProofTreesOnLoad();
</script>
```

<script type="module">
  import { renderProofTreesOnLoad } from "https://sano-jin.github.io/bussproofs-html/assets/prooftree.js";
  renderProofTreesOnLoad();
</script>
