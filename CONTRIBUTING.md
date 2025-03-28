Contributing to action-setup-vim
================================

Thank you for contributing to [action-setup-vim][repo]. This document is for development.

## Testing

For testing validation for inputs and outputs, run unit tests:

```sh
npm run test
```

Tests for installation logic are done in [CI workflows][ci] in E2E testing manner. All combinations
of inputs are tested on the workflows triggered by `push` and `pull_request` events.

After building and running `action-setup-vim` action, the workflow verifies the post conditions
with [post_action_check.ts](./scripts/post_action_check.ts).

## Linting

In addition to type checking with TypeScript compiler, the following command checks the sources with
[eslint][] and [pretteir][].

```sh
npm run lint
```

## Node.js version

Node.js version must be aligned with Node.js runtime in GitHub Actions. Check the version at
`runs.using` in [action.yml](./action.yml) and use the same version for development.

## How to create a new release

When releasing v1.2.3:

1. Make sure that `node --version` shows Node.js v20.
2. Run `$ bash scripts/prepare-release.sh v1.2.3`. It builds everything and prunes `node_modules`
   for removing all dev-dependencies. Then it copies built artifacts to `dev/v1` branch and makes
   a new commit and tag `v1.2.3`. Finally it rearrange `v1` and `v1.2` tags to point the new commit.
3. Check changes in the created commit with `git show`.
4. If ok, run `$ bash ./prepare-release.sh v1.2.3 --done` to apply the release to the remote. The
   script will push the branch and the new tag, then force-push the existing tags.

## Post release check

[Post-release check workflow][post-release] runs to check released `rhysd/action-setup-vim@v1` action.
The workflow runs when modifying `CHANGELOG.md` and also runs on every Sunday 00:00 UTC.

[repo]: https://github.com/rhysd/action-setup-vim
[ci]: https://github.com/rhysd/action-setup-vim/actions/workflows/ci.yml
[eslint]: https://eslint.org/
[prettier]: https://prettier.io/
[post-release]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3A%22Post-release+check%22+branch%3Amaster
