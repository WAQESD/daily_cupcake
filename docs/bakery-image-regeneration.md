# Bakery Scene Regeneration

This project keeps the bakery scene renderer in-repo so the shipped assets can be reproduced without relying on temporary files.

## Requirements

```powershell
python -m pip install -r requirements-bakery-images.txt
```

## Render

```powershell
npm run render:bakery-images
```

The script writes directly to:

- `assets/images/hero-bakery-v2.png`
- `assets/images/oven-stage-v2.png`
- `assets/images/showcase-shelf-v2.png`

The renderer entrypoint lives at `scripts/generate_bakery_images.py`.
