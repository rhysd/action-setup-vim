ubuntu-version
==============
[![npm][npm-badge]][npm]
[![CI][ci-badge]][ci]
[![codecov badge][]][codecov]

[ubuntu-version][npm] is a tiny Node.js package to get Ubuntu version from system.

## Installation

```
npm install --save ubuntu-version
```

## Example code

```javascript
const { getUbuntuVersion } = require('ubuntu-version');

(async () => {
    const version = await getUbuntuVersion();

    if (version.length === 0) {
        throw new Error('This OS is not Ubuntu');
    }

    console.log(version); // e.g. [18, 4, 2] for Ubuntu 18.04.2 LTS
})().catch(console.error);
```

This package also supports [TypeScript][ts].

## Why not use [`os.release`][os-release]?

Because it is not useful for detecting Ubuntu version in [GitHub Actions][ga].

For example:

```
> Run node -e 'console.log(require("os").release())'
5.4.0-1036-azure
```

Instead, we need to get OS information from `lsb_release` command.

## The API

```typescript
function getUbuntuVersion(): Promise<number[]>;
```

`getUbuntuVersion` is a function to get Ubuntu version as an array of versions.

Returned array has 2 or 3 elements. The first and second elements represetnt major and minor versions.
When the third element exists, it represents patch version. For example, on `Ubuntu 16.04.1 LTS`,
this function will return a promise resolved as `[16, 4, 1]`.

When this function is called on OSes other than Linux, when `lsb_release` command shows that it is
not Ubuntu or when `lsb_release` command is not found, the returned `Promise` value will be resolved
as `[]`.

When running `lsb_release` command failed with non-zero exit status, the returned `Promise` value
will be rejected with an `Error` object which describes how the command failed.

## License

Distributed under [the MIT license](./LICENSE.txt).

[npm]: https://www.npmjs.com/package/ubuntu-version
[npm-badge]: https://badge.fury.io/js/ubuntu-version.svg
[ci-badge]: https://github.com/rhysd/node-ubuntu-version/workflows/CI/badge.svg?branch=master&event=push
[ci]: https://github.com/rhysd/node-ubuntu-version/actions?query=workflow%3ACI
[codecov badge]: https://codecov.io/gh/rhysd/node-ubuntu-version/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/rhysd/node-ubuntu-version
[ts]: https://www.typescriptlang.org/
[os-release]: https://nodejs.org/api/os.html#os_os_release
[ga]: https://github.com/features/actions
