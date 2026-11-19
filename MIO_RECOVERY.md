# Recovery checkpoint RG-T0-BASE
Initial source reference: 1c3901de6fa32e7a9099190e7e0e136d6f10f46d (main at audit).
Work on regenesis/t0-foundation; do not rewrite main. Restore via a new branch from verified commit, run npm run check and npm test, then review diff. No user data, model files or database verified; no physical backup/restore drill performed. Never copy secrets into Git. Future encrypted external backups must include data, model manifest, migrations, checksums and restore tests.

## RG-T0-DIAG
Source checkpoint precedes this change: dcecde460a76cb40334ee5ab0eb878ce851e0a8c. Restore to a fresh branch; verify Git objects and run node --test tests/*.test.mjs. Main has independent audit history at bc363004705814c8da76f95f3436a1486bc5090c; preserve both. External encrypted backup and full directive archival remain pending.

## RG-T1-SHELL
Parent source: 504faa67abdd9a9f0887deba8e3e1e6f254697. Historical main manifest preserved under docs/audit; no external backup or restore rehearsal. Run npm run check and npm test before attempting desktop startup.

## RG-T2-GALAXY
Parent source cb3f438ae6227df030ef0be339e26dbba59893d3. Galaxy layout deterministic; no real knowledge provider yet. External backup still pending.

## RG-T3-LOCAL
Parent b79b245693934fb3e62544da3df643bcbdaeb0ef. Local runtime source; model inventory empty; no external backup.

## RG-T4-MEMORY
Parent source 2111884a89dde8b2b472a97773613f8a18528da0. SQLite schema 1 source only; actual database backup and restore not yet verified. Never commit local memory files.

## RG-T5-AGENT
Parent d35e7e2d0aa9f6d9be9987877805e3c50194f356. Structured agent source; no durable task resume or external backup.

## RG-T6-TRUST
Parent 8d3e88a004bbf3e9df391b024ce3606b95ac9238. Security primitives only; never commit keys or private logs. External backup still pending.

## RG-T7-RESEARCH
Parent a78c3edf09c379d27082d90537112b177bc62735. Source and claim registry only; no live source verification or external backup.

## RG-T8-VOICE
Parent 07c6c1f8f68a0483fdfee16d473afe833eb9f75f. Voice orchestration and communication profile; no model or audio backup, no physical recovery drill.

## RG-T9-FILES
Parent 4298b6fd1b38bc05f14b5f11e3c8abf40e9fb435. Byte-level inspection and review-only suggestions; no file modifications or external backup.
