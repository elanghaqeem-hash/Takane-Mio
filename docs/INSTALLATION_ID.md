# Takane MIO — Panduan instalasi pengembangan
Versi 0.0.39-dev. Bukan installer atau rilis V1. Panduan ini berdasarkan source, belum diuji end-to-end pada Windows.

## Persiapan
Windows x64, Git, Node.js 24, ruang penyimpanan memadai, dan izin akses repository privat. Simpan data lama terpisah. Jangan jalankan skrip menggunakan Administrator. Ollama atau llama.cpp diinstal sendiri dari sumber resmi; pilih model sesuai RAM/VRAM, lisensi dan kebutuhan. Tidak ada unduhan model otomatis.

## Checkout dan pemeriksaan
Di PowerShell, dari direktori kerja baru:
```powershell
git clone --branch regenesis/t0-foundation https://github.com/elanghaqeem-hash/Takane-Mio.git
cd Takane-Mio
git rev-parse HEAD
node --version
npm run diagnostics
npm run check
npm run verify:suite
```
Jika salah satu gagal, periksa hasil dan hentikan proses rilis. Node 24 diperlukan oleh gate; hasil terdahulu Node 22 bukan sertifikasi. Jangan melewati kegagalan.

## Dependensi desktop
Tinjau package.json, pastikan versi Electron yang dipatok tersedia dan sah melalui registry tepercaya, lalu selesaikan lockfile yang direview. Lockfile belum terverifikasi; jangan mengklaim build reproducible. Setelah package-lock.json tersedia dan sesuai, jalankan npm ci, lalu npm run windows:preflight. Kegagalan preflight bukan alasan untuk menurunkan kontrol. Periksa kompatibilitas Electron/node:sqlite.

## Model lokal
Pastikan server tepercaya berjalan hanya pada loopback. Ganti MODEL_ID dengan nama persis model lokal yang sudah tersedia.
```powershell
npm run model:probe -- ollama MODEL_ID
npm run model:smoke -- ollama MODEL_ID --confirm-local-inference
npm run chat:local -- ollama MODEL_ID "Sebutkan dua warna."
```
Untuk llama.cpp ganti ollama dengan llamacpp. CHALLENGE_MATCH hanya menunjukkan echo token, bukan identitas server, kecerdasan atau isolasi offline. Tidak ada fallback cloud.

## Menjalankan desktop
```powershell
$env:MIO_LOCAL_PROVIDER = "ollama"
$env:MIO_LOCAL_MODEL = "MODEL_ID"
npm start
```
Untuk menampilkan metadata database yang sudah ada, opt-in dengan $env:MIO_KNOWLEDGE_GALAXY = "1" sebelum start. Jangan mengaktifkan jika database ~/.mio/memory.sqlite berasal dari versi lama yang belum ditinjau. Database plaintext; tidak ada migrasi otomatis. Saat selesai, tutup aplikasi dan hapus env yang dibuat dengan Remove-Item Env:MIO_LOCAL_PROVIDER, Env:MIO_LOCAL_MODEL -ErrorAction SilentlyContinue; hapus MIO_KNOWLEDGE_GALAXY jika disetel.

## Distribusi
npm run stage:desktop -- ../takane-mio-stage menghasilkan source-only di direktori baru, bukan EXE. Tinjau docs/DESKTOP_SOURCE_STAGING.md. Installer, code signing, clean Windows smoke, full regression dan recovery drill belum terverifikasi.
