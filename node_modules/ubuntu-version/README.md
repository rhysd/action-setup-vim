ubuntu-version
==============
[![npm][npm-badge]][npm]
[![CI][ci-badge]][ci]

[ubuntu-version][npm] is a tiny Node.js package to get Ubuntu version information.

## Installation

```
npm install --save ubuntu-version
```

## Example code

```javascript
const { getUbuntuVersion } = require('ubuntu-version');

(async () => {
    const ubuntu = await getUbuntuVersion();

    if (!ubuntu) {
        throw new Error('This OS is not Ubuntu');
    }

    console.log(ubuntu.description); // e.g. "Ubuntu 18.04 LTS"
    console.log(ubuntu.release); // e.g. "18.04"
    console.log(ubuntu.codename); // e.g. "bionic"
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

## APIs

### `UbuntuVersion`

```typescript
interface UbuntuVersion {
    description: string;
    release: string;
    codename: string;
}
```

`UbuntuVersion` is an interface for an object which is returned from `getUbuntuVersion()`. Each
properties are extracted value from `lsb_release` command output.

- `description`: An OS description like `Ubuntu 18.04 LTS`
- `release`: Version of Ubuntu like `18.04`
- `codename`: Codename of Ubuntu like `bionic` for 18.04

### `getUbuntuVersion`

```typescript
function getUbuntuVersion(): Promise<UbuntuVersion | null>;
```

`getUbuntuVersion` is a function to get Ubuntu version information.

When this function is called on OSes other than Linux, when `lsb_release` command shows that it is
not Ubuntu or when `lsb_release` command is not found, the returned `Promise` value will be resolved
as `null`.

When running `lsb_release` command failed with non-zero exit status, the returned `Promise` value
will be rejected with an `Error` object which describes how the command failed.

Otherwise the returned promise will be resolved as an object which meets `UbuntuVersion` interface.

## License

Distributed under [the MIT license](./LICENSE.txt).

[npm]: https://www.npmjs.com/package/ubuntu-version
[npm-badge]: https://badge.fury.io/js/ubuntu-version.svg
[ci-badge]: https://github.com/rhysd/node-ubuntu-version/workflows/CI/badge.svg?branch=master&event=push
[ci]: https://github.com/rhysd/node-ubuntu-version/actions?query=workflow%3ACI
[ts]: https://www.typescriptlang.org/
[os-release]: https://nodejs.org/api/os.html#os_os_release
[ga]: https://github.com/features/actions
