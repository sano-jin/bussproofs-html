# bussproofs-html

Render proof tree in bussproofs into html

![](./nvim-preview.gif)

## Preliminary

Only RightLabels can be used for now.

## How to use:

### markdown-preview.nvim

I forked [markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
and integrated this rendering engine.
If you using Lazy as a plugin manager,
you can use the previewer as follows:

```lua
-- Lazy
  {
    "sano-jin/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
    build = "cd app && yarn install",
    init = function()
      vim.g.mkdp_filetypes = { "markdown" }
      vim.g.mkdp_markdown_css = '/Users/sano/work/config/style/markdown.css'
    end,
    ft = { "markdown" },
  },
```

### Marp

You can use this engine by adding a script tag as follows:

```markdown
---
marp: true
footer: Powered by Aqua / Marp
paginate: true
headingDivider: 1
theme: aqua
math: katex
---

# Page Title

Here comes a proof tree:
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
\BIC{$1 + 2 + 3 + 4 + 5$}
\end{prooftree}

<script type="module">
  import { renderProofTrees } from "https://sano-jin.github.io/busproofs-html/assets/prooftree.js";
  window.addEventListener('load', function() { renderProofTrees() });
</script>
```

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

### VSCode

I'm not familiar with VSCode so I have not yet considered any integration plan.

## For Developpers: How to build

```bash
cd proof-tree
yarn build
cd ..
cp proof-tree/dist/index.js docs/assets/prooftree.js
```
