#!/bin/bash
# ============================================================
# organize-downloads.sh
#
# Moves files I send you in chat from ~/Downloads into the right
# spot in your website project folder, automatically.
#
# Usage:
#   1. Edit PROJECT_DIR below to match where your website folder lives.
#   2. Run:  bash organize-downloads.sh
#      (or make it executable once with: chmod +x organize-downloads.sh
#       then just run: ./organize-downloads.sh)
#
# WARNING: after organizing, this script immediately wipes EVERYTHING
# ELSE in your actual ~/Downloads folder (not just the "files" subfolder)
# — no confirmation, no undo — keeping only the just-bumped unrecognised
# files. This uses rm -rf, which bypasses Trash entirely.
# ============================================================

set -e

# ---- EDIT THIS to your actual project folder ----
PROJECT_DIR="$HOME/Desktop/website"
DOWNLOADS_DIR="$HOME/Downloads/files"
FALLBACK_DIR="$HOME/Downloads"
# ---------------------------------------------------

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project folder not found at: $PROJECT_DIR"
  echo "Edit PROJECT_DIR at the top of this script and try again."
  exit 1
fi

if [ ! -d "$DOWNLOADS_DIR" ]; then
  echo "Downloads folder not found at: $DOWNLOADS_DIR"
  echo "If your browser saves files somewhere else (e.g. straight into ~/Downloads,"
  echo "not a 'files' subfolder), edit DOWNLOADS_DIR at the top of this script."
  exit 1
fi

moved=0
bumped=0
bumped_names=()

# Maps a known filename to its destination path, relative to PROJECT_DIR.
destination_for() {
  case "$1" in
    "index.html") echo "index.html" ;;
    "services.html") echo "services.html" ;;
    "portfolio.html") echo "portfolio.html" ;;
    "about.html") echo "about.html" ;;
    "contact.html") echo "contact.html" ;;
    "404.html") echo "404.html" ;;
    "README.md") echo "README.md" ;;

    "style.css") echo "css/style.css" ;;

    "main.js") echo "js/main.js" ;;
    "supabase-client.js") echo "js/supabase-client.js" ;;
    "cms.js") echo "js/cms.js" ;;
    "page-home.js") echo "js/page-home.js" ;;
    "page-contact.js") echo "js/page-contact.js" ;;

    "schema.sql") echo "db/schema.sql" ;;
    "seed.sql") echo "db/seed.sql" ;;

    "login.html") echo "admin/login.html" ;;
    "admin-login.js") echo "admin/admin-login.js" ;;
    "dashboard.html") echo "admin/dashboard.html" ;;
    "dashboard.js") echo "admin/dashboard.js" ;;

    "flexle.html") echo "portfolio/flexle.html" ;;
    "full-window.html") echo "portfolio/full-window.html" ;;
    "credits.html") echo "portfolio/credits.html" ;;
    "volume-plus.html") echo "portfolio/volume-plus.html" ;;

    *) echo "" ;;
  esac
}

# Real app icons you export yourself — matched by project name, any of
# these extensions, and routed to assets/icons/ automatically.
is_icon_slug() {
  case "$1" in
    flexle|full-window|credits|volume-plus) return 0 ;;
    *) return 1 ;;
  esac
}

# Moves a file up to ~/Downloads, avoiding overwriting anything already
# there by appending "-1", "-2" etc. to the filename if needed.
bump_to_fallback() {
  local src="$1"
  local name
  name=$(basename "$src")
  local target="$FALLBACK_DIR/$name"

  if [ -e "$target" ]; then
    local base="${name%.*}"
    local ext="${name##*.}"
    local n=1
    if [ "$base" = "$ext" ]; then
      # no extension
      while [ -e "$FALLBACK_DIR/${base}-${n}" ]; do n=$((n+1)); done
      target="$FALLBACK_DIR/${base}-${n}"
    else
      while [ -e "$FALLBACK_DIR/${base}-${n}.${ext}" ]; do n=$((n+1)); done
      target="$FALLBACK_DIR/${base}-${n}.${ext}"
    fi
  fi

  mv -f "$src" "$target"
  echo "Not recognised, moved to Downloads: $name -> $(basename "$target")"
  bumped_names+=("$(basename "$target")")
}

shopt -s nullglob
for filepath in "$DOWNLOADS_DIR"/*; do
  filename=$(basename "$filepath")
  [ -f "$filepath" ] || continue

  # Strip macOS/Safari's " (1)", " (2)" etc. duplicate-download suffix
  # before matching, e.g. "style (1).css" -> "style.css"
  clean_name=$(echo "$filename" | sed -E 's/ \([0-9]+\)(\.[^.]+)$/\1/')
  base="${clean_name%.*}"
  ext="${clean_name##*.}"

  dest=$(destination_for "$clean_name")

  if [ -n "$dest" ]; then
    target="$PROJECT_DIR/$dest"
    mkdir -p "$(dirname "$target")"
    mv -f "$filepath" "$target"
    echo "Moved: $filename -> $dest"
    moved=$((moved+1))
  elif is_icon_slug "$base" && [[ "$ext" =~ ^(png|jpg|jpeg|svg)$ ]]; then
    target="$PROJECT_DIR/assets/icons/$base.$ext"
    mkdir -p "$(dirname "$target")"
    mv -f "$filepath" "$target"
    echo "Moved: $filename -> assets/icons/$base.$ext"
    moved=$((moved+1))
  else
    bump_to_fallback "$filepath"
    bumped=$((bumped+1))
  fi
done

echo ""
echo "Done. $moved file(s) organized into the project, $bumped file(s) not recognised (moved up to ~/Downloads)."

# ---- Wipe everything else in ~/Downloads ----
# Keeps ONLY the files just bumped up above. Deletes every other file and
# folder sitting in ~/Downloads, including the now-empty "files" folder.
# No confirmation — this runs immediately every time.
shopt -s nullglob dotglob
for item in "$FALLBACK_DIR"/*; do
  name=$(basename "$item")
  keep=false
  for kept in "${bumped_names[@]}"; do
    if [ "$name" = "$kept" ]; then
      keep=true
      break
    fi
  done
  if [ "$keep" = false ]; then
    rm -rf "$item"
    echo "Deleted: $name"
  fi
done
echo ""
echo "Downloads wiped. Only the $bumped bumped file(s) remain."