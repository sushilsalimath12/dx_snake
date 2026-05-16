# DX Snakes Release Guide

## Current Publisher

- Publisher ID: `sushilsalimath`
- Extension ID: `sushilsalimath.dx-snakes`

## Publish Existing Version

```powershell
npx @vscode/vsce login sushilsalimath
npx @vscode/vsce publish 0.2.3
```

## Publish Next Version

1. Update `version` in `package.json`
2. Build + test + package:

```powershell
npm run test:game
npm run build
npm run package
```

3. Publish:

```powershell
npx @vscode/vsce publish <new-version>
```

## UI Upload Option

1. Open Marketplace publisher dashboard.
2. Click **New extension** -> **Visual Studio Code**.
3. Upload generated `.vsix` file.

## Notes

- Never republish same version after successful upload.
- Use semantic versioning for each release.
- Keep README and CHANGELOG updated per release.
