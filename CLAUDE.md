# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal to-do app built as a learning exercise for working with Claude Code. The owner is learning, so explain changes briefly and keep each change small.

## Running

Plain HTML/CSS/JavaScript with no build step, dependencies, package manager, linter, or tests. Run it with `open index.html` and reload the browser (Cmd+R) after edits. Don't add frameworks, bundlers, or npm unless asked.

## Architecture

- `index.html` provides the static markup. `app.js` looks up elements by ID (`new-todo-form`, `new-todo-input`, `todo-list`, `count`, `clear-done`) and uses `data-filter` attributes on the filter buttons, so renaming any of these in the HTML requires updating `app.js`.
- `app.js` keeps all state in two module-level variables: `todos` (an array of `{ id, text, done, priority, prioritySetAt }`, where `id` comes from `Date.now()`, `priority` is `"hoch" | "mittel" | "niedrig"`, and `prioritySetAt` is the `Date.now()` of when the priority was last set on create or changed via edit; on load, missing `priority` becomes `"mittel"` and missing `prioritySetAt` falls back to `id`) and `filter` (`"all" | "active" | "done"`).
- `render()` sorts a copy of the visible tasks: open before done, then by `PRIORITY_RANK` (hoch, mittel, niedrig), then newest `prioritySetAt` first. The order of the stored `todos` array doesn't matter.
- The add form's priority dropdown remembers the last priority used to add a task, stored in `localStorage` under `"lastPriority"`.
- Every mutation follows the same pattern: change `todos`, then call `save()` (which writes the whole array as JSON to `localStorage` under the key `"todos"`), then call `render()` (which rebuilds the entire `<ul>` from scratch). There is no incremental DOM updating, and event listeners are attached per item inside `render()`.
- Task text is inserted with `textContent`, not `innerHTML`. Keep it that way to avoid HTML injection.
- If you add a field to the todo shape, remember that existing data in `localStorage` won't have it, so handle missing values.
