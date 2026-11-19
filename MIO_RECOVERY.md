# Recovery checkpoint RG-T0-BASE
Initial source reference: 1c3901de6fa32e7a9099190e7e0e136d6f10f46d (main at audit).
Work on regenesis/t0-foundation; do not rewrite main. Restore via a new branch from verified commit, run npm run check and npm test, then review diff. No user data, model files or database verified; no physical backup/restore drill performed. Never copy secrets into Git. Future encrypted external backups must include data, model manifest, migrations, checksums and restore tests.

## RG-T0-DIAG
Source checkpoint precedes this change: dcecde460a76cb40334ee5ab0eb878ce851e0a8c. Restore to a fresh branch; verify Git objects and run node --test tests/*.test.mjs. Main has independent audit history at bc363004705814c8da76f95f3436a1486bc5090c; preserve both. External encrypted backup and full directive archival remain pending.

## RG-T1-SHELL
Parent source: 504faa67abdd9a9f0887deba8e3e1e6f254697. Historical main manifest preserved under docs/audit; no external backup or restore rehearsal. Run npm run check and npm test before attempting desktop startup.

## RG-T2-GALAXY
Parent source cb3f438ae6227df030ef0be339e26dbba59893d3. Galaxy layout deterministic; no real knowledge provider yet. External backup still pending.
