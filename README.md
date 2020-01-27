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

For details of installation, please read following 'Installation details' section.

## Usage

Install the latest stable Vim on macOS or Linux

```yaml
- uses: rhysd/action-setup-vim@v1
```

On Windows, `github-token` input is necessary to retrieve the latest release from the official Vim
installer repository. Note that `secrets.GITHUB_TOKEN` is automatically prepared so you don't need
to set your personal access token to it

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Install the latest nightly Vim on macOS or Linux

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    version: nightly
```

Install the latest stable Neovim on all platforms

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
```

Install the latest nightly Neovim on all platforms

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
    version: nightly
```

After the setup, `vim` executable will be available for Vim and `nvim` executable will be available
for Neovim.

Real-world examples are workflows in [clever-f.vim][clever-f-workflow] and
[git-messenger.vim][git-messenger-workflow].

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

| OS      | Version   | Installation                                                        |
|---------|-----------|---------------------------------------------------------------------|
| Linux   | `stable`  | Install [`vim-gnome`][ubuntu-vim] package via `apt` package manager |
| Linux   | `nightly` | Build the HEAD of [vim/vim][vim] repository                         |
| macOS   | `stable`  | Install MacVim via `brew install macvim`                            |
| macOS   | `nightly` | Build the HEAD of [vim/vim][vim] repository                         |
| Widnows | `stable`  | There is no stable release for Windows so fall back to `nightly`    |
| Windows | `nightly` | Install the latest release from [installer repository][win-inst]    |

For stable releases on all platforms and nightly on Windows, `gvim` executable is also available.

When installing without system's package manager, Vim is installed at `$HOME/vim`.

### Neovim

| OS      | Version   | Installation                                                   |
|---------|-----------|----------------------------------------------------------------|
| Linux   | `stable`  | Install from the latest [Neovim stable release][nvim-stable]   |
| Linux   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |
| macOS   | `stable`  | `brew install neovim` using Homebrew                           |
| macOS   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |
| Windows | `stable`  | Install from the latest [Neovim stable release][nvim-stable]   |
| Windows | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |

Only on Windows, `nvim-qt.exe` executable is available for GUI.

When installing without system's package manager, Neovim is installed at `$HOME/nvim`.

**Note:** Ubuntu 18.04 supports official [`neovim` package][ubuntu-nvim] but this action does not
install it. As of now, GitHub Actions also supports Ubuntu 16.04.

## Current limitation

- Currently installation of specific version is not supported. Hence only `stable` or `nightly` is
  supported. This is sufficient for me. If someone wants this feature, please make an issue or send
  a pull request.
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
