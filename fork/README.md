# fork/

The fork's own tooling and files, kept in one place at the edge of the tree so upstream
merges never touch them.

| Path | What it is |
|---|---|
| `identity.py` | Renames upstream's tree to Accurona. Re-run after every upstream merge; `--check` must be clean. |
| `merge-upstream.sh`, `MERGING.md` | Merging an upstream release, and the procedure behind it. |
| `OURS` | Files that are wholly ours; a merge puts them back rather than taking upstream's. |
| `UPSTREAM` | The upstream release the tree was last synced to. |
| `brand/` | The integration's icons, copied over upstream's by `identity.py`. |
| `github/` | GitHub files copied over upstream's by `identity.py` (the issue chooser). |

## Repository decisions

- **Workflows.** Kept from upstream: `ci.yml` (frontend, Python, hassfest, HACS),
  `release.yml` (release zip) and `issue-labels.yml`. Dropped by `identity.py`:
  `discord-release.yml` (posts to the author's Discord), `shop-check.yml` (probes his
  shop) and `pages.yml` (publishes his site). Added: `fork.yml`, which runs
  `identity.py --check`.
- **Secrets.** None. No retained workflow needs one, in the Actions store or the
  Dependabot store: nothing reaches a private registry or an outside service.
- **Dependabot.** Security updates only; versions arrive with upstream merges.
  The same for GitHub Actions, whose bumps would touch upstream's workflows.
- **Branch protection on `main`.** Force pushes and branch deletion are blocked; direct
  pushes are allowed.
- **Issues and Discussions** are on. The issue chooser sends ideas and questions to
  Discussions.
