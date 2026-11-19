# Encrypted checkpoint foundation
AES-256-GCM, SHA-256 per text entry, up to five entries, 1 MiB each and 4 MiB serialized plaintext. Caller key and consent required. Six local tests passed. No actual database restore, filesystem writes, key custody or independent Git lookup. Existing recovery bundle retained.
