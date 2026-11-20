# T-20.02 — Native model readiness (operator runbook)

Baseline 01aeca3 passed Windows and Linux GitHub Actions run 44657688583. CI uses simulated inference; it does not establish local model readiness.

Install Ollama or llama.cpp from a trusted distributor independently. Obtain a trusted SHA-256 for the actual runtime artifact (not a checksum generated from an untrusted download). Start the intended local server bound to 127.0.0.1 only, load a model matching your hardware and license, and apply OS outbound restrictions if offline operation is required. For Ollama use port 11434, llama.cpp port 8080.

Run from the repository with Node 24:

    npm run model:readiness -- ollama MODEL "C:\\path\\to\\ollama.exe" TRUSTED_SHA256 --confirm-local-inference

Replace placeholders. For llama.cpp use llamacpp and its executable. Exit 1 = blocked or invalid; 2 = review required (digest and challenge matched); 130 = interrupted. No exit status constitutes release approval. No binary download, process launch or automatic model install is performed. Digest matching does not authenticate the listening process, attest model weights, or prove offline behavior. Verify those separately and test actual multi-turn inference before release. Do not place personal data in smoke prompts.
