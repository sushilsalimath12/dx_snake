# DX Snakes

Classic Nokia 1100-inspired Snake game inside VS Code.

## Author & Support

- Author: **Sushil Salimath**
- Point of contact: **Sushil Salimath**
- Email: `sushilrsalimath@gmail.com`
- Phone: `+12368834784`
- Phone / WhatsApp: `+919738227964`

## Gameplay

- Eat food to grow and gain points
- Snake speeds up as you score
- Wall collision ends the game (classic challenge mode)
- Game ends if snake hits its own body
- Immediate 180-degree reverse turns are blocked
- High score is saved locally

## Controls

- Move: `Arrow Keys` or `W/A/S/D`
- Pause: `P`
- Restart: `R`

Mouse use is minimal: click once to focus the game panel if needed.

## Run Locally

1. Open this folder in VS Code.
2. Install dependencies:
   - `npm install`
3. Build:
   - `npm run build`
4. Press `F5` to launch the Extension Development Host.
5. Run command:
   - `DX Snakes: Start Game`

## Package For Marketplace

1. Update `publisher` in `package.json` to your Marketplace publisher ID.
2. Keep extension display name as `DX Snakes`.
3. (Optional) update version and icon.
4. Build and package:
   - `npm run package`
5. A `.vsix` file will be created in this folder.
6. Publish with VSCE (after login/token setup):
   - `npx vsce publish`

## Notes

- Game state is kept while the panel is open (`retainContextWhenHidden`).
- Designed intentionally simple, fast, and retro.
