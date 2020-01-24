#!/bin/bash

set -e

# TODO: Consider v2
minor_version="$1"
version="$2"

if [[ "$minor_version" == "" ]]; then
    echo 'Minor version must be given as first argument like "v1.2"' >&2
    exit 1
fi

if [[ "$version" == "" ]]; then
    echo 'Version must be given as second argument like  "v1.2.3"' >&2
    exit 1
fi

if [ ! -d .git ]; then
    echo 'This script must be run at root directory of this repository' >&2
    exit 1
fi

if ! git diff --quiet; then
    echo 'Working tree is dirty! Please ensure all changes are committed and working tree is clean' >&2
    exit 1
fi

if ! git diff --cached --quiet; then
    echo 'Git index is dirty! Please ensure all changes are committed and Git index is clean' >&2
    exit 1
fi

branch="$(git symbolic-ref --short HEAD)"
if [[ "$branch" != "master" ]]; then
    echo 'Current branch is not master. Please move to master before running this script' >&2
    exit 1
fi

echo "Releasing to dev/v1 branch for ${minor_version} and ${version}..."

set -x
npm install
npm run build
npm prune --production

rm -rf .release
mkdir -p .release

cp action.yml src/*.js package.json package-lock.json .release/
cp -R node_modules .release/node_modules

sha="$(git rev-parse HEAD)"

git checkout "dev/v1"
git pull
if [ -d node_modules ]; then
    git rm -rf node_modules || true
    rm -rf node_modules  # remove node_modules/.cache
fi
mkdir -p src

mv .release/action.yml .
mv .release/*.js ./src/
mv .release/*.json .
mv .release/node_modules .

git add action.yml ./src/*.js package.json package-lock.json node_modules
git commit -m "Release ${version} at ${sha}"

git tag -d "$minor_version" || true
git tag "$minor_version"
git tag "$version"
set +x

echo "Done. Please check 'git show' to verify changes. If ok, add version tag and push it to remote"
