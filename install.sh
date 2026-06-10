#!/usr/bin/env bash
# ============================================================================
# Cyberdeck — installer / re-applier for the animated backdrop.
#
# Injects the canvas animation + neon chrome (custom-css/*) directly into
# VS Code's workbench.html. No extension required — this is a self-contained
# hand-patch. Run it once to install, and again after every VS Code update
# (updates overwrite workbench.html and wipe the effect).
#
#   ./install.sh
#
# Then: Cmd+Shift+P -> "Developer: Reload Window".
#
# macOS + VS Code only. For the color theme and the Claude Code terminal
# theme, see README.md (those are separate, one-time, manual steps).
# ============================================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSS_DIR="$REPO_DIR/custom-css"

# Default macOS location. Override for a different install:
#   WORKBENCH=/path/to/workbench.html ./install.sh
WORKBENCH="${WORKBENCH:-/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html}"

if [ ! -f "$WORKBENCH" ]; then
  echo "✗ workbench.html not found at:"
  echo "  $WORKBENCH"
  echo
  echo "  • Not on macOS, or VS Code is elsewhere? Set WORKBENCH=... and re-run."
  echo "  • On macOS the 'code' command may be Cursor, not VS Code — that's fine,"
  echo "    this script patches the VS Code app bundle directly."
  exit 1
fi

for f in cyberpunk-glow.css cyberpunk-bg.css cyberpunk-bg.js; do
  [ -f "$CSS_DIR/$f" ] || { echo "✗ missing $CSS_DIR/$f"; exit 1; }
done

# Back up before touching the app bundle.
if ! cp "$WORKBENCH" "$WORKBENCH.bak-cyberdeck-$(date +%Y%m%d-%H%M%S)" 2>/dev/null; then
  echo "✗ Can't write inside the VS Code app bundle. Fix ownership, then re-run:"
  echo "  sudo chown -R \"\$(whoami)\" \"/Applications/Visual Studio Code.app\""
  exit 1
fi

python3 - "$WORKBENCH" "$CSS_DIR" <<'PY'
import sys, re, uuid, os
wb, d = sys.argv[1], sys.argv[2]
html = open(wb, encoding="utf-8").read()
glow  = open(os.path.join(d, "cyberpunk-glow.css"), encoding="utf-8").read()
bgcss = open(os.path.join(d, "cyberpunk-bg.css"),  encoding="utf-8").read()
bgjs  = open(os.path.join(d, "cyberpunk-bg.js"),   encoding="utf-8").read()
sid = str(uuid.uuid4())
block = ("<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID %s !! -->\n"
         "<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n"
         "<style>%s</style>\n<style>%s</style>\n<script>%s</script>\n"
         "<!-- !! VSCODE-CUSTOM-CSS-END !! -->") % (sid, glow, bgcss, bgjs)
# remove any previous injection, then insert fresh after the workbench css link
html = re.sub(r"\n?<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID .*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->", "", html, flags=re.S)
anchor = '<link rel="stylesheet" href="../../../workbench/workbench.desktop.main.css">'
html = html.replace(anchor, anchor + "\n" + block, 1) if anchor in html else html.replace("</head>", block + "\n</head>", 1)
open(wb, "w", encoding="utf-8").write(html)
chk = open(wb, encoding="utf-8").read()
ok = chk.count("VSCODE-CUSTOM-CSS-START") == 1 and "__cyberpunkBG" in chk
print("✓ animated backdrop injected" if ok else "✗ injection check FAILED")
PY

cat <<'EOF'

Next:
  1. Cmd+Shift+P -> "Developer: Reload Window"   (loads the patched UI)
  2. If you haven't yet: merge settings/settings-snippet.jsonc into your
     VS Code settings.json, and set the Claude Code theme (see README.md).

VS Code will warn "Your installation appears corrupt" — that's expected after
patching workbench.html. Click the gear -> "Don't Show Again".
EOF
