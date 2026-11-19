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

## RG-T10-PERCEPTION
Parent 75664f721f7e11c29f0008c8fdd18350f9cb3e14. Perception orchestration only; no model/media backup or full restore drill.

## RG-T11-MESH
Parent f187faf4fd0a118880bbaabd9041a844c754adc0. Procedural geometry and OBJ serialization; no external backup or Blender validation.

## RG-T12-ANIMATION
Parent 1f7e9c7531f81f1e12b3cf8b6e00104d9c4ad3f5. Keyframe and mesh transformation foundation, JSON serialization only; no external backup or renderer validation.

## RG-T13-VISUAL
Parent a73db7cd60fa81d5d6e2992b57aa7303ca536043. Visual primitives and raw pixel filters; no external backup or desktop rendering validation.

## RG-T14-AUDIO
Parent dfc989acff76fae9c9499bfee9560ae71c1aab5d. Audio primitives and WAV serialization only; no external backup.

## RG-T15-MUSIC
Parent 5e7f343f8235ac81bc730d79da08970388d7e08f. Note sequences and MIDI/WAV serialization; no external backup or DAW validation.

## RG-T16-ORCHESTRATION
Parent c6053a8e5517a9328eff5c424e4889371c0bd993. Orchestrator foundation with in-memory audit and scoped grants; external backup and production integration pending.

## RG-T17-PLANNING
Parent 244c8f2cf1099208b56ae4a4b2bcdaa872f32580. Bounded planning and in-memory feedback; no external backup or live model verification.

## RG-T18-REVIEW
Parent ff6294aef92c6cd369539c38178ae6e1bc3dcb5b. Reviewed session source; local tests with simulated model only. External backup and release gates outstanding.

## RG-T18-LOCAL-ASSISTANT
Parent 6c66d88a9c390077260c3505c4f362feaacbf11f. Local runtime integration with simulated model transport. No external backup or live model verification.

## RG-T18-AUTOMATION
Parent 3aa01b7265b910fb9fff17b78e1f348286668e4f. Process-local manually polled scheduler; no durable backup or production integration.

## RG-T18-PROJECT
Parent 40c2aa2f1e48dcb5292fe6e8b5f47e7a353a4204. In-memory project workspace; no persistent project data or external backup.

## RG-T18-DEVELOPER
Parent 12028566929e44c6934ed4b7cde7077000469843. Read-only heuristic developer inspection; no external backup or live repository integration.

## RG-T18-RECOVERY
Parent 01c70579900c2b5d8a3fe9e710732bc17d90b6ee. Authenticated in-memory recovery bundle foundation; external backup reference remains null.

## RG-T18-UNIFIED
Parent 1a912bccd99824ecfec061e776da315ae8e8a9b1. Partial runtime facade; external recovery package and production validation outstanding.

## RG-T18-DESKTOP
Parent 8183931438224b5c131a43f1371bf7893e542bb6. Partial Electron chat wiring; actual desktop build and smoke test outstanding.

## RG-T18-QA
Parent b08d9fd221dbed0f628737fb9da64fa92e22ced2. Targeted recovery path regression; full suite and external backup still pending.

## RG-T18-TEST-GATE
Parent 3fabc780eb4209afe073bb834cf92afef22ceefb. Partial local regression; full suite and release validation remain pending.

## RG-T18-PERFORMANCE
Parent 2d74507320da3bd94fe663a17445464722c280d2. Incremental session accounting; target performance and release validation pending.

## RG-T18-SECURITY
Parent 6154bd8a98af8cfe53e4c5b1e42898ca990c577b. Bounded grant authority and fail-closed time checks; integrated security validation pending.

## RG-T18-MODEL-PROBE
Parent 9549dc5fbf3b23b819e9599c62ea00b6359bf3d0. Local model inventory preflight; live model activation pending.

## RG-T18-GALAXY
Parent 06f97446f918f97cf18152419d60da8e5501cb3d. Opt-in read-only knowledge galaxy metadata wiring; desktop validation pending.

## RG-T18-WEB-UAT
Parent 58fb452f8c706747e4adc98d463895c073f83a9b. Isolated UAT source; deployment status tracked separately.

## RG-T19-RELEASE-GATE
Parent f563106eb37208067607c10ad73934b0055f355f. V1 blocked pending independent gate evidence.

## RG-T19-WINDOWS-PREFLIGHT
Parent d81794e8c3ccf033520a8bad5ad0dd0860314e95. Windows development preflight added; installer pending.

## RG-T19-DESKTOP-STAGE
Parent c4a5557961ee78d874bc9e047e729ec5ccf1ee06. Source staging only; installer and Windows validation pending.

## RG-T19-INFERENCE-SMOKE
Parent 5adac80ce2510c6d8efed1f843fbd2a06f3efa74. Local challenge diagnostic; actual inference pending.

## RG-T19-CREATIVE-INTEGRATION
Parent 634c8bd26a8354900aa13aa7463f69838a46c097. Bounded procedural creative adapter; integrated runtime verification pending.

## RG-T19-RESTORE
Parent 30c8cfd76ce3f6439db899cd74ce2561ef08d610. Authenticated text restore to new directory; full reconstruction pending.

## RG-T19-OPERATOR-GUIDES
Parent 17519ae7693498b3bce4540bffe9db10dead718b. Draft Indonesian install/operator guides; independent acceptance pending.

## RG-T19-STREAM-BUDGET
Parent cbc07fe9375b28cdcbe0db7b6e09a5ef464ba36b. Local response resource budgets; final security acceptance pending.

## RG-T19-APPROVAL
Parent 690ec7c448766067970cc6ddeb761fb20f05e990. Monotonic approval boundary; integrated security acceptance pending.

## RG-T19-PROPOSAL-BOUNDARY
Parent 0bc72fe243cb0673978351d8251cc9081cb905a4. Strict proposal parsing and tool allowlist; independent security acceptance pending.

## RG-T19-ENCRYPTED-MEMORY
Parent 4fb3dae4b2dd14d204ac23deb48a3b528cfeddf3. Experimental separate encrypted store; key verification and integration pending.

## RG-T19-AGENT-STOP
Parent 13fd93469c12000e19e5dd0203cdcbbd18844352. Shared CORE stop propagation; integrated security acceptance pending.

## RG-T19-CENTRAL-STOP
Parent 94a63902ea24af90825dc2b4a61c7b8f58f07ffa. Failure-isolated STOP coordinator; integration acceptance pending.

## RG-T19-DEPENDENCY-GATE
Parent 235a088419e9a70a071d99e82058b34b1d2384c2. Conservative dependency metadata review; missing lock and release evidence remain blocking.

## RG-T19-SECURITY-ACCEPTANCE
Parent f5d4c085317f0f859c3b085e9a19433b93167e80. Security acceptance metadata assessment; release remains blocked.

## RG-T19-CANDIDATE
Parent f1fcc09826def92fa92523d13306c7896705f614. Combined release/security preflight; promotion blocked.

## RG-T19-V1-HOLD
Assessed 91fb0b8a887554d7b2a64726448df055ab48768e. Candidate evaluator returned BLOCKED with 18 requirements outstanding. npm registry DNS failure; no V1 published.

## RG-T19-LOCK-RESOLUTION
Parent 5b5756f8384f5eedf17f8eab35919934b0b6e8ab. Local registry DNS failure; read-only candidate lock resolution workflow prepared, no lock adopted.

Static review: seven YAML configuration assertions passed; matching workflow blob. Actual runner/lock/audit unverified. No release promotion.

## RG-T19-PARTIAL-REGRESSION
Assessed 92052b0369654a63842b2bcbc1a2ee189c16c6c4. 28 exact Git blobs, 12 test files, 59 passed, 0 failed/skipped, Node 22.16 Linux. Full checkout/Node 24/Windows pending; no release.

## RG-T19-WINDOWS-PORTABLE
Manual review-only portable build workflow; seven static checks passed, Windows runtime and actual artifact pending.
