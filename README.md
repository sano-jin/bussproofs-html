# bussproofs-html

A JavaScript engine to render bussproofs style proof tree in html.

![](./nvim-preview.gif)

## Preliminary

- Only proof trees directly under `p` elements are rendered.
- Only `\RightLabel` can be used for a label for now.
- Only `\AXC`, `\UIC`, `\BIC`, `\TIC`, and `\QuaternaryInfC` are allowed
  as a constcutor of the node of a proof tree.
- `\normalsize`, `\small`, `\footnotesize`, `\scriptsize`, and `\tiny`
  are ignored.
- No other LaTeX commands are allowed.

Send me PRs if you enable others.

## How to use:

### HTML

You can use this engine by adding a script tag as follows:

```html
<script type="module">
  import { renderProofTrees } from "https://sano-jin.github.io/busproofs-html/assets/prooftree.js";
  window.addEventListener("load", function () {
    renderProofTrees();
  });
</script>
```

- html source: [demo/sample.html](./demo/sample.html)
- deployed page: https://sano-jin.github.io/busproofs-html/sample.html

> [!NOTE]  
> CSS class names starting from `bussproofs-html__` are reserved.

### markdown-preview.nvim

I forked [markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
and integrated this rendering engine.
[Here](https://github.com/sano-jin/markdown-preview.nvim) is the forked previewer.
If you are using [Lazy](https://github.com/folke/lazy.nvim) as a plugin manager,
you can use the previewer as follows:

```lua
-- Lazy
  {
    "sano-jin/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
    build = "cd app && yarn install",
    init = function()
      vim.g.mkdp_filetypes = { "markdown" }
    end,
    ft = { "markdown" },
  },
```

![](./nvim-preview.gif)

### Marp

You can use this engine by adding a script tag as follows:

```markdown
---
marp: true
math: katex
paginate: true
footer: https://github.com/sano-jin/busproofs-html
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

<script type="module">
  import { renderProofTrees } from "https://sano-jin.github.io/busproofs-html/assets/prooftree.js";
  window.addEventListener('load', function() { renderProofTrees() });
</script>
```

![](./demo/marp-sample-0.png)

- markdown: [demo/marp-sample.md](./demo/marp-sample.md)
- output pdf: [demo/marp-sample.pdf](./demo/marp-sample.pdf)

### VSCode

I'm not familiar with VSCode so I have not yet considered any integration plan.

## For developpers: how to build

Develop:

```bash
cd proof-tree
yarn dev
# access the displayed url on your browser.
```

Deploy:

```bash
cd proof-tree
yarn build
cd ..
cp proof-tree/dist/index.js docs/assets/prooftree.js
```
