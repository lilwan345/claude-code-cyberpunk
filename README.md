<h1 align="center">Cyberdeck ⚡</h1>

<p align="center">
  A cyberpunk skin for <b>Claude Code</b> running inside VS Code.<br>
  Animated neon backdrop · flowing terminal frame · magenta → cyan shimmer · crisp text.
</p>

<p align="center">
  <img src="assets/demo.gif" alt="Cyberdeck: animated cyberpunk backdrop behind Claude Code" width="820">
</p>

<p align="center">
  <b><a href="https://lilwan345.github.io/claude-code-cyberpunk/wallpaper/">▶ See the live animated scene</a></b>
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-ff2e97"></a>
  <img alt="platform" src="https://img.shields.io/badge/platform-macOS-00eaff">
  <img alt="editor" src="https://img.shields.io/badge/VS%20Code-1.100%2B-b46bff">
</p>

---

## What this is

I spend a lot of time staring at Claude Code in VS Code, so I wanted it to look
like a synthwave cyberdeck. It's three separate layers and you can use one, two
or all three:

1. **Animated backdrop.** A real 60 fps `<canvas>` scene (a drifting nebula,
   flowing neon waves, a grid floor going off into the distance) that sits
   *behind* a see-through editor and terminal.
2. **Color layer.** A near-black, very neon palette for the whole VS Code UI and
   the built-in terminal. The tabs, scrollbars and the terminal frame get
   restyled too.
3. **Claude Code terminal theme.** A matching theme for Claude Code itself, so
   its "thinking" text fades magenta → cyan and its prompts glow.

The text stays **crisp**. I took the glow off the letters on purpose, it just
makes small text fuzzy. All the atmosphere comes from the backdrop and the
colors.

## See it before installing anything

The backdrop is adapted from a standalone Canvas 2D scene (no libraries) that I
built first as a reference. That one is the full version with the synthwave sun
and the city skyline:

- **Live preview:** https://lilwan345.github.io/claude-code-cyberpunk/wallpaper/
- Or just open [`wallpaper/index.html`](wallpaper/index.html) in any browser.
- Bonus: you can set that page as a live macOS wallpaper with
  [Plash](https://github.com/sindresorhus/Plash) (free).

## Heads up (read this first)

This is a hobby hack and I want to be upfront about it:

- **macOS + VS Code only** (the installer patches the VS Code app bundle).
- The backdrop works by injecting CSS/JS into VS Code's `workbench.html`. VS Code
  will show a one-time **"Your installation appears corrupt"** banner. That's
  expected, just dismiss it.
- **A VS Code update wipes the backdrop** because it replaces
  `workbench.html`. Just re-run `./install.sh` after updating. The color layer
  and the Claude theme survive updates since they live in your user settings.

## Install

```bash
git clone https://github.com/lilwan345/claude-code-cyberpunk.git
cd claude-code-cyberpunk
```

**1 · Color layer.** Open your VS Code settings JSON
(`Cmd+Shift+P` → *Preferences: Open User Settings (JSON)*) and merge in the keys
from [`settings/settings-snippet.jsonc`](settings/settings-snippet.jsonc).
The transparent `#00000000` backgrounds are what let the backdrop show through.

**2 · Claude Code theme**

```bash
mkdir -p ~/.claude/themes
cp theme/cyberpunk-neon.json ~/.claude/themes/
```

Then in Claude Code: `/theme` → **Cyberpunk Neon**.

**3 · Animated backdrop**

```bash
./install.sh
```

**4 · Reload.** `Cmd+Shift+P` → *Developer: Reload Window*.

> If `install.sh` says it can't write to the app bundle, run
> `sudo chown -R "$(whoami)" "/Applications/Visual Studio Code.app"` and try again.

## After a VS Code update

```bash
cd claude-code-cyberpunk && ./install.sh
```

Then reload the window. That's the only upkeep.

## Make it yours

All the settings you'd want to tweak are at the top of the source files. Edit
them, then re-run `./install.sh`:

| Want to change | File | Setting |
|---|---|---|
| Brightness / how dark the veil over the text is | `custom-css/cyberpunk-bg.js` | `DIM` (lower = brighter) |
| Animation speed | `custom-css/cyberpunk-bg.js` | `SPEED`, `GRIDSPEED` |
| Nebula color & intensity | `custom-css/cyberpunk-bg.js` | `nebula[].a`, `.c` |
| Wave size | `custom-css/cyberpunk-bg.js` | wave `amp` |
| Terminal frame / scrollbars / tabs | `custom-css/cyberpunk-bg.css` | (no single setting) |

## How it works

`install.sh` pastes three files into VS Code's `workbench.html`, between
`VSCODE-CUSTOM-CSS` markers:

- `cyberpunk-bg.js` adds a full-window `<canvas>` at the very back (z-index 0)
  and animates it.
- `cyberpunk-bg.css` makes the workbench, editor and terminal backgrounds
  transparent so the canvas shows through, then restyles the tabs, scrollbars
  and frame.
- `cyberpunk-glow.css` adds frosted-glass panels and the status-bar styling.

There's no VS Code extension, it's a self-contained patch. Every run backs up
`workbench.html` first (`*.bak-cyberdeck-*`).

## Credits

Inspired by the synthwave look and neon VS Code themes like SynthWave '84. The
difference here is a live animated backdrop instead of a static glow, tuned to
sit behind Claude Code.

## License

[MIT](LICENSE) © 2026 Liyuan Wan. Use it, fork it, remix it.
