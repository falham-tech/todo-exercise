# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal to-do app built as a learning exercise for working with Claude Code. The owner is learning, so explain changes briefly and keep each change small.

## Running

Plain HTML/CSS/JavaScript with no build step, dependencies, package manager, linter, or tests. Run it with `open index.html` and reload the browser (Cmd+R) after edits. Don't add frameworks, bundlers, or npm unless asked.

## Architecture

- `index.html` provides the static markup. `app.js` looks up elements by ID (`new-todo-form`, `new-todo-input`, `todo-list`, `count`, `clear-done`) and uses `data-filter` attributes on the filter buttons, so renaming any of these in the HTML requires updating `app.js`.
- `app.js` keeps all state in two module-level variables: `todos` (an array of `{ id, text, done, priority }`, where `id` comes from `Date.now()` and `priority` is `"hoch" | "mittel" | "niedrig"`; tasks saved before priorities existed are normalized to `"mittel"` on load) and `filter` (`"all" | "active" | "done"`).
- Every mutation follows the same pattern: change `todos`, then call `save()` (which writes the whole array as JSON to `localStorage` under the key `"todos"`), then call `render()` (which rebuilds the entire `<ul>` from scratch). There is no incremental DOM updating, and event listeners are attached per item inside `render()`.
- Task text is inserted with `textContent`, not `innerHTML`. Keep it that way to avoid HTML injection.
- If you add a field to the todo shape, remember that existing data in `localStorage` won't have it, so handle missing values.
