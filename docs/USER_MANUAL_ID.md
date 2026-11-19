# Takane MIO — Panduan pengguna dan operator
Versi 0.0.39-dev. Fitur awal; panduan berdasarkan source, bukan hasil UAT Windows independen.

## Desktop
CORE memperlihatkan state assistant. Knowledge Galaxy menampilkan metadata record berizin jika diaktifkan dan database kompatibel. Bintang bukan bobot LLM; tampilan dibatasi profil perangkat. Jika tidak tersedia, jangan menganggap database kosong. Chat membutuhkan provider dan model yang dikonfigurasi. Tidak ada streaming UI atau persistent retrieval otomatis. STOP melatch runtime desktop saat ini; tidak menghentikan Worker cloud atau semua proses OS; restart membuat sesi baru. Jika STOP gagal, hentikan penggunaan dan tutup aplikasi melalui OS.

## Percakapan lokal
Gunakan npm run chat:local -- ollama MODEL_ID "Halo" setelah model terverifikasi secara lokal. Input dan jawaban adalah data pengguna; jangan masukkan rahasia melalui command line atau shell history. Hasil AI dapat salah.

## Penyimpanan pengetahuan
Gunakan contoh data sintetis saja:
```powershell
npm run memory:local -- remember --consent semantic demo "Contoh pengetahuan"
npm run memory:local -- search "Contoh"
npm run memory:local -- galaxy
```
Perintah forget ID menghapus record dari database lokal, bukan dari seluruh backup atau riwayat shell. Gunakan hanya ID yang dipilih setelah review. Database ~/.mio/memory.sqlite masih plaintext. Jangan gunakan database lama tanpa review dan backup. CLI membuka atau membuat database; tidak otomatis terhubung ke konteks LLM.

## Agent dan creative
npm run agent:local -- "contoh teks" menjalankan dua fungsi L0 (panjang karakter, jumlah kata). Bukan agent otonom desktop atau akses file. Creative mesh, animation, audio, music dan visual adalah modul developer; belum tersedia sebagai studio lengkap dalam UI.

## Web staging
- https://takane-mio.elang-haqeem.workers.dev/ — laboratory OpenRouter BYOK. Key dimasukkan pengguna sendiri dan prompt dikirim ke OpenRouter, dapat menimbulkan biaya. Jangan gunakan data sensitif. Reset membersihkan sesi tab; bukan jaminan penghapusan provider.
- https://takane-mio-uat.elang-haqeem.workers.dev/ — simulasi CORE/STOP browser. Tanpa model atau database lokal. Public HTTP/browser belum divalidasi. Tidak tersambung dengan desktop.

## Troubleshooting
Model tidak tersedia: periksa nama model dan server loopback, jalankan model:probe. Challenge gagal: periksa server, timeout, model; jangan bypass. Desktop gagal: periksa versi Node/Electron, lockfile, npm run windows:preflight. Galaxy unavailable: periksa opt-in, skema 1 dan lokasi database; jangan membuat data palsu. CI gagal: lihat output npm run verify:suite; jangan rilis. Jika terjadi insiden, STOP, tutup aplikasi dan jangan hapus bukti atau menimpa database.

## Recovery
Rujuk MIO_RECOVERY.md dan docs/RECOVERY_RESTORE.md. Checkpoint AES-GCM memerlukan kunci 32 byte dan commit yang cocok. Restore hanya ke direktori baru, tepercaya, bukan instalasi aktif. Berkas hasil plaintext; lindungi dengan izin filesystem. Receipt bukan bukti full recovery. Belum tersedia UI/CLI recovery produksi, pemulihan SQLite, external backup atau key custody.
