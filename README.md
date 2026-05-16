# DX Snakes

Retro keyboard-first Snake game for VS Code and Cursor.

## Author and Support

- Author: **Sushil Salimath**
- Email: `sushilrsalimath@gmail.com`
- Issues: `https://github.com/sushilsalimath12/dx_snake/issues`

## Gameplay

- Eat food to grow and gain score.
- Eat frog bonus prey for extra score and extra growth.
- Speed increases as score increases.
- One-time slow mode is available with a score penalty.
- Game ends on wall collision or self-collision.
- High score is saved locally in webview storage.

## Controls

- `S`: Start game (or click **Start Game** button)
- `Up Arrow`: Turn left
- `Down Arrow`: Turn right
- `R`: Restart
- `S` during gameplay: Slow once (`-10` score)

## Install

### From Marketplace

Search for `DX Snakes` in the Extensions panel and install.

### From VSIX

1. Build package:
   - `npm run package`
2. Install in Cursor/VS Code:
   - `Extensions: Install from VSIX...`
   - Select `dx-snakes-<version>.vsix`

## Development

1. Install dependencies:
   - `npm install`
2. Build:
   - `npm run build`
3. Launch extension dev host:
   - press `F5`
4. Run command:
   - `DX Snakes: Start Game`

## Release Notes

See `CHANGELOG.md` for all versions.
