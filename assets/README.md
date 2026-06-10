# assets

Put the demo here:

- **`demo.gif`** — a 3–5 second loop of the animated backdrop behind Claude Code.
  This is the single most important file in the repo; the README embeds it at
  the top. Keep it under ~5 MB so it loads fast on GitHub.

Suggested capture (macOS):
1. `Cmd+Shift+5` → record a small region of the editor/terminal for ~6 s.
2. Convert to GIF, e.g. `ffmpeg -i screen.mov -vf "fps=18,scale=900:-1" demo.gif`
   (or use Gifski / CleanShot X for a nicer result).
3. Save as `assets/demo.gif`.
