When a task asks to add, replace, or generate raster images, use the `imagegen` workflow.

Prefer the built-in image generation path first when it is available.

If the built-in image tool is unavailable and the user allows it, use the CLI fallback at `C:\Users\user\.codex\skills\.system\imagegen\scripts\image_gen.py`.

For project-bound images, save the final selected assets into the workspace and update the app to reference them.

Do not leave project-referenced images only in temporary folders or Codex output folders.

## GitHub Workflow

`gh` authentication is already configured in this environment.

For GitHub-related tasks, prefer using the GitHub CLI `gh` first unless the user asks for a different path.

Before GitHub work that depends on auth, verify it with `gh auth status`.

This project's visual direction should stay soft, cozy, and playful.

Prefer a pastel dessert-game look with cupcake bakery themes, warm light, rounded forms, and gentle sparkles.

Keep the palette in pink, cream, peach, butter yellow, and small accents of sky blue or lavender. Avoid dark, muddy, neon, or highly saturated cyber-style palettes unless the user explicitly asks for them.

When adding or generating images, make them feel suitable for a cute collection game UI rather than realistic advertising art. Favor polished stylized illustration or soft 3D illustration over harsh photorealism unless the user requests realism.

For hero and decorative background images, preserve calm negative space where text, buttons, cards, or UI overlays need to sit. Do not fill every area with detail.

For baking-table or crafting surfaces, keep the center area visually readable and push decorative objects toward the edges when the UI needs room in the middle.

For showcase or shelf backgrounds, cluster cupcakes and decorations toward the left and right sides so overlay content remains legible in the center.

Avoid text embedded inside generated images unless the user explicitly asks for it.

When replacing project-bound images, save the final selected assets in the workspace and update code references to use them.

## Branch And Worktree Rules

For any code or content change, do not work directly on the shared default branch in the main checkout.

Always create a dedicated branch for the task, and prefer a separate `git worktree` for that branch so multiple tasks can proceed in parallel without interfering with each other.

Use one branch and one worktree per logical task. Do not mix unrelated work in the same branch or worktree.

Before making edits, confirm which branch and worktree are assigned to the task. If none exist yet, create them first.

When a task is finished, keep the workspace clean: commit only the intended files, push the task branch, and clean up old worktrees only after they are no longer needed.
