Contributing to action-setup-vim
================================

Thank you for contributing to [action-setup-vim][proj]. This document is for development.

## Testing

For validation for inputs and outputs, run unit tests:

```
$ npm run test
```

Tests for installation logic are done in [CI workflow][ci] in E2E testing manner. There is no unit
test yet, but all combinations are tested on CI triggered by `push` and `pull_request` events.

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

[proj]: https://github.com/rhysd/action-setup-vim
[ci]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3ACI
