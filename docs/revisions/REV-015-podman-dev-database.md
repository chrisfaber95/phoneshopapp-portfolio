# REV-015 — Local dev database via Podman, stay on MySQL

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-015-podman-dev-database`        |
| PR     | #14                                          |
| Status | Merged (squash)                               |
| Repo   | ShopApp git repo, root + `ARCHITECTURE.md`   |

## What this revision does
Fixes the root `docker-compose.yml` so it actually starts a MySQL 8 container seeded from the existing dump, and documents the decision to stay on MySQL for local dev and production.

## Why this revision exists
The user was trying to containerize the dev database with Podman and asked whether MySQL was still the right engine. Investigation found:
- `podman` was not resolvable on PATH, and `wsl --status` reported WSL2 is not installed. Podman Desktop 1.29.3 was installed (`%LOCALAPPDATA%\Programs\Podman Desktop`) but its CLI/machine setup never completed, which needs WSL2 (or Hyper-V) on Windows.
- The existing `docker-compose.yml`'s volume mount for the seed dump used shell-style backslash escapes (`Dump20240103\ \(3\).sql`) inside an unquoted YAML scalar. YAML doesn't interpret backslash as an escape character there, so the string never matched the real filename (`Dump20240103 (3).sql`) and the mount would have failed/no-opped.
- No concrete performance problem was reported — a general hunch, not a measured issue.

## What changed
- `docker-compose.yml`: quoted the dump volume mount so the literal filename (with its space and parentheses) resolves correctly.
- `ARCHITECTURE.md`: added a "Database" section recording MySQL + Sequelize + Podman-based local dev, and the rationale for not switching engines (target scale of 10k products / 3k users is well within MySQL/InnoDB's range; switching would mean rewriting 38 tables and every query for no measured benefit).

## Implementation decisions
- Kept the compose file MySQL-only (no app service) — matches the project's separation-of-concerns rule; the Node app isn't infrastructure the DB container needs to own.
- Did not rename the dump file or change its path structure; only fixed how it's referenced.
- Did not touch `Server/config/connection.js` / `connection_store.js` — already committed and working (added in REV-009), reads `DB_HOST`/`DB_USER`/`DB_PASS`/`DB_NAME` from `Server/.env`, which already matches the compose file's `MYSQL_DATABASE`/`MYSQL_ROOT_PASSWORD`.

## Architectural decisions
Stay on MySQL (see `ARCHITECTURE.md` → Database). The one real performance smell found in the schema — `char(36)` UUID primary keys across all 38 tables — is flagged as future work, not addressed here, since no query has actually been measured as slow.

## Tests added
None — infrastructure/config only.

## Tests executed
- User installed WSL2 and completed Podman Desktop's machine setup after the initial PR was opened (Podman 6.0.2, `podman-machine-default`, WSL backend).
- `podman machine init` / `start` worked, but `podman run`/`podman compose up` initially failed two different ways, both traced to the same root cause:
  - `podman-compose up` failed creating a pod cgroup ("Unit ... was already loaded or has a fragment file").
  - A plain `podman run` then failed with `crun: controller 'pids' is not available under /sys/fs/cgroup/non-systemd/...`.
  - Root cause: the machine's default `cgroup_manager = "systemd"` doesn't fully delegate the `pids` controller under this WSL2 image's cgroup hierarchy (the `/sys/fs/cgroup/non-systemd` node has no `cgroup.subtree_control` entries, so nothing under it gets a controller regardless of what the root cgroup delegates). This is a known WSL-backend Podman issue, not specific to this project.
  - Fix: added `/etc/containers/containers.conf.d/99-cgroupfs.conf` inside the podman machine VM with `cgroup_manager = "cgroupfs"`, then restarted the machine. This makes crun manage cgroups directly instead of relying on systemd delegation.
  - Briefly tried switching the machine to rootful mode as an alternative fix; that turned out to be unnecessary (cgroupfs fixed it on its own) and broke port-forwarding to the Windows host (gvproxy doesn't forward rootful container ports the same way), so reverted to rootless.
- After the fix: `podman compose up -d` starts `cooplubbers_mysql`, reaches `healthy`, seeds all 38 tables from the dump (spot-checked: 12,304 rows in `Product`, 782 in `Department`, 8 in `User`).
- Verified end-to-end: ran `Server/config/connection.js`'s `sequelize.authenticate()` against the container using the real `Server/.env` values — succeeded (`DB CONNECTION OK`).
- `npm test` not affected by this revision (no app code changed).

## Known limitations
- The `cgroupfs` fix lives only inside the Podman machine VM's filesystem (`/etc/containers/containers.conf.d/99-cgroupfs.conf`), not in this repo — it doesn't survive a full `podman machine rm` + re-`init`. If that ever happens, redo: `podman machine ssh -- "sudo tee /etc/containers/containers.conf.d/99-cgroupfs.conf" <<< $'[engine]\ncgroup_manager = \"cgroupfs\"'` then `podman machine stop; podman machine start`.

## Future work discovered
- Schema uses `char(36)` UUID primary keys on all 38 tables with no visible secondary indexes in the dump — worth an indexing pass if/when a specific slow query is measured.
- Consider a `docker-compose.override.yml` or a second compose file if a containerized app service is ever wanted; out of scope here since it wasn't requested and adds no concrete benefit yet.

## Summary
The dev-database compose file works end-to-end: `podman compose up -d` starts MySQL, seeds the real dump, and the Server app connects to it using its existing `.env`. The "should we switch off MySQL" question is answered and recorded: no, not without a measured reason to.
