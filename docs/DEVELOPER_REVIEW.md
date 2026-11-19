# Additional developer review primitives
Read-only caller supplied source inventory, manifest dependency listing, full replacement proposal and hash consistency verification. No filesystem/repository writes or execution. Hashes do not establish authorization. Limits: 100 files, 256 KiB per file, 4 MiB total, 500 dependencies. Six local tests pass; existing inspection module retained.
