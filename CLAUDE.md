# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.** State assumptions explicitly, and ask if uncertain. If multiple interpretations exist, present them rather than picking silently. If a simpler approach exists, say so and push back when warranted. If something is unclear, stop, name what's confusing, and ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.** No features beyond what was asked, no abstractions for single-use code, no "flexibility" or "configurability" that wasn't requested, no error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it — would a senior engineer call this overcomplicated?

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.** When editing existing code: don't "improve" adjacent code, comments, or formatting; don't refactor things that aren't broken; match existing style even if you'd do it differently; mention unrelated dead code instead of deleting it. Remove imports/variables/functions that your own changes made unused, but don't remove pre-existing dead code unless asked. Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.** Transform tasks into verifiable goals — "add validation" becomes "write tests for invalid inputs, then make them pass"; "fix the bug" becomes "write a test that reproduces it, then make it pass". For multi-step tasks, state a brief step → verify plan before starting. Strong success criteria let you loop independently; weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project Overview

Webshop for a supermarket ("Virtuele Winkelschap", Coop Lubbers), two parts, each its own git repo (branches/commits/PRs/CI happen inside that folder; `N:\Projects\ShopApp` itself is not a git repo):

- `Klant`: Vue 2 client (vuex, bootstrap-vue, axios, service worker) — repo `chrisfaber95/Client`
- `Server`: Node/Express API on MySQL, Mollie payments, nodemailer — repo `chrisfaber95/phoneshopapp`

Manages departments, shelf units, products, discounts, carts, orders, users and messages.

## Primary Development Philosophy

Build the application incrementally: every meaningful piece of work is a separate revision — small, independently testable and reviewable, focused on one purpose, documented, and delivered through a GitHub Pull Request. Do not combine unrelated features into a single revision or create enormous PRs.

## Detailed Rules

These are part of the project instructions and apply in full:

@docs/WORKFLOW.md
@docs/ENGINEERING_RULES.md

`docs/WORKFLOW.md` is an index: read the matching file in `docs/workflow/` when you start that step.

## Reference docs (read when relevant)

- `docs/AGENTS.md` — specialist agent delegation table; consult before delegating implementation work.
- `docs/GRAPHIFY.md` — knowledge-graph query rules; only relevant if `graphify-out/` exists.
