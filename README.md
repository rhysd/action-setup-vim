GitHub Action to setup Vim and Neovim
=====================================
[![Build status][ci-badge]][ci]

[action-setup-vim][proj] is a [GitHub Action][github-action] to setup [Vim][vim] or [Neovim][neovim]
on Linux, macOS and Windows. Both stable releases and nightly releases are supported.

For stable release, this action will install Vim or Neovim from package manager or official releases
since it is faster than building from source.

For nightly release, this action basically installs the nightly release of Vim or Neovim from
official releases. If unavailable, it builds executables from source.

For details of installation, please read following 'Installation details' section.

## Usage

Install latest stable Vim on macOS or Linux

```yaml
- uses: rhysd/action-setup-vim@v1
```

On Windows, `github-token` input is necessary to retrieve the latest release from official Vim
installer repository.

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Install latest nightly Vim on macOS or Linux

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    version: nightly
```

Install latest stable Neovim on all platforms

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
```

Install latest nightly Neovim on all platforms

```yaml
- uses: rhysd/action-setup-vim@v1
  with:
    neovim: true
    version: nightly
```

After the setup, `vim` executable will be available for Vim and `nvim` executable will be availabel
for Neovim.

Vim and Neovim are installed in the home directory (`$HOME/vim` and `$HOME/nvim`) and `bin`
directories are added to `$PATH`.

## Outputs

This action sets installed executable path to the action's `executable` output. You can use it for
running Vim command in the steps later.

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

| OS      | Version   | Installation                                                     |
|---------|-----------|------------------------------------------------------------------|
| Linux   | `stable`  | Install `gvim-gnome` package via `apt` package manager           |
| Linux   | `nightly` | Build the HEAD of [vim][vim] repository                          |
| macOS   | `stable`  | Install MacVim via `brew install macvim`                         |
| macOS   | `nightly` | Build the HEAD of [vim][vim] repository                          |
| Widnows | `stable`  | There is no stable release for Windows so fall back to `nightly` |
| Windows | `nightly` | Install the latest release from [installer repository][win-inst] |

For stable releases on all platforms and nightly on Windows, `gvim` executable is also available.

### Neovim

| OS      | Version   | Installation                                                  |
|---------|-----------|---------------------------------------------------------------|
| Linux   | `stable`  | Install from the latest [Neovim stable release][nvim-stable]  |
| Linux   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |
| macOS   | `stable`  | Install from the latest [Neovim stable release][nvim-stable]  |
| macOS   | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |
| Windows | `stable`  | Install from the latest [Neovim stable release][nvim-stable]  |
| Windows | `nightly` | Install from the latest [Neovim nightly release][nvim-nightly] |

Only on Windows, `nvim-qt.exe` executable is available for GUI.

## Current limitation

- Currently installation of specific version is not supported. Hence only `stable` or `nightly` is
supported. This is sufficient for me, but if someone wants this feature, please make an issue or
send a pull request.
- GUI version (gVim and nvim-qt) is supported partially as described in above section.

## License

Distributed under [the MIT license](./LICENSE.txt).

[ci-badge]: https://github.com/rhysd/action-setup-vim/workflows/CI/badge.svg?branch=master&event=push
[ci]: https://github.com/rhysd/action-setup-vim/actions?query=workflow%3ACI+branch%3Amaster
[proj]: https://github.com/rhysd/action-setup-vim
[github-action]: https://github.com/features/actions
[vim]: https://github.com/vim/vim
[neovim]: https://github.com/neovim/neovim
[win-inst]: https://github.com/vim/vim-win32-installer
[nvim-stable]: https://github.com/neovim/neovim/releases/tag/stable
[nvim-nightly]: https://github.com/neovim/neovim/releases/tag/nightly
