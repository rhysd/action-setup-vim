<a id="v1.4.5"></a>
# [v1.4.5](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.5) - 2025-10-12

- Better workaround for [#52](https://github.com/rhysd/action-setup-vim/issues/52) to properly install stable Vim on macos-15-intel runner. We use `python@3.13` package which is already installed on the system instead of installing `python` package to remove conflicted symbolic links. It's faster and has less side effects.

[Changes][v1.4.5]


<a id="v1.4.4"></a>
# [v1.4.4](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.4) - 2025-10-12

- Fix stable Vim installation fails on `macos-15-intel` runner due to the version conflict in `python` Homebrew package. ([#52](https://github.com/rhysd/action-setup-vim/issues/52))
- Fix HTTPS proxy is not used when accessing GitHub API via Octokit client even if `https_proxy` environment variable is set.
- Fix using a deprecated API in `node-fetch` package.

[Changes][v1.4.4]


<a id="v1.4.3"></a>
# [v1.4.3](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.3) - 2025-09-07

- Use HTTPS proxy looking at environment variables such as `https_proxy`, `no_proxy`, `all_proxy` when fetching assets. ([#50](https://github.com/rhysd/action-setup-vim/issues/50), thanks [@xieyonn](https://github.com/xieyonn))
- Implementation migrated from CommonJS to ES Modules. This should not affect the behavior of this action.
- Reduce amount of log output when installing stable Vim on Linux.
- Update dependencies including `@actions/github`.

[Changes][v1.4.3]


<a id="v1.4.2"></a>
# [v1.4.2](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.2) - 2025-03-28

- Fix the version of stable Neovim or Vim may be outdated on macOS by updating formulae before running `brew install`. By this fix, the new version of Neovim which was released 2 days ago is now correctly installed. ([#49](https://github.com/rhysd/action-setup-vim/issues/49))
- Add a warning message with useful information when executing `./configure` fails to build older versions of Vim.
- Update dependencies including some security fixes in `@octokit/*` packages.


[Changes][v1.4.2]


<a id="v1.4.1"></a>
# [v1.4.1](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.1) - 2025-02-01

- Fix arm32 Linux (self-hosted runner) is rejected on checking the CPU architecture before installation.
- Add ['Supported platforms' table](https://github.com/rhysd/action-setup-vim?tab=readme-ov-file#supported-platforms) to the readme document to easily know which platforms are supported for Vim/Neovim.

[Changes][v1.4.1]


<a id="v1.4.0"></a>
# [v1.4.0](https://github.com/rhysd/action-setup-vim/releases/tag/v1.4.0) - 2025-02-01

- Support for [Linux arm64 hosted runners](https://github.blog/changelog/2025-01-16-linux-arm64-hosted-runners-now-available-for-free-in-public-repositories-public-preview/). ([#39](https://github.com/rhysd/action-setup-vim/issues/39))
  - For Neovim, Linux arm64 is supported since v0.10.4. v0.10.3 or earlier versions are not supported because of no prebuilt Linux arm64 binaries for the versions.
- Fix installing Neovim after the v0.10.4 release. The installation was broken because the asset file name has been changed. ([#42](https://github.com/rhysd/action-setup-vim/issues/42), [#43](https://github.com/rhysd/action-setup-vim/issues/43), thanks [@falcucci](https://github.com/falcucci) and [@danarnold](https://github.com/danarnold) for making the patches at [#40](https://github.com/rhysd/action-setup-vim/issues/40) and [#41](https://github.com/rhysd/action-setup-vim/issues/41) respectively)

[Changes][v1.4.0]


<a id="v1.3.5"></a>
# [v1.3.5](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.5) - 2024-07-28

- Fix `vim` command hangs on Windows after Vim 9.1.0631. ([#37](https://github.com/rhysd/action-setup-vim/issues/37))
  - Shout out to [@k-takata](https://github.com/k-takata) to say thank you for the great help at [vim/vim#15372](https://github.com/vim/vim/issues/15372).
- Update the dependencies to the latest. This includes small security fixes.

[Changes][v1.3.5]


<a id="v1.3.4"></a>
# [v1.3.4](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.4) - 2024-05-17

- Support [Neovim v0.10](https://github.com/neovim/neovim/releases/tag/v0.10.0) new asset file names for macOS. ([#30](https://github.com/rhysd/action-setup-vim/issues/30))
  - Until v0.9.5, Neovim provided a single universal executable. From v0.10.0, Neovim now provides separate two executables for arm64 and x86_64. action-setup-vim downloads a proper asset file looking at the current system's architecture.

[Changes][v1.3.4]


<a id="v1.3.3"></a>
# [v1.3.3](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.3) - 2024-05-07

- Remove the support for Ubuntu 18.04, which was removed from GitHub-hosted runners more than one year ago.
- Improve adding `bin` directory to the `$PATH` environment variable by using `core.addPath` rather than modifying the environment variable directly. ([#33](https://github.com/rhysd/action-setup-vim/issues/33), thanks [@ObserverOfTime](https://github.com/ObserverOfTime))
- Update dependencies including some security patches.

[Changes][v1.3.3]


<a id="v1.3.2"></a>
# [v1.3.2](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.2) - 2024-03-29

- Fix the nightly Neovim installation was broken due to [neovim/neovim#28000](https://github.com/neovim/neovim/pull/28000). ([#30](https://github.com/rhysd/action-setup-vim/issues/30), thanks [@linrongbin16](https://github.com/linrongbin16))
  - Neovim now provides `neovim-macos-arm64.tar.gz` (for Apple Silicon) and `neovim-macos-x86_64.tar.gz` (for Intel Mac) separately rather than the single `neovim-macos.tar.gz`. This change will be applied to the next stable version.
- Update npm dependencies to the latest. This update includes some small security fixes.
- Fix an incorrect OS version was reported in debug message on Ubuntu.

[Changes][v1.3.2]


<a id="v1.3.1"></a>
# [v1.3.1](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.1) - 2024-01-31

- Support [the new M1 Mac runner](https://github.blog/changelog/2024-01-30-github-actions-introducing-the-new-m1-macos-runner-available-to-open-source/) ([#28](https://github.com/rhysd/action-setup-vim/issues/28))
  - On M1 Mac, Homebrew installation directory was changed from `/usr/local` to `/opt/homebrew`

[Changes][v1.3.1]


<a id="v1.3.0"></a>
# [v1.3.0](https://github.com/rhysd/action-setup-vim/releases/tag/v1.3.0) - 2023-10-15

- `configure-args` input was added to customize build configurations on building Vim from source. This input is useful to change `./configure` arguments to enable/disable some features of Vim. For example, when you're facing some issue on generating translation files (this sometimes happens when building older Vim), disabling the native language support would be able to avoid the issue. ([#27](https://github.com/rhysd/action-setup-vim/issues/27))
  ```yaml
  - uses: rhysd/action-setup-vim@v1
    with:
      version: 8.0.0000
      configure-args: |
        --with-features=huge --enable-fail-if-missing --disable-nls
  ```
- Update the action runtime to `node20`. Now this action is run with Node.js v20.
- Update all dependencies to the latest including `@actions/github` v6.0.0 and some security fixes.

[Changes][v1.3.0]


<a id="v1.2.15"></a>
# [v1.2.15](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.15) - 2023-03-06

- Show less output on unarchiving downloaded assets with `unzip -q` to reduce amount of logs. When [debugging is enabled](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging), `-q` is not added and `unzip` shows all retrieved file paths for debugging. ([#25](https://github.com/rhysd/action-setup-vim/issues/25))
- Upgrade the lock file version from v2 to v3, which largely reduces size of `package-lock.json`.
- Update dependencies.

[Changes][v1.2.15]


<a id="v1.2.14"></a>
# [v1.2.14](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.14) - 2023-01-09

- Improve warning message when trying to build Vim older than 8.2.1119 on `macos-latest` or `macos-12` runner since the build would fail. `macos-11` runner should be used instead.
  - Vim older than 8.2.1119 can be built with Xcode 11 or earlier only. `macos-12` runner does not include Xcode 11 by default. And now `macos-latest` label points to `macos-12` runner. So building Vim 8.2.1119 or older on `macos-latest` would fail.
- Update dependencies to fix deprecation warning from `uuid` package

[Changes][v1.2.14]


<a id="v1.2.13"></a>
# [v1.2.13](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.13) - 2022-10-13

- Update `@actions/core` to v1.10.0 to follow the change that [GitHub deprecated `set-output` command](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/) recently.
- Update other dependencies including `@actions/github` v5.1.1

[Changes][v1.2.13]


<a id="v1.2.12"></a>
# [v1.2.12](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.12) - 2022-07-21

- Fix the Neovim asset directory name for macOS has been changed from `nvim-osx64` to `nvim-macos` at Neovim v0.7.1. (thanks [@notomo](https://github.com/notomo), [#22](https://github.com/rhysd/action-setup-vim/issues/22))
- Update dependencies including `@actions/core` v1.9.0 and `@actions/github` v5.0.3.

[Changes][v1.2.12]


<a id="v1.2.11"></a>
# [v1.2.11](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.11) - 2022-04-15

- Fix installing `stable` or `v0.7.0` Neovim on Windows runner. The asset directory name was changed from 'Neovim' to 'nvim-win64' at v0.7.0 and the change broke this action.

[Changes][v1.2.11]


<a id="v1.2.10"></a>
# [v1.2.10](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.10) - 2022-03-23

- Fix installing nightly Neovim on Windows. (thanks [@notomo](https://github.com/notomo), [#20](https://github.com/rhysd/action-setup-vim/issues/20) [#21](https://github.com/rhysd/action-setup-vim/issues/21))
- Update dependencies to the latest. (including new `@actions/exec` and `@actions/io`)

[Changes][v1.2.10]


<a id="v1.2.9"></a>
# [v1.2.9](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.9) - 2022-02-05

- Use `node16` runner to run this action.
- Update dependencies. Now TypeScript source compiles to ES2021 code since Node.js v16 supports all ES2021 features.

[Changes][v1.2.9]


<a id="v1.2.8"></a>
# [v1.2.8](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.8) - 2021-10-02

- Installing Neovim nightly now fallbacks to building from source when downloading assets failed (thanks [@glacambre](https://github.com/glacambre), [#18](https://github.com/rhysd/action-setup-vim/issues/18), [#9](https://github.com/rhysd/action-setup-vim/issues/9))
  - This fallback logic is currently only for Linux and macOS
  - This fallback happens when [the release workflow](https://github.com/neovim/neovim/actions/workflows/release.yml) of [neovim/neovim](https://github.com/neovim/neovim) failed to update [the nightly release page](https://github.com/neovim/neovim/tree/nightly)
- Update many dependencies including all `@actions/*` packages and TypeScript compiler
- Now multiple versions of Vim/Neovim can be installed within the same job. Previously, Vim/Neovim installed via release archives or built from source were installed in `~/vim`/`~/nvim`. It meant that trying to install multiple versions caused a directory name conflict. Now they are installed in `~/vim-{ver}`/`~/nvim-{ver}` (e.g. `~/vim-v8.2.1234`, `~/nvim-nightly`) so that the conflict no longer happens.

[Changes][v1.2.8]


<a id="v1.2.7"></a>
# [v1.2.7](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.7) - 2021-02-05

- Fix: Installing stable Vim on `ubuntu-20.04` worker. `vim-gnome` was removed at Ubuntu 19.10. In the case, this action installs `vim-gtk3` instead. The worker is now used for `ubuntu-latest` also. ([#11](https://github.com/rhysd/action-setup-vim/issues/11))
- Improve: Better error message on an invalid value for `version` input
- Improve: Update dependencies

[Changes][v1.2.7]


<a id="v1.2.6"></a>
# [v1.2.6](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.6) - 2020-11-15

- Fix: Build failed on building Vim older than v8.2.1119 on macOS worker. Now Vim before v8.2.1119 is built with Xcode11 since it cannot be built with Xcode12. ([#10](https://github.com/rhysd/action-setup-vim/issues/10))
- Improve: Update dependencies

[Changes][v1.2.6]


<a id="v1.2.5"></a>
# [v1.2.5](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.5) - 2020-10-02

- Fix: Update `@actions/core` for security patch
- Improve: Internal refactoring
- Improve: Update dependencies

[Changes][v1.2.5]


<a id="v1.2.4"></a>
# [v1.2.4](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.4) - 2020-09-08

- Improve: When an asset for stable Neovim in `stable` release is not found, fallback to the latest version release by detecting the latest version via GitHub API. API token will be given via `token` input. You don't need to set it because it is set automatically. ([#5](https://github.com/rhysd/action-setup-vim/issues/5))
- Improve: Update dependencies to the latest

[Changes][v1.2.4]


<a id="v1.2.3"></a>
# [v1.2.3](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.3) - 2020-03-29

- Fix: Run `apt update` before `apt install` on installing stable Vim on Linux. `apt install vim-gnome` caused an error without this

[Changes][v1.2.3]


<a id="v1.2.2"></a>
# [v1.2.2](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.2) - 2020-02-22

- Improve: Better error message when no asset is found on installing Neovim

[Changes][v1.2.2]


<a id="v1.2.1"></a>
# [v1.2.1](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.1) - 2020-02-15

- Improve: Validate the executable file before getting `--version` output

[Changes][v1.2.1]


<a id="v1.2.0"></a>
# [v1.2.0](https://github.com/rhysd/action-setup-vim/releases/tag/v1.2.0) - 2020-02-02

- Improve: `github-token` input was removed since it is no longer necessary. This is not a breaking change since `github-token` input is now simply ignored.
  - GitHub API token was used only for getting the latest release of vim-win32-installer repository on Windows. But now the latest release is detected from redirect URL.

[Changes][v1.2.0]


<a id="v1.1.3"></a>
# [v1.1.3](https://github.com/rhysd/action-setup-vim/releases/tag/v1.1.3) - 2020-01-31

- Fix: `version` input check was not correct for Vim 7.x (e.g. `7.4.100`, `7.4`). [Thanks @itchyny!](https://github.com/rhysd/action-setup-vim/pull/1)
- Fix: Path separator was not correct on Windows
- Improve: Better post-action validation on CI and internal refactoring

[Changes][v1.1.3]


<a id="v1.1.2"></a>
# [v1.1.2](https://github.com/rhysd/action-setup-vim/releases/tag/v1.1.2) - 2020-01-31

- Fix: GitHub API call may fail relying on IP address of the worker (ref: [actions/setup-go#16](https://github.com/actions/setup-go/issues/16))

[Changes][v1.1.2]


<a id="v1.1.1"></a>
# [v1.1.1](https://github.com/rhysd/action-setup-vim/releases/tag/v1.1.1) - 2020-01-31

- Improve: `github-token` input is now optional even if you install Vim on Windows worker
- Improve: Update dev-dependencies

[Changes][v1.1.1]


<a id="v1.1.0"></a>
# [v1.1.0](https://github.com/rhysd/action-setup-vim/releases/tag/v1.1.0) - 2020-01-29

- New: Specific version tag can be set to `version` input like `version: v8.2.0126`. Please read [documentation](https://github.com/rhysd/action-setup-vim#readme) for more details.

[Changes][v1.1.0]


<a id="v1.0.2"></a>
# [v1.0.2](https://github.com/rhysd/action-setup-vim/releases/tag/v1.0.2) - 2020-01-28

- Improve: Now all input environment variables (starting with `INPUT_`) are filtered on executing subprocesses ([actions/toolkit#309](https://github.com/actions/toolkit/issues/309))
- Improve: Unit tests were added for validation of inputs and outputs
- Improve: Better validation error messages
- Improve: Better descriptions in README.md

[Changes][v1.0.2]


<a id="v1.0.1"></a>
# [v1.0.1](https://github.com/rhysd/action-setup-vim/releases/tag/v1.0.1) - 2020-01-25

- Improve: Install stable Neovim with Homebrew on macOS. Now it is installed via `brew install neovim`

[Changes][v1.0.1]


<a id="v1.0.0"></a>
# [v1.0.0](https://github.com/rhysd/action-setup-vim/releases/tag/v1.0.0) - 2020-01-24

First release :tada:

Please read [README.md](https://github.com/rhysd/action-setup-vim#readme) for usage.

[Changes][v1.0.0]


[v1.4.5]: https://github.com/rhysd/action-setup-vim/compare/v1.4.4...v1.4.5
[v1.4.4]: https://github.com/rhysd/action-setup-vim/compare/v1.4.3...v1.4.4
[v1.4.3]: https://github.com/rhysd/action-setup-vim/compare/v1.4.2...v1.4.3
[v1.4.2]: https://github.com/rhysd/action-setup-vim/compare/v1.4.1...v1.4.2
[v1.4.1]: https://github.com/rhysd/action-setup-vim/compare/v1.4.0...v1.4.1
[v1.4.0]: https://github.com/rhysd/action-setup-vim/compare/v1.3.5...v1.4.0
[v1.3.5]: https://github.com/rhysd/action-setup-vim/compare/v1.3.4...v1.3.5
[v1.3.4]: https://github.com/rhysd/action-setup-vim/compare/v1.3.3...v1.3.4
[v1.3.3]: https://github.com/rhysd/action-setup-vim/compare/v1.3.2...v1.3.3
[v1.3.2]: https://github.com/rhysd/action-setup-vim/compare/v1.3.1...v1.3.2
[v1.3.1]: https://github.com/rhysd/action-setup-vim/compare/v1.3.0...v1.3.1
[v1.3.0]: https://github.com/rhysd/action-setup-vim/compare/v1.2.15...v1.3.0
[v1.2.15]: https://github.com/rhysd/action-setup-vim/compare/v1.2.14...v1.2.15
[v1.2.14]: https://github.com/rhysd/action-setup-vim/compare/v1.2.13...v1.2.14
[v1.2.13]: https://github.com/rhysd/action-setup-vim/compare/v1.2.12...v1.2.13
[v1.2.12]: https://github.com/rhysd/action-setup-vim/compare/v1.2.11...v1.2.12
[v1.2.11]: https://github.com/rhysd/action-setup-vim/compare/v1.2.10...v1.2.11
[v1.2.10]: https://github.com/rhysd/action-setup-vim/compare/v1.2.9...v1.2.10
[v1.2.9]: https://github.com/rhysd/action-setup-vim/compare/v1.2.8...v1.2.9
[v1.2.8]: https://github.com/rhysd/action-setup-vim/compare/v1.2.7...v1.2.8
[v1.2.7]: https://github.com/rhysd/action-setup-vim/compare/v1.2.6...v1.2.7
[v1.2.6]: https://github.com/rhysd/action-setup-vim/compare/v1.2.5...v1.2.6
[v1.2.5]: https://github.com/rhysd/action-setup-vim/compare/v1.2.4...v1.2.5
[v1.2.4]: https://github.com/rhysd/action-setup-vim/compare/v1.2.3...v1.2.4
[v1.2.3]: https://github.com/rhysd/action-setup-vim/compare/v1.2.2...v1.2.3
[v1.2.2]: https://github.com/rhysd/action-setup-vim/compare/v1.2.1...v1.2.2
[v1.2.1]: https://github.com/rhysd/action-setup-vim/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/rhysd/action-setup-vim/compare/v1.1.3...v1.2.0
[v1.1.3]: https://github.com/rhysd/action-setup-vim/compare/v1.1.2...v1.1.3
[v1.1.2]: https://github.com/rhysd/action-setup-vim/compare/v1.1.1...v1.1.2
[v1.1.1]: https://github.com/rhysd/action-setup-vim/compare/v1.1.0...v1.1.1
[v1.1.0]: https://github.com/rhysd/action-setup-vim/compare/v1.0.2...v1.1.0
[v1.0.2]: https://github.com/rhysd/action-setup-vim/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/rhysd/action-setup-vim/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/rhysd/action-setup-vim/tree/v1.0.0

<!-- Generated by https://github.com/rhysd/changelog-from-release v3.9.0 -->
