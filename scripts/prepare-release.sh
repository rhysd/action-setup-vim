#!/bin/bash

set -e

# Arguments check
if [[ "$#" != 1 ]] && [[ "$#" != 2 ]] || [[ "$1" == '--help' ]]; then
    echo 'Usage: prepare-release.sh {release-version} [--done]' >&2
    echo '' >&2
    echo "  Release version must be in format 'v{major}.{minor}.{patch}'." >&2
    echo '  After making changes, add --done option and run this script again. It will' >&2
    echo '  push generated tags to remote for release.' >&2
    echo '  Note that --done must be the second argument.' >&2
    echo '' >&2
    exit 1
fi

version="$1"
if [[ ! "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo 'Version string in the first argument must match to ''v{major}.{minor}.{patch}'' like v1.2.3' >&2
    exit 1
fi

if [[ "$#" == 2 ]] && [[ "$2" != "--done" ]]; then
    echo '--done option must be the second argument' >&2
    exit 1
fi

minor_version="${version%.*}"
major_version="${minor_version%.*}"
target_branch="dev/${major_version}"

# Pre-flight checks
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
node_version="$(node --version)"
if [[ ! "$node_version" =~ ^v24\.[0-9]+\.[0-9]+$ ]]; then
    echo "This script requires Node.js v24 but got '${node_version}'"
    exit 1
fi

current_branch="$(git symbolic-ref --short HEAD)"

# Deploy release branch
if [[ "$#" == 2 ]] && [[ "$2" == "--done" ]]; then
    echo "Deploying ${target_branch} branch and ${version}, ${minor_version}, ${major_version} tags to 'origin' remote"
    if [[ "$current_branch" != "${target_branch}" ]]; then
        echo "--done must be run in target branch '${target_branch}' but actually run in '${current_branch}'" >&2
        exit 1
    fi

    set -x
    git push origin "${target_branch}"
    git push origin "${version}"
    git push origin "${minor_version}" --force
    git push origin "${major_version}" --force
    # Remove copied prepare-release.sh in target branch
    rm -rf ./prepare-release.sh
    set +x

    echo "Done. Releases were pushed to 'origin' remote"
    exit 0
fi

if [[ "$current_branch" != "master" ]]; then
    echo 'Current branch is not master. Please move to master before running this script' >&2
    exit 1
fi

echo "Checking tests and eslint results"

npm run test
npm run lint

echo "Releasing to ${target_branch} branch for ${version}... (minor=${minor_version}, major=${major_version})"

set -x
npm install
npm run build
npm test
npm prune --production

# Remove all type definitions from node_modules since @octokit/rest/index.d.ts is very big (1.3MB)
find ./node_modules/ -name '*.d.ts' -exec rm '{}' \;

# Remove coverage files
rm -rf ./node_modules/.cache ./.nyc_output ./coverage

rm -rf .release
mkdir -p .release

cp action.yml src/*.js package.json package-lock.json ./scripts/prepare-release.sh .release/
cp -R node_modules .release/node_modules

sha="$(git rev-parse HEAD)"

git checkout "${target_branch}"
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
# Copy release script to release branch for --done
mv .release/prepare-release.sh .

git add action.yml ./src/*.js package.json package-lock.json node_modules
git commit -m "Release ${version} at ${sha}"

git tag -d "$major_version" || true
git tag "$major_version"
git tag -d "$minor_version" || true
git tag "$minor_version"
git tag "$version"
set +x

echo "Done. Please check 'git show' to verify changes. If ok, run this script with '--done' option like './prepare-release.sh vX.Y.Z --done'"
