GitHub Action to setup Vim and Neovim
=====================================
[![Build status][ci-badge]][ci]
[![Action Marketplace][release-badge]][marketplace]

[action-setup-vim][proj] is a [GitHub Action][github-action] to setup [Vim][vim] or [Neovim][neovim]
on Linux, macOS and Windows. Both stable releases and nightly releases are supported.

For stable release, this action will install Vim or Neovim from package manager or official releases
since it is faster than building from source.

For nightly release, this action basically installs the nightly release of Vim or Neovim from
official releases. If unavailable, it builds executables from source.

For details of installation, please read the following 'Installation details' section.

## Usage

Install the latest stable Vim

```yaml
- uses: rhysd/action-setup-vim@v1
```

Install the latest nightly Vim

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    version: nightly
```

Install the latest Vim v8.1.123. The version is a tag name in [vim/vim][vim] repository. Please see
the following 'Choose specific version' section also

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    version: v8.1.0123
```

Install the latest stable Neovim

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
```

Install the latest nightly Neovim

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
    version: nightly
```

Install the Neovim v0.4.3. Please see the following 'Choose specific version' section also

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
    version: v0.4.3
```

After the setup, `vim` executable will be available for Vim and `nvim` executable will be available
for Neovim.

Real-world examples are workflows in [clever-f.vim][clever-f-workflow] and
[git-messenger.vim][git-messenger-workflow]. And you can see [this repository's CI workflows][ci].
They run this action with all combinations of the inputs.

For comprehensive lists of inputs and outputs, please refer [action.yml](./action.yml).

## Outputs

This action sets installed executable path to the action's `executable` output. You can use it for
running Vim command in the steps later.

Here is an example to set Vim executable to run unit tests with [themis.vim][vim-themis].

```yaml
- uses: actions/checkout@v2
  with:
    repository: thinca/vim-themis
    path: vim-themis
- uses: rhysd/action-setup-vim@v1
  id: vim
- name: Run unit tests with themis.vim
  env:
    THEMIS_VIM: ${{ steps.vim.outputs.executable }}
  run: |
    ./vim-themis/bin/themis ./test
```

## Installation details

### Vim

`vX.Y.Z` represents a specific version such as `v8.2.0100`.

| OS      | Version   | Installation                                                                       |
|---------|-----------|------------------------------------------------------------------------------------|
| Linux   | `stable`  | Install [`vim-gnome`][ubuntu-vim] package via `apt` package manager                |
| Linux   | `nightly` | Build the HEAD of [vim/vim][vim] repository                                        |
| Linux   | `vX.Y.Z`  | Build the `vX.Y.Z` tag of [vim/vim][vim] repository                                |
| macOS   | `stable`  | Install MacVim via `brew install macvim`                                           |
| macOS   | `nightly` | Build the HEAD of [vim/vim][vim] repository                                        |
| macOS   | `vX.Y.Z`  | Build the `vX.Y.Z` tag of [vim/vim][vim] repository                                |
| Widnows | `stable`  | There is no stable release for Windows so fall back to `nightly`                   |
| Windows | `nightly` | Install the latest release from [installer repository][win-inst]                   |
| Windows | `vX.Y.Z`  | Install the release at `vX.Y.Z` tag of [installer repository][win-inst] repository |

For stable releases on all platforms and nightly on Windows, `gvim` executable is also available.

When installing without system's package manager, Vim is installed at `$HOME/vim`.

### Neovim

`vX.Y.Z` represents a specific version such as `v0.4.3`.

| OS      | Version   | Installation                                                              |
|---------|-----------|---------------------------------------------------------------------------|
| Linux   | `stable`  | Install from the latest [Neovim stable release][nvim-stable]              |
| Linux   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly]            |
| Linux   | `vX.Y.Z`  | Install the release at `vX.Y.Z` tag of [neovim/neovim][neovim] repository |
| macOS   | `stable`  | `brew install neovim` using Homebrew                                      |
| macOS   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly]            |
| macOS   | `vX.Y.Z`  | Install the release at `vX.Y.Z` tag of [neovim/neovim][neovim] repository |
| Windows | `stable`  | Install from the latest [Neovim stable release][nvim-stable]              |
| Windows | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly]            |
| Windows | `vX.Y.Z`  | Install the release at `vX.Y.Z` tag of [neovim/neovim][neovim] repository |

Only on Windows, `nvim-qt.exe` executable is available for GUI.

When installing without system's package manager, Neovim is installed at `$HOME/nvim`.

**Note:** Ubuntu 18.04 supports official [`neovim` package][ubuntu-nvim] but this action does not
install it. As of now, GitHub Actions also supports Ubuntu 16.04.

## Choose specific version

### Vim

If Vim is built from source, any tag version should be available.

If Vim is installed via release asset (on Windows), please check
[vim-win32-installer releases page][win-inst-release] to know which versions are available.
The repository makes a release once per day (nightly).

### Neovim

When installing the specific version of Neovim, this action downloads release assets from
[neovim/neovim][neovim]. Please check [neovim/neovim releases page][neovim-release] to know which
versions have release assets. For example,
[Neovim 0.4.0](https://github.com/neovim/neovim/releases/tag/v0.4.0) has no Windows releases so it
is not available for installing Neovim on Windows.

## Using GitHub API token

Only when installing Vim on Windows, this action sends GitHub API request to know the latest assets
released at [vim-win32-installer][win-inst].
By default, this action sends the API request without API token. It should be OK in most cases.
However, when you run this action very frequently, it may run out of API rate limit without API token
(60/hour).

To boost the rate limit to 5000/hour, this action supports `github-token` input as follows. If you're
facing the API rate limit issue, the input would be useful to avoid it. Note that `secrets.GITHUB_TOKEN`
is automatically prepared so you don't need to set your personal access token to it

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Current limitation

- GUI version (gVim and nvim-qt) is supported partially as described in above section.

## License

Distributed under [the MIT license](./LICENSE.txt).

[ci-badge]: https://github.com/rhysd/action-setup-vim/workflows/CI/badge.svg?branch=master&event=push
[ci]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3ACI+branch%3Amaster
[release-badge]: https://img.shields.io/github/v/release/rhysd/action-setup-vim.svg
[marketplace]: https://github.com/marketplace/actions/setup-vim
[proj]: https://github.com/rhysd/action-setup-vim
[github-action]: https://github.com/features/actions
[vim]: https://github.com/vim/vim
[neovim]: https://github.com/neovim/neovim
[win-inst]: https://github.com/vim/vim-win32-installer
[nvim-stable]: https://github.com/neovim/neovim/releases/tag/stable
[nvim-nightly]: https://github.com/neovim/neovim/releases/tag/nightly
[clever-f-workflow]: https://github.com/rhysd/clever-f.vim/blob/master/.github/workflows/ci.yml
[git-messenger-workflow]: https://github.com/rhysd/git-messenger.vim/blob/master/.github/workflows/ci.yml
[ubuntu-vim]: https://packages.ubuntu.com/search?keywords=vim-gnome
[ubuntu-nvim]: https://packages.ubuntu.com/search?keywords=neovim
[vim-themis]: https://github.com/thinca/vim-themis
[win-inst-release]: https://github.com/vim/vim-win32-installer/releases
[neovim-release]: https://github.com/neovim/neovim/releases
