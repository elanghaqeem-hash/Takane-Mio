# Recovery checkpoint RG-T0-BASE
Initial source reference: 1c3901de6fa32e7a9099190e7e0e136d6f10f46d (main at audit).
Work on regenesis/t0-foundation; do not rewrite main. Restore via a new branch from verified commit, run npm run check and npm test, then review diff. No user data, model files or database verified; no physical backup/restore drill performed. Never copy secrets into Git. Future encrypted external backups must include data, model manifest, migrations, checksums and restore tests.
