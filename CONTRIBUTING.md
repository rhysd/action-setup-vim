Contributing to action-setup-vim
================================

Thank you for contributing to [action-setup-vim][proj]. This document is for development.

## Testing

For testing validation for inputs and outputs, run unit tests:

```
$ npm run test
```

Tests for installation logic are done in [CI workflows][ci] in E2E testing manner. All combinations
of inputs are tested on the workflows triggered by `push` and `pull_request` events.

After building and running `action-setup-vim` action, the workflow verifies the post conditions
with [post_action_check.ts](./scripts/post_action_check.ts).

## How to create a new release

When releasing v1.2.3:

1. Run `$ bash scripts/prepare-release.sh v1.2.3`. It builds everything and prunes `node_modules`
   for removing all dev-dependencies. Then it copies built artifacts to `dev/v1` branch and makes a new commit.
   Finally it rearrange `v1` and `v1.2` tags to point the new commit.
2. Check changes in the created commit with `git show`.
3. If ok, push a new commit with `git push origin dev/v1` and push tags with `git push --force --tags`.
   Or push tags with `git push --force origin v1 && git push --force origin v1.2 && git push origin v1.2.3`
   more safely.

## Post release check

[Post-release check workflow][post-release] runs to check released `rhysd/action-setup-vim@v1` action.
The workflow runs when modifying `CHANGELOG.md` and also runs on every Sunday 00:00 UTC.

[proj]: https://github.com/rhysd/action-setup-vim
[ci]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3ACI
[post-release]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3A%22Post-release+check%22+branch%3Amaster
