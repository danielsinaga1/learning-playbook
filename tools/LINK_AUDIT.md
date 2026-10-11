# Audit tautan — 9 Oktober 2026

Pemeriksaan menggunakan `npm run audit:links -- --external`:

- 14 kurikulum dan 911 modul, termasuk arsip sumber.
- 915 target internal unik, mencakup alias lama dan kasus renderer.
- 286 gambar yang dirujuk materi tersedia.
- 201 URL eksternal yang dihasilkan renderer; 5 merupakan alamat localhost/jaringan lokal dalam contoh.
- 191 referensi HTTP berhasil diakses, tanpa hasil 404 atau kegagalan jaringan setelah perbaikan.
- 5 alamat membatasi akses otomatis: Stack Overflow (403), LinkedIn (999), dua artikel Medium (403), dan halaman API keys OpenAI (403). Hasil ini tidak memastikan akses di browser pengguna.

Alamat yang berpindah diperbarui melalui `src/data/link-redirects.json` (169 redirect yang terverifikasi).
Perbaikan tambahan berada di `src/lib/links.ts`. Data materi hasil impor tidak diubah.

## Referensi lama yang diganti

| Referensi semula | Tujuan aktif |
| --- | --- |
| React: Components and Props pada facebook.github.io | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) |
| LangChain: get_started/introduction | [LangChain overview](https://docs.langchain.com/oss/python/langchain/overview) |
| Egyptian Fractions pada www.maths.surrey.ac.uk | [Halaman Ron Knott pada alamat baru](https://r-knott.surrey.ac.uk/Fractions/egyptian.html) |
| GeeksforGeeks: Maximize array sum, Set 2 | [Maximize Array Sum After k Negations](https://www.geeksforgeeks.org/dsa/maximize-array-sum-after-k-negations-using-sorting/) |
| Catatan MST Eppstein yang dihapus | [Catatan MST Princeton](https://www.cs.princeton.edu/courses/archive/spr07/cos226/lectures/mst.pdf), topik yang sama |
| PDF k-center Van Stee yang dihapus | [Greedy Approximate Algorithm for K Centers](https://www.geeksforgeeks.org/dsa/greedy-approximate-algorithm-for-k-centers-problem/), topik yang sama |
| PDF shortest superstring Lingas yang dihapus | [Catatan shortest superstring MIT](https://math.mit.edu/~goemans/18434S06/superstring-lele.pdf), topik yang sama |
| BinPacking.txt Subhash Suri yang dihapus | [Catatan Bin Packing UC Irvine](https://ics.uci.edu/~goodrich/teach/cs165/notes/BinPacking.pdf), topik yang sama |

URL dengan parameter contoh seperti `${id}` tetap ditampilkan sebagai teks. Contoh kode tetap literal.
Gambar materi dibuka di dialog pembesaran, termasuk gambar yang disematkan sebagai data URI dalam versi satu file.
