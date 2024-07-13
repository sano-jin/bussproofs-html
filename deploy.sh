#!/bin/bash
set -eux


cd proof-tree
yarn build
cd ..
cp proof-tree/dist/index.js docs/assets/prooftree.js

git add --all
git commit -m updated
git push


