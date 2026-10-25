# assets

- **`demo.gif`**: a screen recording of the animated backdrop behind Claude Code
  in VS Code. The README uses it as the hero image.
- **`poster.svg`**: a static poster of the scene.

To re-record the GIF on macOS: `Cmd+Shift+5`, record a small region of the
editor for ~6 s, then convert it, for example
`ffmpeg -i screen.mov -vf "fps=10,scale=820:-1" demo.gif` (Gifski gives a
nicer result).
