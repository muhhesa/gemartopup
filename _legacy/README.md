# FlashTop — Website Reseller Digital

Platform top up game otomatis dengan fitur lengkap:
- Integrasi Payment Gateway Tripay (QRIS, VA, E-Wallet)
- Integrasi Indoflazz API untuk source produk & harga dinamis
- Panel Admin Modern (Dashboard, Produk, Pesanan, Pengaturan)
- Notifikasi WhatsApp otomatis via Fonnte API
- Sistem Database MySQL untuk keandalan transaksi

## Kebutuhan Sistem
1. PHP 7.4 atau versi lebih baru
2. MySQL / MariaDB Database
3. Ekstensi PHP: `pdo_mysql`, `curl`, `json`
4. Web Server (Apache/Nginx)

## Cara Instalasi

1. **Upload File**
   Upload seluruh file ke dalam direktori root server web Anda (contoh: `/public_html` atau `/var/www/html/flashtop`).

2. **Buat Database**
   - Buat sebuah database baru di MySQL/MariaDB (misalnya: `flashtop_db`).
   - Import file `db.sql` ke dalam database tersebut. Anda bisa menggunakan phpMyAdmin, atau via command line:
     ```bash
     mysql -u username -p flashtop_db < db.sql
     ```

3. **Konfigurasi `config.php`**
   Buka file `config.php` dan sesuaikan kredensial berikut:
   - **Database**: Isi `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`.
   - **Admin**: Ubah `ADMIN_USER` dan `ADMIN_PASS` untuk login ke panel admin. Default: `admin` / `password123`.
   - **Tripay**: Isi `TRIPAY_API_KEY`, `TRIPAY_PRIVATE_KEY`, `TRIPAY_MERCHANT_CODE`. Ubah `TRIPAY_MODE` menjadi `'production'` jika sudah siap go-live.
   - **Indoflazz**: Isi `INDOFLAZZ_API_KEY` dan nama toko Anda.
   - **Fonnte (WhatsApp)**: Isi `FONNTE_TOKEN`.
   - **Margin Keuntungan**: Sesuaikan `DEFAULT_MARGIN_PCT` (default: 5% menyesuaikan inflasi 3% + profit margin 2%).

4. **Konfigurasi Tripay Callback (Webhook)**
   Masuk ke dashboard merchant Tripay Anda:
   - Pergi ke menu Merchant -> Callback URL
   - Set URL callback Anda mengarah ke endpoint API dengan aksi `tripay_callback`. Contoh:
     `https://domain-anda.com/api.php?action=tripay_callback`
   - Pastikan Private Key di Tripay dan di `config.php` sama agar validasi signature berhasil.

## Struktur File
- `index.html` - Tampilan pelanggan (Frontend)
- `admin.html` - Tampilan admin panel
- `api.php` - Backend Router untuk semua request & API pihak ketiga
- `config.php` - File konfigurasi kredensial (Jangan dibagikan!)
- `db.sql` - Skema database

## Penggunaan

1. Buka `https://domain-anda.com/admin.html` untuk login sebagai admin.
2. Di Dashboard admin, navigasi ke menu **Produk** lalu klik **"Tarik Data Indoflazz"** untuk mengisi katalog database dengan harga + margin otomatis.
3. Anda dapat mengaktifkan atau menonaktifkan game tertentu di halaman Produk.
4. Buka `https://domain-anda.com/index.html` untuk mencoba melakukan transaksi. Anda juga dapat menggunakan tombol **"Live Mode"** di Pengaturan Frontend.
