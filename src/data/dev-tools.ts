import type { Curriculum, Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const GIT = 'Git';
const SHELL = 'Shell & Terminal';

const devToolsTracks: Track[] = [
  { title: GIT, summary: 'Working tree, index, branch, merge & rebase, kolaborasi lewat GitHub, pemulihan, dan fitur lanjutan seperti bisect, worktree, tag, dan hook.' },
  { title: SHELL, summary: 'Navigasi terminal, pipe & olah teks, scripting bash yang aman, proses & SSH, serta otomasi proyek dengan Makefile, cron, dan skrip rilis.' },
];

export const devToolsSource = 'Git & Shell: materi tulisan tangan dari Pro Git, dokumentasi git-scm.com, GNU Bash Manual, dan GitHub Docs (30 Oktober 2026)';

const modules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── Git ─────────────────────────────
  {
    id: 'git-konsep-dasar',
    title: 'Git: Konsep Dasar & Commit yang Baik',
    summary: 'Working tree, index, dan repository; init, clone, status, add, commit, log, diff; .gitignore; pesan commit; konfigurasi di Windows.',
    track: GIT, source: devToolsSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('Git adalah version control terdistribusi: setiap clone menyimpan seluruh riwayat proyek. Kunci memahaminya adalah **tiga area**: *working tree* (file yang kamu edit), *index* atau *staging area* (snapshot yang akan masuk ke commit berikutnya), dan *repository* di folder `.git` (riwayat commit permanen). Hampir semua perintah Git hanyalah memindahkan isi di antara ketiga area itu.'),
      code('Konfigurasi awal (sekali per mesin)', `git config --global user.name "Nama Kamu"
git config --global user.email "kamu@example.com"   # samakan dengan email akun GitHub
git config --global init.defaultBranch main
git config --global core.editor "code --wait"       # VS Code sebagai editor pesan commit

# Line ending: Windows memakai CRLF, Linux/macOS memakai LF
git config --global core.autocrlf true      # Windows: simpan LF di repo, CRLF di working tree
# git config --global core.autocrlf input   # macOS/Linux/WSL: ubah CRLF jadi LF saat commit saja

git config --global --list                  # periksa hasilnya`, 'bash'),
      code('Alur harian: init/clone, status, add, commit', `git init proyek-baru && cd proyek-baru     # atau: git clone https://github.com/org/repo.git
echo "# Proyek Baru" > README.md
git status                     # README.md: untracked
git add README.md              # masuk index (staging area)
git commit -m "docs: tambah README"

git add -p                     # pilih potongan perubahan satu per satu (prompt y/n di terminal)
git diff                       # working tree vs index: perubahan yang BELUM di-stage
git diff --staged              # index vs HEAD: yang AKAN masuk commit
git log --oneline --graph --decorate -n 10
git show HEAD                  # isi dan metadata commit terakhir`, 'bash'),
      table(['Area', 'Isinya', 'Perintah yang memindahkan'], [
        ['Working tree', 'File yang sedang kamu edit', '`git add` ke index; `git restore <file>` membuang perubahan'],
        ['Index (staging)', 'Snapshot untuk commit berikutnya', '`git commit` ke repository; `git restore --staged <file>` mengeluarkan dari index'],
        ['Repository (`.git`)', 'Commit, branch, tag', '`git switch` / `git restore --source=<commit>` menulis kembali ke working tree'],
      ]),
      code('.gitignore', `# dependensi & hasil build
node_modules/
dist/
target/
*.log

# rahasia: jangan pernah di-commit
.env
.env.*
!.env.example

# editor & OS
.idea/
.vscode/*
!.vscode/extensions.json
.DS_Store
Thumbs.db`, 'text'),
      callout('tip', '.gitignore tidak berlaku surut', '`.gitignore` hanya mengabaikan file yang **belum** di-track. Bila file sudah terlanjur di-commit, keluarkan dari index dengan `git rm --cached <file>` lalu commit. Cek alasan sebuah file diabaikan dengan `git check-ignore -v <file>`. Template per bahasa tersedia di [github/gitignore](https://github.com/github/gitignore).'),
      heading('Pesan commit yang baik'),
      paragraph('Commit yang baik bersifat **atomik** (satu perubahan logis) dan pesannya menjawab *apa* dan *mengapa*. Aturan praktis: subjek maksimal sekitar 50 karakter dalam bentuk perintah ("tambah", "perbaiki", bukan "menambahkan"), baris kosong, lalu body yang menjelaskan alasan. Awalan seperti `feat:` dan `fix:` mengikuti Conventional Commits yang dibahas di [Remote & Kolaborasi](#tools.git-remote-kolaborasi).'),
      code('Contoh pesan commit', `feat: tambah ekspor CSV laporan bulanan

Admin perlu mengunduh laporan untuk audit. Ekspor dibuat streaming
agar laporan besar tidak memenuhi memori server.

Refs: #142`, 'text'),
      ...quiz([
        ['GIT-01', 'Apa beda `git diff` dan `git diff --staged`?', '`git diff` membandingkan working tree dengan index, yaitu perubahan yang belum di-stage. `git diff --staged` membandingkan index dengan commit terakhir (HEAD), yaitu isi commit berikutnya bila kamu menjalankan `git commit` sekarang.'],
        ['GIT-02', 'File `.env` sudah ter-commit, lalu kamu menambahkan `.env` ke `.gitignore`. Mengapa Git masih melacak perubahannya?', 'Karena `.gitignore` hanya berlaku untuk file untracked. File yang sudah ada di index tetap dilacak. Jalankan `git rm --cached .env` lalu commit. Bila isinya rahasia dan sudah di-push, rahasia itu harus dirotasi (lihat modul pemulihan).'],
        ['GIT-03', 'Mengapa `core.autocrlf true` disarankan di Windows?', 'Editor Windows sering menulis CRLF. Dengan `true`, Git menyimpan LF di repository dan mengembalikan CRLF saat checkout, sehingga diff tidak penuh perubahan line ending saat bekerja bersama pengguna Linux/macOS. Untuk aturan yang berlaku bagi semua orang, tambahkan `.gitattributes` di repo.'],
      ]),
      ...practice('git-konsep-dasar', [
        'Atur `user.name`, `user.email`, `init.defaultBranch main`, `core.editor`, dan `core.autocrlf`, lalu verifikasi dengan `git config --global --list`.',
        'Buat repo baru, tulis `.gitignore` yang mengabaikan `.env` dan `node_modules/`, buktikan dengan `git status` dan `git check-ignore -v .env`.',
        'Ubah dua bagian berbeda di satu file, lalu pakai `git add -p` untuk membuat dua commit terpisah dengan pesan yang jelas.',
        'Jelaskan isi `git diff`, `git diff --staged`, dan `git log --oneline --graph` pada repo tersebut.',
      ]),
      references(
        ['Pro Git: First-Time Git Setup', 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup'],
        ['Pro Git: Recording Changes to the Repository', 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository'],
        ['Pro Git: Git Configuration (core.autocrlf)', 'https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration'],
        ['git-scm.com: gitignore', 'https://git-scm.com/docs/gitignore'],
      ),
    ],
  },
  {
    id: 'git-branch-merge-rebase',
    title: 'Git: Branch, Merge & Rebase',
    summary: 'Branch dan switch, fast-forward vs 3-way merge, menyelesaikan konflik, rebase vs merge, interactive rebase, squash/fixup, dan aturan emas rebase.',
    track: GIT, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Branch di Git hanyalah **penunjuk ringan** ke sebuah commit, dan `HEAD` menunjuk branch yang sedang aktif. Membuat branch nyaris tanpa biaya, jadi biasakan satu branch per fitur atau perbaikan. Untuk menggabungkan kembali ada dua cara: **merge** (menyatukan riwayat) dan **rebase** (memindahkan commit ke atas basis baru).'),
      code('Branch dan switch', `git switch -c feat/ekspor-csv        # buat branch baru dan pindah ke sana
git branch                           # daftar branch lokal (* = aktif)
git branch -a                        # termasuk remote-tracking (origin/...)
git switch main                      # kembali ke main
git switch -                         # kembali ke branch sebelumnya
git branch -m feat/ekspor feat/ekspor-csv   # ganti nama branch
git branch -d feat/ekspor-csv        # hapus; ditolak bila belum di-merge (-D untuk paksa)`, 'bash'),
      code('Fast-forward vs 3-way merge', `# Kasus 1: main tidak bergerak sejak branch dibuat -> fast-forward (main cukup digeser)
git switch main
git merge feat/ekspor-csv
git merge --no-ff feat/ekspor-csv    # paksa merge commit agar jejak fitur tetap terlihat

# Kasus 2: main dan fitur sama-sama punya commit baru -> 3-way merge
#   A---B---C          main
#        \\
#         D---E        feat/ekspor-csv
# Git memakai B (merge base), C, dan E untuk membuat merge commit baru M
git merge feat/ekspor-csv
git log --oneline --graph --all`, 'bash'),
      code('Menyelesaikan konflik', `git merge feat/diskon
# CONFLICT (content): Merge conflict in src/harga.ts
git status                           # file konflik ditandai "both modified"

# Isi src/harga.ts sekarang berisi penanda:
# <<<<<<< HEAD
# const DISKON = 0.1;
# =======
# const DISKON = 0.15;
# >>>>>>> feat/diskon
# Edit manual: pilih atau gabungkan isinya, hapus SEMUA penanda, jalankan test, lalu:
git add src/harga.ts
git commit --no-edit                 # selesaikan merge dengan pesan bawaan

git merge --abort                    # atau batalkan dan kembali ke kondisi sebelum merge`, 'bash'),
      table(['Aspek', 'merge', 'rebase'], [
        ['Bentuk riwayat', 'Apa adanya, ada merge commit', 'Linear; commit ditulis ulang dengan hash baru'],
        ['Aman untuk branch bersama', 'Ya', 'Tidak; hanya untuk commit yang belum dipakai orang lain'],
        ['Konflik', 'Diselesaikan sekali di merge commit', 'Bisa muncul per commit yang dipindahkan'],
        ['Cocok untuk', 'Menggabungkan fitur ke `main`, branch bersama', 'Memperbarui branch fitur lokal dengan `main`, merapikan commit sebelum PR'],
        ['Membatalkan', '`git merge --abort`, atau `git revert -m 1 <merge>` setelah push', '`git rebase --abort`, atau `git reflog` setelah selesai'],
      ]),
      code('Rebase dan interactive rebase', `git switch feat/ekspor-csv
git fetch origin
git rebase origin/main               # pindahkan commit fitur ke ujung main terbaru
# bila konflik: perbaiki file, lalu
git add src/ekspor.ts
git rebase --continue                # atau: git rebase --skip / git rebase --abort

# Merapikan 3 commit terakhir sebelum membuka PR (MEMBUKA EDITOR teks dari core.editor)
git rebase -i HEAD~3
#   pick   a1b2c3d feat: ekspor CSV dasar
#   fixup  d4e5f6a perbaiki typo        <- gabung, buang pesannya
#   squash 9f8e7d6 tambah header kolom  <- gabung, pesan ikut digabung
#   (perintah lain: reword, edit, drop; ubah urutan baris = ubah urutan commit)

# Alur tanpa mengedit daftar: tandai commit perbaikan, lalu autosquash
git commit --fixup a1b2c3d
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash origin/main   # ":" menerima daftar apa adanya`, 'bash'),
      callout('info', 'squash vs fixup', 'Keduanya melebur commit ke commit di atasnya dalam daftar. `squash` membuka editor untuk menggabungkan pesan; `fixup` membuang pesan commit tersebut. `git rebase -i` selalu membuka editor (VS Code bila `core.editor` diatur `code --wait`); simpan dan tutup tab untuk melanjutkan.'),
      callout('warn', 'Aturan emas: jangan rebase riwayat bersama', 'Rebase membuat commit baru dengan hash berbeda. Jangan rebase commit yang sudah di-push ke branch yang dipakai orang lain (misalnya `main`), karena riwayat mereka akan bercabang dan commit bisa terduplikasi. Rebase aman untuk branch fitur milikmu sendiri; setelah itu push dengan `git push --force-with-lease`, bukan `--force` (lihat [Remote & Kolaborasi](#tools.git-remote-kolaborasi)).'),
      ...quiz([
        ['GIT-04', 'Kapan `git merge` menghasilkan fast-forward dan kapan membuat merge commit?', 'Fast-forward terjadi bila branch tujuan (misalnya main) adalah leluhur langsung dari branch fitur, sehingga Git cukup menggeser penunjuknya. Bila kedua branch sudah punya commit masing-masing sejak titik cabang, Git melakukan 3-way merge (merge base + dua ujung) dan membuat merge commit. `--no-ff` memaksa merge commit walau fast-forward mungkin.'],
        ['GIT-05', 'Mengapa rebase pada `main` yang sudah di-push berbahaya?', 'Rebase menulis ulang commit dengan hash baru. Rekan yang sudah menarik commit lama masih memegang versi lama; saat mereka pull, Git melihat dua riwayat berbeda sehingga terjadi duplikasi commit dan konflik. Untuk membatalkan perubahan di branch bersama, gunakan `git revert`.'],
        ['GIT-06', 'Apa beda `squash` dan `fixup` di interactive rebase?', 'Keduanya menggabungkan commit ke commit sebelumnya. `squash` menggabungkan pesannya dan membuka editor untuk menyunting pesan akhir; `fixup` membuang pesan commit itu dan hanya menyimpan perubahan kodenya.'],
      ]),
      ...practice('git-branch-merge-rebase', [
        'Buat skenario fast-forward dan 3-way merge di repo latihan, lalu bandingkan hasil `git log --oneline --graph --all`.',
        'Sengaja buat konflik di baris yang sama dari dua branch, selesaikan secara manual, dan pastikan tidak ada penanda `<<<<<<<` tersisa (`git diff --check`).',
        'Buat 4 commit kecil di branch fitur lalu rapikan menjadi 2 commit dengan `git rebase -i`, memakai `fixup` dan `reword`.',
        'Perbarui branch fitur dengan `git rebase origin/main` dan jelaskan mengapa hash commit fitur berubah.',
      ]),
      references(
        ['Pro Git: Basic Branching and Merging', 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging'],
        ['Pro Git: Rebasing', 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing'],
        ['Pro Git: Rewriting History', 'https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History'],
        ['git-scm.com: git-switch', 'https://git-scm.com/docs/git-switch'],
        ['git-scm.com: git-rebase', 'https://git-scm.com/docs/git-rebase'],
      ),
    ],
  },
  {
    id: 'git-remote-kolaborasi',
    title: 'Git: Remote, GitHub & Kolaborasi',
    summary: 'Remote, fetch/pull/push, tracking branch, GitHub flow, pull request & etika code review, fork, gh CLI, Conventional Commits, dan protected branch.',
    track: GIT, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('*Remote* adalah salinan repository di server, biasanya bernama `origin`. Branch seperti `origin/main` adalah **remote-tracking branch**: catatan lokal tentang posisi terakhir branch di server. `git fetch` memperbarui catatan itu tanpa menyentuh branch-mu; `git pull` = fetch + merge (atau rebase) ke branch aktif.'),
      code('Remote, fetch, pull, push', `git remote -v                                 # daftar remote
git remote add origin git@github.com:kamu/proyek.git
git push -u origin main                       # push pertama + set upstream (tracking)

git fetch origin                              # unduh commit baru, branch lokal tidak berubah
git log --oneline main..origin/main           # commit di server yang belum ada di lokal
git pull                                      # fetch + merge upstream ke branch aktif
git pull --rebase                             # fetch + rebase commit lokal di atas upstream
git config --global pull.rebase true          # jadikan rebase default untuk pull

git branch -vv                                # upstream & status ahead/behind tiap branch
git push origin --delete feat/lama            # hapus branch di remote
git fetch --prune                             # bersihkan origin/* yang sudah dihapus di server`, 'bash'),
      heading('GitHub flow'),
      { type: 'list', ordered: true, items: [
        'Buat branch dari `main` yang terbaru dengan nama deskriptif, misalnya `feat/ekspor-csv`.',
        'Commit kecil dan sering; push ke remote agar ada cadangan dan CI berjalan.',
        'Buka **pull request** (draft bila belum siap) berisi apa yang berubah, mengapa, dan cara mengujinya.',
        'Diskusi, review, dan CI hijau; perbaiki dengan commit tambahan.',
        'Merge (merge commit, squash, atau rebase sesuai aturan tim), hapus branch, lalu deploy.',
      ] },
      code('gh CLI: PR tanpa meninggalkan terminal', `gh auth login                                  # login sekali (pilih HTTPS atau SSH)
gh repo clone org/proyek
git switch -c feat/ekspor-csv
# ... commit ...
git push -u origin feat/ekspor-csv
gh pr create --fill --draft                    # judul & isi dari commit, status draft
gh pr ready                                    # tandai siap direview
gh pr checks                                   # status CI
gh pr view --web                               # buka di browser

gh pr checkout 123                             # ambil PR rekan untuk diuji lokal
gh pr review 123 --approve --body "LGTM, kasus CSV kosong sudah tertangani"
gh pr merge 123 --squash --delete-branch`, 'bash'),
      code('Bekerja dengan fork', `gh repo fork org/proyek --clone      # fork + clone; remote "upstream" otomatis ditambahkan
cd proyek
git remote -v                        # origin = fork milikmu, upstream = repo asli

# Sinkronkan main fork dengan repo asli
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main`, 'bash'),
      table(['Conventional Commit', 'Kapan dipakai', 'Efek pada versi (SemVer)'], [
        ['`feat: ...`', 'Fitur baru untuk pengguna', 'MINOR (1.4.0 ke 1.5.0)'],
        ['`fix: ...`', 'Perbaikan bug', 'PATCH (1.4.0 ke 1.4.1)'],
        ['`feat!: ...` atau footer `BREAKING CHANGE:`', 'Perubahan yang merusak kompatibilitas', 'MAJOR (1.4.0 ke 2.0.0)'],
        ['`docs`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`', 'Perubahan non-fitur; scope opsional: `fix(auth): ...`', 'Tidak menaikkan versi (kecuali dikonfigurasi)'],
      ]),
      callout('tip', 'Etika pull request & code review', 'Penulis: buat PR kecil dan fokus (idealnya di bawah sekitar 400 baris), isi deskripsi dengan konteks, cara uji, dan screenshot untuk UI; review diff sendiri dulu; tanggapi setiap komentar. Reviewer: komentari kode, bukan orangnya; bedakan yang wajib (*blocking*) dan saran kecil (*nit*); ajukan pertanyaan daripada perintah; beri approval bila sudah cukup baik, bukan sempurna.'),
      callout('warn', 'Force push dan protected branch', '`git push --force` menimpa riwayat remote dan bisa menghapus commit rekan. Untuk branch milikmu setelah rebase, pakai `git push --force-with-lease`: push ditolak bila remote berisi commit yang belum kamu fetch. Lindungi `main` lewat *Settings > Rules* (ruleset) atau *Branch protection*: wajib PR, wajib review, wajib status check CI lulus, dan blokir force push.'),
      ...quiz([
        ['GIT-07', 'Apa beda `git fetch` dan `git pull`?', '`git fetch` hanya mengunduh commit dan memperbarui remote-tracking branch seperti `origin/main`; branch lokal dan working tree tidak berubah, sehingga aman untuk melihat dulu (`git log main..origin/main`). `git pull` menjalankan fetch lalu langsung merge atau rebase ke branch aktif.'],
        ['GIT-08', 'Mengapa `--force-with-lease` lebih aman daripada `--force`?', '`--force` menimpa branch remote tanpa syarat. `--force-with-lease` hanya menimpa bila branch remote masih berada di posisi yang terakhir kamu ketahui; bila rekan sudah push commit baru, push ditolak sehingga commit mereka tidak hilang.'],
        ['GIT-09', 'Commit `feat(api)!: hapus endpoint v1` masuk ke rilis 1.7.3. Versi berikutnya?', '2.0.0. Tanda `!` menandakan breaking change, sehingga versi MAJOR naik dan MINOR serta PATCH kembali ke nol.'],
      ]),
      ...practice('git-remote-kolaborasi', [
        'Buat repo di GitHub, hubungkan dengan `git remote add`, dan push `main` dengan upstream (`-u`).',
        'Jalankan satu siklus GitHub flow lengkap dengan `gh`: branch, push, `gh pr create --draft`, `gh pr ready`, merge squash, hapus branch.',
        'Fork sebuah repo open source, tambahkan remote `upstream`, dan sinkronkan `main` fork dengan `--ff-only`.',
        'Aktifkan aturan proteksi `main` (wajib PR + status check + blokir force push) dan buktikan `git push origin main` langsung ditolak.',
      ]),
      references(
        ['Pro Git: Working with Remotes', 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes'],
        ['Pro Git: Remote Branches', 'https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches'],
        ['GitHub Docs: GitHub flow', 'https://docs.github.com/en/get-started/using-github/github-flow'],
        ['GitHub Docs: About pull requests', 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests'],
        ['GitHub Docs: About protected branches', 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches'],
        ['GitHub CLI manual', 'https://cli.github.com/manual/'],
        ['Conventional Commits 1.0.0', 'https://www.conventionalcommits.org/en/v1.0.0/'],
      ),
    ],
  },
  {
    id: 'git-undo-recovery',
    title: 'Git: Membatalkan Perubahan & Pemulihan',
    summary: 'restore, reset soft/mixed/hard, revert, amend, reflog untuk commit yang hilang, stash, cherry-pick, dan menangani rahasia yang ter-commit.',
    track: GIT, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Hampir semua kesalahan di Git bisa dipulihkan **selama perubahannya pernah di-commit**. Yang benar-benar hilang hanyalah perubahan di working tree yang belum pernah di-stage atau di-commit. Pertanyaan pertama sebelum memilih alat: *apakah commit ini sudah di-push dan dipakai orang lain?* Bila ya, gunakan `revert`; bila belum, `reset` dan `amend` aman.'),
      table(['Situasi', 'Perintah', 'Aman setelah push?'], [
        ['Buang perubahan file yang belum di-stage', '`git restore <file>`', 'Tidak relevan (lokal); perubahan hilang permanen'],
        ['Keluarkan file dari staging', '`git restore --staged <file>`', 'Ya'],
        ['Perbaiki pesan/isi commit terakhir', '`git commit --amend`', 'Tidak (menulis ulang commit)'],
        ['Batalkan commit, perubahan tetap di index', '`git reset --soft HEAD~1`', 'Tidak'],
        ['Batalkan commit, perubahan kembali ke working tree', '`git reset HEAD~1` (mixed)', 'Tidak'],
        ['Buang commit beserta perubahannya', '`git reset --hard HEAD~1`', 'Tidak'],
        ['Batalkan commit yang sudah publik', '`git revert <hash>`', 'Ya (commit baru)'],
        ['Salin satu commit ke branch lain', '`git cherry-pick <hash>`', 'Ya'],
        ['Simpan pekerjaan sementara', '`git stash push -u`', 'Tidak relevan (lokal)'],
      ]),
      code('restore, reset, amend, revert', `git restore src/app.ts                   # buang perubahan working tree (TIDAK bisa di-undo)
git restore --staged src/app.ts          # un-stage; isi file tetap
git restore --source=HEAD~2 src/app.ts   # ambil versi file dari 2 commit lalu

git reset --soft HEAD~1     # HEAD mundur 1; perubahan tetap di index, siap commit ulang
git reset --mixed HEAD~1    # (default) perubahan kembali ke working tree, tidak di-stage
git reset --hard HEAD~1     # HEAD, index, working tree mundur; perubahan yang tidak di-commit hilang

git commit --amend -m "fix: validasi email kosong"      # ganti pesan commit terakhir
git add lupa.ts && git commit --amend --no-edit         # masukkan file yang terlupa

git revert a1b2c3d          # commit baru yang membalik a1b2c3d; aman untuk riwayat bersama
git revert --no-edit HEAD`, 'bash'),
      callout('warn', 'Perintah destruktif', '`git reset --hard`, `git restore <file>`, `git checkout -- <file>`, dan `git clean -fd` membuang perubahan yang **belum di-commit**, dan perubahan itu tidak tercatat di reflog. Jalankan `git status` dan `git diff` dulu, atau amankan dengan `git stash push -u`. Untuk `git clean`, selalu coba `git clean -nd` (dry run) terlebih dahulu.'),
      code('reflog: menemukan commit yang hilang', `git reset --hard HEAD~3          # ups, tiga commit "hilang"
git reflog                       # catatan setiap pergerakan HEAD (lokal, default ~90 hari)
# e4f5a6b HEAD@{0}: reset: moving to HEAD~3
# 9c8d7e6 HEAD@{1}: commit: feat: laporan PDF
git reset --hard 9c8d7e6         # kembalikan branch ke posisi sebelum reset
git branch penyelamat HEAD@{1}   # atau buat branch penyelamat tanpa mengubah branch aktif

# Branch terhapus atau rebase gagal? Cari hash ujungnya di reflog, lalu:
git switch -c feat/lama 9c8d7e6
git reflog show feat/ekspor-csv  # reflog per branch juga tersedia`, 'bash'),
      code('stash dan cherry-pick', `git stash push -u -m "wip: form login"   # -u ikut menyimpan file untracked
git stash list
git switch hotfix/ongkir                 # kerjakan hal mendesak dulu
git switch -
git stash pop                            # terapkan & hapus dari daftar (apply = tanpa hapus)

git switch release/1.4
git cherry-pick 3f2e1d0                  # salin satu commit perbaikan dari main
git cherry-pick -x 3f2e1d0               # -x menambah catatan "cherry picked from commit ..."`, 'bash'),
      heading('Rahasia yang terlanjur di-commit'),
      callout('warn', 'Rotasi rahasianya dulu', 'Begitu API key, password, atau token di-push ke remote, **anggap sudah bocor**: bot memindai GitHub publik dalam hitungan menit, dan siapa pun yang sudah clone tetap memegang riwayat lama. Langkah pertama selalu mencabut dan membuat ulang rahasia di penyedianya (AWS, Stripe, database). Membersihkan riwayat hanya mencegah kebocoran lebih lanjut. Aktifkan *secret scanning* dan *push protection* GitHub agar kejadian ini dicegat sebelum push.'),
      code('Membersihkan riwayat', `# 1. Rotasi rahasia di penyedia - WAJIB dan PALING AWAL

# 2. Bila .env baru masuk di commit terakhir dan BELUM di-push:
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit --amend --no-edit

# 3. Bila SUDAH di-push: tulis ulang seluruh riwayat dengan git-filter-repo
#    (pip install git-filter-repo; jalankan di clone baru)
git clone git@github.com:kamu/proyek.git proyek-bersih && cd proyek-bersih
git filter-repo --invert-paths --path .env
git remote add origin git@github.com:kamu/proyek.git   # filter-repo menghapus origin sebagai pengaman
git push --force --all && git push --force --tags      # koordinasikan dengan tim: semua harus clone ulang`, 'bash'),
      ...quiz([
        ['GIT-10', 'Commit yang salah sudah di-push ke `main` bersama. Pakai `reset` atau `revert`?', '`git revert <hash>`. Revert membuat commit baru yang membalik perubahan tanpa menulis ulang riwayat, sehingga rekan bisa pull seperti biasa. `reset` lalu force push akan menghapus commit dari riwayat yang sudah dipakai orang lain.'],
        ['GIT-11', 'Setelah `git reset --hard HEAD~3`, bagaimana memulihkan tiga commit tadi?', 'Jalankan `git reflog`, cari entri sebelum reset (misalnya `HEAD@{1}`), lalu `git reset --hard <hash>` atau `git branch penyelamat <hash>`. Commit masih ada di database objek sampai dibersihkan garbage collection, biasanya setelah 90 hari untuk entri reflog yang masih terjangkau.'],
        ['GIT-12', 'Mengapa menghapus file `.env` dari riwayat Git saja tidak cukup?', 'Karena rahasia itu mungkin sudah dibaca bot, tersimpan di clone, fork, atau cache rekan. Penghapusan riwayat tidak menarik kembali salinan tersebut. Rahasia harus dirotasi agar nilai yang bocor tidak berlaku lagi.'],
      ]),
      ...practice('git-undo-recovery', [
        'Praktikkan `reset --soft`, `--mixed`, dan `--hard` pada repo latihan, dan catat isi `git status` setelah masing-masing.',
        'Hapus sebuah branch dengan `git branch -D`, lalu pulihkan dari `git reflog`.',
        'Gunakan `git stash push -u` untuk berpindah ke hotfix, lalu kembalikan pekerjaan dengan `git stash pop`.',
        'Simulasikan rahasia ter-commit di repo latihan dan hapus dari seluruh riwayat dengan `git filter-repo`; tulis urutan langkah insiden (rotasi dulu).',
      ]),
      references(
        ['Pro Git: Undoing Things', 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things'],
        ['Pro Git: Reset Demystified', 'https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified'],
        ['git-scm.com: git-reflog', 'https://git-scm.com/docs/git-reflog'],
        ['git-scm.com: git-stash', 'https://git-scm.com/docs/git-stash'],
        ['GitHub Docs: Removing sensitive data from a repository', 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository'],
      ),
    ],
  },
  {
    id: 'git-lanjutan',
    title: 'Git Lanjutan: Bisect, Worktree, Tag & Hook',
    summary: 'Mencari commit penyebab bug dengan bisect, blame dan log -S, worktree, tag & SemVer, hook pre-commit, .gitattributes, repo besar, dan signing commit.',
    track: GIT, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Setelah alur harian lancar, beberapa fitur Git menghemat waktu berjam-jam: `bisect` menemukan commit penyebab regresi dengan pencarian biner, `log -S` dan `blame` menjawab *kapan dan mengapa* sebuah baris berubah, `worktree` memungkinkan dua branch terbuka sekaligus, dan hook menjalankan pemeriksaan otomatis sebelum commit.'),
      code('git bisect: pencarian biner commit bermasalah', `git bisect start
git bisect bad                   # commit sekarang rusak
git bisect good v1.3.0           # versi ini masih benar
# Git checkout commit di tengah; uji, lalu tandai:
git bisect good                  # atau: git bisect bad
# ... ulangi (sekitar log2(n) langkah) sampai muncul "first bad commit"
git bisect reset                 # kembali ke branch semula

# Otomatis: exit 0 = good, 1-127 (kecuali 125) = bad, 125 = skip commit ini
git bisect start HEAD v1.3.0
git bisect run npm test -- --run src/harga.test.ts`, 'bash'),
      code('Menelusuri asal sebuah baris', `git blame -L 40,60 src/harga.ts          # commit terakhir yang mengubah baris 40-60
git blame -w -C src/harga.ts             # abaikan whitespace, deteksi baris yang dipindah
git log -S "DISKON_MAX" --oneline        # commit yang menambah/menghapus string ini (pickaxe)
git log -G "timeout\\s*=" -p             # regex pada isi diff
git log --follow -p -- src/harga.ts      # riwayat file, termasuk saat di-rename
git log -L :hitungTotal:src/harga.ts     # riwayat satu fungsi

# Abaikan commit format massal (prettier, gofmt) saat blame
echo "a1b2c3d4e5f6..." >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs`, 'bash'),
      code('Worktree dan tag', `# Checkout kedua di folder lain: kerjakan hotfix tanpa stash/switch di proyek utama
git worktree add -b hotfix/ongkir ../proyek-hotfix origin/main
git worktree list
git worktree remove ../proyek-hotfix

git tag -a v1.4.0 -m "Rilis 1.4.0"       # annotated tag: punya penulis, tanggal, pesan
git tag --list "v1.*"
git push origin v1.4.0                    # tag TIDAK ikut push biasa
git describe --tags                       # v1.4.0-3-g9c8d7e6 = 3 commit setelah v1.4.0`, 'bash'),
      table(['Bagian SemVer', 'Naik saat', 'Contoh'], [
        ['MAJOR', 'Perubahan API yang tidak kompatibel', '1.4.2 ke 2.0.0'],
        ['MINOR', 'Fitur baru yang tetap kompatibel', '1.4.2 ke 1.5.0'],
        ['PATCH', 'Perbaikan bug yang kompatibel', '1.4.2 ke 1.4.3'],
        ['Pre-release', 'Versi uji sebelum rilis', '2.0.0-rc.1 (lebih rendah dari 2.0.0)'],
      ]),
      heading('Hook pre-commit'),
      paragraph('Hook adalah skrip di `.git/hooks/` yang dijalankan Git pada momen tertentu. Folder itu tidak ikut di-commit, jadi simpan hook di folder repo (misalnya `.githooks/`) dan arahkan Git ke sana dengan `core.hooksPath`. Teknik scripting-nya dibahas di [Scripting Bash yang Aman](#tools.sh-scripting). Alternatif berbasis konfigurasi: pre-commit (Python), Husky + lint-staged (Node), atau lefthook.'),
      code('.githooks/pre-commit', `#!/usr/bin/env bash
# Tolak commit bila ada file .env atau lint gagal pada file TypeScript yang di-stage
set -euo pipefail

if git diff --cached --name-only | grep -qE '(^|/)\\.env$'; then
  echo "pre-commit: jangan commit file .env" >&2
  exit 1
fi

files=$(git diff --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx')
if [[ -n "$files" ]]; then
  # shellcheck disable=SC2086  # sengaja dipecah: satu argumen per file
  npx --no-install eslint $files
fi`, 'bash'),
      code('Mengaktifkan hook (sekali per clone)', `chmod +x .githooks/pre-commit
git update-index --chmod=+x .githooks/pre-commit   # simpan bit eksekusi di repo (penting dari Windows)
git config core.hooksPath .githooks
git commit --no-verify -m "..."                    # lewati hook; hanya untuk keadaan darurat`, 'bash'),
      code('.gitattributes', `# Aturan line ending yang berlaku untuk semua orang, lepas dari setting autocrlf masing-masing
* text=auto
*.sh   text eol=lf
*.bat  text eol=crlf
*.png  binary
*.pdf  binary
package-lock.json  -diff linguist-generated
*.psd  filter=lfs diff=lfs merge=lfs -text`, 'text'),
      callout('tip', 'Repo besar dan signing commit', 'Repo besar: `git clone --filter=blob:none` (partial clone), `--depth 1` untuk CI, `git sparse-checkout set <folder>` untuk monorepo, Git LFS untuk file biner, dan `git maintenance start` untuk optimasi berkala. Signing: sejak Git 2.34 commit bisa ditandatangani dengan kunci SSH (`git config --global gpg.format ssh`, `user.signingkey ~/.ssh/id_ed25519.pub`, `commit.gpgsign true`); daftarkan kunci yang sama di GitHub sebagai *Signing Key* agar commit berlabel **Verified**.'),
      ...quiz([
        ['GIT-13', 'Dalam `git bisect run`, apa arti exit code 125 dari skrip uji?', 'Commit tersebut tidak bisa diuji (misalnya gagal build karena hal lain), jadi bisect melewatinya (*skip*). Exit 0 berarti good, 1 sampai 127 selain 125 berarti bad.'],
        ['GIT-14', 'Mengapa hook disimpan di `.githooks/` dengan `core.hooksPath`, bukan langsung di `.git/hooks/`?', 'Isi `.git/` tidak ikut di-commit, sehingga hook di sana tidak tersebar ke anggota tim dan tidak punya riwayat. Dengan `core.hooksPath`, hook menjadi bagian repo, bisa direview, dan cukup satu perintah konfigurasi per clone.'],
        ['GIT-15', 'Kapan memakai `git log -S` dibanding `git blame`?', '`git blame` menunjukkan commit terakhir yang menyentuh baris yang masih ada. `git log -S "teks"` menemukan commit yang menambah atau menghapus teks itu, termasuk kode yang sudah tidak ada lagi di versi sekarang.'],
      ]),
      ...practice('git-lanjutan', [
        'Buat repo dengan 20 commit dan satu bug yang disisipkan di tengah, lalu temukan dengan `git bisect run` dan skrip uji.',
        'Pakai `git worktree add` untuk mengerjakan hotfix sambil branch fitur tetap terbuka, lalu hapus worktree-nya.',
        'Pasang hook pre-commit di `.githooks/` yang menolak `.env`, aktifkan dengan `core.hooksPath`, dan buktikan commit ditolak.',
        'Buat annotated tag `v0.1.0`, push ke remote, dan jelaskan keluaran `git describe --tags` setelah dua commit berikutnya.',
      ]),
      references(
        ['git-scm.com: git-bisect', 'https://git-scm.com/docs/git-bisect'],
        ['git-scm.com: git-worktree', 'https://git-scm.com/docs/git-worktree'],
        ['Pro Git: Tagging', 'https://git-scm.com/book/en/v2/Git-Basics-Tagging'],
        ['Pro Git: Git Hooks', 'https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks'],
        ['git-scm.com: gitattributes', 'https://git-scm.com/docs/gitattributes'],
        ['Semantic Versioning 2.0.0', 'https://semver.org/'],
        ['GitHub Docs: About commit signature verification', 'https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification'],
      ),
    ],
  },

  // ─────────────────────────── Shell ────────────────────────────
  {
    id: 'sh-terminal-navigasi',
    title: 'Shell: Terminal, Navigasi & Environment',
    summary: 'Shell vs terminal, bash/zsh/PowerShell, path, operasi file yang aman, globbing, permission, variabel lingkungan & PATH, serta shortcut history.',
    track: SHELL, source: devToolsSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('*Terminal* adalah jendela tempat kamu mengetik (Windows Terminal, iTerm2, terminal VS Code); *shell* adalah program yang menafsirkan perintah (bash, zsh, PowerShell). Server, container, dan pipeline CI hampir selalu memakai shell POSIX, jadi seluruh track ini memakai **bash**. Di Windows, jalankan contoh di Git Bash atau WSL2.'),
      table(['Shell', 'Di mana ditemui', 'Catatan'], [
        ['bash', 'Default di banyak distro Linux, Git Bash, WSL', 'Target utama skrip server & CI'],
        ['zsh', 'Default macOS sejak Catalina', 'Interaktif hampir sama dengan bash; skrip tetap tulis untuk bash'],
        ['sh (dash/POSIX)', '`/bin/sh` di Debian/Ubuntu, image Alpine', 'Tanpa fitur bash seperti `[[ ]]` dan array'],
        ['PowerShell', 'Windows', 'Pipeline berisi objek, sintaks berbeda (`Get-ChildItem`, `$env:PATH`)'],
      ]),
      code('Navigasi & path', `pwd                          # direktori saat ini
ls -la                       # -l detail, -a termasuk file tersembunyi (.git, .env)
cd ~/proyek                  # ~ = direktori home
cd ..                        # naik satu tingkat
cd -                         # kembali ke direktori sebelumnya
cd /c/Users/kamu             # Git Bash: drive C: menjadi /c
cd /mnt/c/Users/kamu         # WSL: drive C: menjadi /mnt/c (lambat; simpan proyek di ~ milik WSL)
realpath ../README.md        # ubah path relatif menjadi absolut`, 'bash'),
      code('File & direktori dengan aman', `mkdir -p src/api/v1                # -p: buat folder induk, tidak error bila sudah ada
cp -r templates/ backup/           # salin folder
cp -i a.txt b.txt                  # -i: tanya sebelum menimpa
mv -i lama.ts baru.ts              # pindah / ganti nama
rm -i *.tmp                        # tanya per file
rm -r build/                       # hapus folder beserta isinya
touch catatan.md                   # buat file kosong / perbarui waktu ubah

ls *.log                           # glob dikembangkan oleh SHELL sebelum ls berjalan
ls laporan-{2025,2026}.csv         # brace expansion: laporan-2025.csv laporan-2026.csv
shopt -s globstar && ls src/**/*.ts   # ** rekursif (bash 4+)`, 'bash'),
      table(['Pola glob', 'Cocok dengan', 'Contoh'], [
        ['`*`', 'Nol atau lebih karakter (tidak termasuk file berawalan titik)', '`*.ts`'],
        ['`?`', 'Tepat satu karakter', '`log-?.txt`'],
        ['`[abc]`, `[0-9]`', 'Satu karakter dari himpunan', '`data[0-9].csv`'],
        ['`{a,b}`', 'Brace expansion (bukan glob, selalu dikembangkan)', '`{src,test}/index.ts`'],
        ['`**`', 'Rekursif ke subfolder (perlu `shopt -s globstar`)', '`src/**/*.test.ts`'],
      ]),
      callout('warn', 'rm -rf tidak punya Recycle Bin', '`rm -rf` menghapus permanen tanpa konfirmasi. Bahaya klasik di skrip: `rm -rf "$DIR/"` saat `DIR` kosong menjadi `rm -rf /`. Pakai `"${DIR:?}"` agar skrip berhenti bila variabel kosong, cek dulu dengan `ls` atau `echo`, dan jangan menjalankan `rm` dengan `sudo` kecuali benar-benar paham.'),
      code('Permission, variabel lingkungan & PATH', `ls -l deploy.sh               # -rw-r--r-- : pemilik rw, grup r, lainnya r
chmod +x deploy.sh            # tambah izin eksekusi
chmod 755 deploy.sh           # rwx r-x r-x
chmod 600 ~/.ssh/id_ed25519   # kunci privat: hanya pemilik yang boleh membaca

echo "$HOME"
echo "$PATH" | tr ':' '\\n'   # tampilkan setiap direktori PATH per baris
export API_URL=http://localhost:8080   # diwariskan ke proses anak
API_URL=http://staging ./run.sh        # hanya berlaku untuk satu perintah
env | grep API_
command -v node                         # lokasi 'node' yang ditemukan lewat PATH

# Permanen: tambahkan ke ~/.bashrc (zsh: ~/.zshrc), lalu muat ulang
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc`, 'bash'),
      table(['Shortcut', 'Fungsi'], [
        ['`Tab` / `Tab Tab`', 'Lengkapi nama perintah atau file / tampilkan pilihan'],
        ['`Ctrl+R`', 'Cari mundur di history; tekan lagi untuk hasil sebelumnya'],
        ['`Ctrl+A` / `Ctrl+E`', 'Lompat ke awal / akhir baris'],
        ['`Ctrl+W` / `Ctrl+U` / `Ctrl+K`', 'Hapus satu kata / sampai awal baris / sampai akhir baris'],
        ['`Ctrl+C` / `Ctrl+D` / `Ctrl+L`', 'Hentikan perintah / keluar (EOF) / bersihkan layar'],
        ['`!!` / `!$`', 'Ulangi perintah terakhir (`sudo !!`) / argumen terakhir perintah sebelumnya'],
        ['`history | grep docker`', 'Cari perintah lama berdasarkan kata'],
      ]),
      callout('info', 'Catatan Windows', 'NTFS tidak menyimpan bit eksekusi Unix, sehingga `chmod +x` di Git Bash tidak tercatat oleh Git. Gunakan `git update-index --chmod=+x skrip.sh` agar skrip tetap bisa dieksekusi di Linux/CI. Di WSL, proyek di `~` (filesystem Linux) mendukung permission penuh dan jauh lebih cepat daripada `/mnt/c`.'),
      ...quiz([
        ['SH-01', 'Pada `rm *.log`, siapa yang mengubah `*.log` menjadi daftar file?', 'Shell. Sebelum `rm` dijalankan, bash mengembangkan glob menjadi daftar nama file yang cocok, lalu memberikannya sebagai argumen. Bila tidak ada yang cocok, bash secara default meneruskan teks `*.log` apa adanya sehingga `rm` melaporkan file tidak ditemukan.'],
        ['SH-02', 'Apa beda `API_URL=x` dengan `export API_URL=x`?', 'Tanpa export, variabel hanya ada di shell saat ini dan tidak terlihat oleh program yang dijalankan. `export` menjadikannya variabel lingkungan yang diwariskan ke proses anak seperti `node`, `npm`, atau skrip lain.'],
        ['SH-03', 'Kamu memasang tool di `~/.local/bin` tetapi `command not found`. Apa yang diperiksa?', 'Apakah `~/.local/bin` ada di `PATH` (`echo "$PATH" | tr ":" "\\n"`). Bila belum, tambahkan `export PATH="$HOME/.local/bin:$PATH"` ke `~/.bashrc`, lalu jalankan `source ~/.bashrc` atau buka terminal baru. Pastikan juga file tool punya izin eksekusi.'],
      ]),
      ...practice('sh-terminal-navigasi', [
        'Pasang Git Bash atau WSL2, lalu buat struktur `latihan/{src,test,docs}` dengan satu perintah `mkdir -p` dan brace expansion.',
        'Buat skrip `halo.sh`, beri izin eksekusi, dan jalankan dengan `./halo.sh`; jelaskan arti `-rwxr-xr-x` dari `ls -l`.',
        'Tambahkan direktori `~/bin` ke PATH secara permanen dan buktikan dengan `command -v` pada skrip yang kamu taruh di sana.',
        'Gunakan `Ctrl+R`, `!!`, dan `!$` masing-masing minimal tiga kali dalam satu sesi kerja.',
      ]),
      references(
        ['GNU Bash Manual', 'https://www.gnu.org/software/bash/manual/bash.html'],
        ['Bash Manual: Filename Expansion', 'https://www.gnu.org/software/bash/manual/html_node/Filename-Expansion.html'],
        ['Bash Manual: Command Line Editing', 'https://www.gnu.org/software/bash/manual/html_node/Command-Line-Editing.html'],
        ['Microsoft Learn: Install WSL', 'https://learn.microsoft.com/en-us/windows/wsl/install'],
        ['Git for Windows (Git Bash)', 'https://gitforwindows.org/'],
      ),
    ],
  },
  {
    id: 'sh-teks-pipe',
    title: 'Shell: Pipe, Redirection & Olah Teks',
    summary: 'stdin/stdout/stderr, redirection, pipe, grep & ripgrep, find, sed, awk, cut/sort/uniq/wc, xargs, dan jq untuk analisis log.',
    track: SHELL, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Filosofi Unix: program kecil yang melakukan satu hal dengan baik, disambung lewat teks. Setiap proses punya tiga aliran: **stdin** (0), **stdout** (1), dan **stderr** (2). Redirection mengarahkan aliran ke file, sedangkan pipe `|` menyambung stdout satu program ke stdin program berikutnya. Dengan beberapa perintah saja kamu bisa menganalisis log berukuran gigabyte tanpa menulis program.'),
      code('Redirection', `ls > daftar.txt                  # stdout ke file (menimpa)
echo "baris baru" >> log.txt     # tambahkan di akhir file
npm run build 2> error.log       # hanya stderr
npm test > hasil.log 2>&1        # stdout dan stderr ke file yang sama (urutan penting!)
npm test &> hasil.log            # singkatan bash untuk baris di atas
find / -name "*.conf" 2>/dev/null   # buang pesan "Permission denied"
sort < nama.txt                  # stdin dari file
npm test 2>&1 | tee test.log     # tampilkan di layar sekaligus simpan
grep -c "ERROR" <<< "$output"    # here-string: string sebagai stdin`, 'bash'),
      table(['Alat', 'Kegunaan', 'Contoh'], [
        ['`grep` / `rg`', 'Cari baris yang cocok pola', '`rg -n "TODO" src/`'],
        ['`find`', 'Cari file berdasarkan nama, tipe, umur, ukuran', '`find . -name "*.log" -mtime +7`'],
        ['`sed`', 'Substitusi & edit teks per baris', '`sed "s/foo/bar/g"`'],
        ['`awk`', 'Olah kolom, filter, agregasi', '`awk \'{print $1}\'`'],
        ['`cut`', 'Ambil kolom berdasarkan pemisah', '`cut -d, -f2`'],
        ['`sort` / `uniq`', 'Urutkan / gabungkan baris berurutan yang sama', '`sort | uniq -c | sort -rn`'],
        ['`wc`', 'Hitung baris, kata, byte', '`wc -l`'],
        ['`head` / `tail`', 'Awal / akhir file; `tail -f` mengikuti log', '`tail -f app.log`'],
        ['`xargs`', 'Ubah stdin menjadi argumen perintah', '`xargs -0 rm`'],
        ['`jq`', 'Query & transformasi JSON', '`jq ".items[].id"`'],
      ]),
      code('grep, ripgrep, find', `grep -rn "TODO" src/                    # rekursif + nomor baris
grep -i "error" app.log | head -20      # abaikan huruf besar/kecil
grep -v "healthcheck" access.log        # baris yang TIDAK cocok
grep -cE "ERROR|WARN" app.log           # regex extended, hitung baris
grep -o '"userId":"[^"]*"' app.log      # cetak hanya bagian yang cocok
rg "fetchUser" -t ts                    # ripgrep: cepat, otomatis menghormati .gitignore
rg -l "process\\.env" src/              # hanya nama file

find . -name "*.log" -mtime +7                       # log lebih tua dari 7 hari
find . -type f -size +50M                            # file di atas 50 MB
find src -name "*.ts" -not -path "*/node_modules/*"  # kecualikan folder`, 'bash'),
      code('Analisis access log nginx', `# Format "combined": IP - - [30/Oct/2026:14:05:11 +0700] "GET /api/x HTTP/1.1" 200 512 ...
# Kolom (dipisah spasi): $1 = IP, $7 = path, $9 = status

# 10 IP dengan request terbanyak
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Jumlah request per status code
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Endpoint yang paling sering menghasilkan 5xx
awk '$9 >= 500 {print $7}' access.log | sort | uniq -c | sort -rn | head

# Request per jam (bagian setelah ":" pertama adalah jam)
cut -d: -f2 access.log | sort | uniq -c

# Error hari ini saja dari log aplikasi, 5 menit terakhir diikuti langsung
grep "$(date +%Y-%m-%d)" app.log | grep -c ERROR
tail -f app.log | grep --line-buffered ERROR`, 'bash'),
      code('sed & awk', `sed 's/http:/https:/g' config.txt              # cetak hasil; file tidak berubah
sed -n '10,20p' app.log                        # cetak baris 10-20
sed '/^#/d' .env.example                       # buang baris komentar
sed -E 's/([0-9]{4})-([0-9]{2})/\\2\\/\\1/' tgl.txt   # -E: regex extended + grup tangkap

# Edit di tempat: GNU vs BSD berbeda!
sed -i 's/v1\\.3/v1.4/g' README.md             # GNU sed (Linux, Git Bash, WSL)
sed -i '' 's/v1\\.3/v1.4/g' README.md          # BSD sed (macOS): -i wajib diberi sufiks (kosong)
sed -i.bak 's/v1\\.3/v1.4/g' README.md         # portabel di keduanya; menyisakan README.md.bak

awk -F, 'NR > 1 {total += $3} END {print total}' penjualan.csv    # jumlah kolom 3, lewati header
awk -F, 'NR > 1 {n[$2]++} END {for (k in n) print n[k], k}' users.csv | sort -rn   # hitung per kota`, 'bash'),
      code('xargs & jq', `# Hapus file .tmp dengan aman walau namanya mengandung spasi
find . -name "*.tmp" -print0 | xargs -0 rm -f
# Kompres log lama, 4 proses paralel
find logs -name "*.log" -mtime +7 -print0 | xargs -0 -P 4 -n 1 gzip

# jq: query JSON
curl -s https://api.github.com/repos/git/git | jq '.stargazers_count'
jq '.items[] | {id, nama: .name}' data.json
jq -r '.[] | select(.status == "failed") | .id' jobs.json
# Log JSON per baris (pino, zap, structlog): hitung error per service
jq -r 'select(.level == "error") | .service' app.jsonl | sort | uniq -c | sort -rn
jq -c 'select(.durationMs > 1000) | {path, durationMs}' app.jsonl | head`, 'bash'),
      callout('info', 'GNU vs BSD (macOS)', 'Linux, Git Bash, dan WSL memakai GNU coreutils; macOS memakai versi BSD. Perbedaan yang paling sering menggigit: `sed -i` (BSD wajib argumen sufiks), `grep -P` (tidak ada di grep BSD), `date -d "kemarin"` (BSD memakai `date -v-1d`), dan `xargs -r` (perilaku default di BSD). Skrip yang harus jalan di keduanya: pakai opsi portabel atau pasang GNU tools via Homebrew (`gsed`, `gdate`).'),
      ...quiz([
        ['SH-04', 'Apa beda `cmd > out.log 2>&1` dan `cmd 2>&1 > out.log`?', 'Redirection diproses dari kiri ke kanan. Yang pertama: stdout diarahkan ke file, lalu stderr disamakan dengan stdout (file), jadi keduanya masuk file. Yang kedua: stderr disamakan dengan stdout saat itu (terminal), baru stdout diarahkan ke file, sehingga error tetap tampil di terminal.'],
        ['SH-05', 'Mengapa `uniq -c` hampir selalu didahului `sort`?', '`uniq` hanya menggabungkan baris identik yang **berurutan**. Tanpa `sort`, nilai yang sama tetapi terpisah baris lain dihitung terpisah. `sort | uniq -c | sort -rn` adalah idiom untuk menghitung frekuensi lalu mengurutkan dari yang terbanyak.'],
        ['SH-06', 'Mengapa memakai `find -print0 | xargs -0` dan bukan `find | xargs`?', 'Secara default xargs memecah input berdasarkan spasi dan newline, sehingga nama file seperti `laporan akhir.txt` dianggap dua file. `-print0` memisahkan nama dengan karakter NUL yang tidak mungkin muncul di nama file, dan `-0` membuat xargs membaca pemisah itu.'],
      ]),
      ...practice('sh-teks-pipe', [
        'Unduh contoh access log nginx (atau buat 1.000 baris dengan skrip) dan tampilkan 10 IP teratas, distribusi status code, serta endpoint 5xx terbanyak.',
        'Jalankan sebuah build dengan stdout dan stderr disimpan ke file terpisah, lalu ke satu file yang sama; bandingkan hasilnya.',
        'Ganti versi di semua file `*.md` sebuah folder memakai `find ... -print0 | xargs -0 sed -i ...` dan verifikasi dengan `git diff`.',
        'Dari file JSON Lines log aplikasi, hitung jumlah error per service dan cari 5 request paling lambat dengan `jq`.',
      ]),
      references(
        ['Bash Manual: Redirections', 'https://www.gnu.org/software/bash/manual/html_node/Redirections.html'],
        ['Bash Manual: Pipelines', 'https://www.gnu.org/software/bash/manual/html_node/Pipelines.html'],
        ['GNU grep manual', 'https://www.gnu.org/software/grep/manual/grep.html'],
        ['GNU sed manual', 'https://www.gnu.org/software/sed/manual/sed.html'],
        ['GNU Awk User Guide', 'https://www.gnu.org/software/gawk/manual/gawk.html'],
        ['jq manual', 'https://jqlang.org/manual/'],
        ['ripgrep User Guide', 'https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md'],
      ),
    ],
  },
  {
    id: 'sh-scripting',
    title: 'Shell: Scripting Bash yang Aman',
    summary: 'Shebang, set -euo pipefail, variabel & jebakan quoting, if/test/[[ ]], loop, fungsi, argumen, exit code, trap untuk cleanup, dan shellcheck.',
    track: SHELL, source: devToolsSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Skrip bash cocok untuk merangkai perintah: setup, build, deploy, backup. Masalahnya, bash secara default **memaafkan kesalahan**: perintah gagal diabaikan, variabel salah ketik bernilai kosong, dan nama file berspasi terpecah. Modul ini membahas kerangka skrip yang gagal dengan cepat dan jelas. Bila logika mulai rumit (struktur data, parsing JSON besar), pindahkan ke Python atau Node.'),
      code('Kerangka skrip yang aman', `#!/usr/bin/env bash
# backup.sh - contoh kerangka skrip
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LOG_LEVEL="\${LOG_LEVEL:-info}"        # nilai default bila variabel kosong/tidak ada

log() { printf '[%s] %s\\n' "$(date +%H:%M:%S)" "$*" >&2; }   # log ke stderr
die() { log "ERROR: $*"; exit 1; }

main() {
  [[ $# -ge 1 ]] || die "pemakaian: $0 <nama-db>"
  local db="$1"
  log "backup $db (level=$LOG_LEVEL) dari $SCRIPT_DIR"
}

main "$@"`, 'bash'),
      table(['Opsi', 'Efek', 'Jebakan'], [
        ['`set -e`', 'Keluar saat perintah gagal (exit code bukan 0)', 'Tidak berlaku di dalam kondisi `if`, `while`, atau sebelum `&&`/`||`; tambahkan `|| true` bila kegagalan memang boleh'],
        ['`set -u`', 'Error bila memakai variabel yang belum diisi', 'Untuk variabel opsional pakai `"${VAR:-}"` atau `"${VAR:-default}"`'],
        ['`set -o pipefail`', 'Pipe gagal bila salah satu perintah di dalamnya gagal', 'Tanpa ini, `false | true` dianggap sukses'],
        ['`set -x`', 'Cetak setiap perintah sebelum dijalankan (debug)', 'Bisa membocorkan rahasia ke log CI'],
      ]),
      code('Variabel & jebakan quoting', `file="laporan bulanan.txt"
rm $file                 # SALAH: dipecah menjadi "laporan" dan "bulanan.txt"
rm "$file"               # BENAR: selalu kutip ekspansi variabel

for f in *.txt; do echo "$f"; done         # aman untuk spasi; jangan pakai $(ls)

args=(--verbose --out "hasil akhir.txt")   # array: setiap elemen tetap utuh
tool "\${args[@]}"

echo '$HOME'             # kutip tunggal: literal, tanpa ekspansi
echo "$HOME"             # kutip ganda: variabel diekspansi, spasi aman
echo "\${nama}_v2"        # kurung kurawal memisahkan nama variabel dari teks
echo "\${path%.ts}.js"    # buang sufiks; \${path#*/} buang prefiks; \${#path} panjang string`, 'bash'),
      code('Kondisi, loop, case, fungsi', `env_name="production"; versi="v1.4.0"; jumlah=12

if [[ -f .env ]]; then echo "ada .env"; fi
if [[ -z "\${TOKEN:-}" ]]; then echo "TOKEN kosong" >&2; exit 1; fi
if [[ "$env_name" == prod* ]]; then echo "production"; fi          # pola glob di [[ ]]
if [[ "$versi" =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+$ ]]; then echo "semver valid"; fi
if (( jumlah > 10 )); then echo "banyak"; fi                        # aritmetika
if command -v docker >/dev/null; then echo "docker terpasang"; fi  # cek exit code perintah

for svc in api worker web; do echo "restart $svc"; done
for i in {1..5}; do echo "percobaan $i"; done
while IFS= read -r host; do echo "> $host"; done < hosts.txt       # baca file per baris

case "\${1:-}" in
  start) echo "mulai" ;;
  stop)  echo "berhenti" ;;
  *)     echo "pemakaian: $0 {start|stop}" >&2; exit 2 ;;
esac

hitung_baris() {
  local file="$1"          # local: tidak bocor ke luar fungsi
  wc -l < "$file"
}
total=$(hitung_baris app.log)
echo "total: $total"`, 'bash'),
      table(['Parameter', 'Arti'], [
        ['`$0`', 'Nama skrip'],
        ['`$1` ... `$9`, `${10}`', 'Argumen posisi'],
        ['`$#`', 'Jumlah argumen'],
        ['`"$@"`', 'Semua argumen, masing-masing tetap utuh (hampir selalu ini yang benar)'],
        ['`"$*"`', 'Semua argumen digabung jadi satu string'],
        ['`$?`', 'Exit code perintah terakhir: 0 sukses, 1 gagal umum, 2 salah pakai, 126 tidak bisa dieksekusi, 127 perintah tidak ditemukan, 130 dihentikan Ctrl+C'],
        ['`$$` / `$!`', 'PID shell ini / PID proses background terakhir'],
      ]),
      code('trap: cleanup otomatis', `#!/usr/bin/env bash
set -euo pipefail

tmpdir="$(mktemp -d)"
cleanup() {
  local kode=$?
  rm -rf "\${tmpdir:?}"      # :? = berhenti bila kosong, mencegah rm -rf /
  exit "$kode"
}
trap cleanup EXIT            # dijalankan setiap kali skrip keluar, sukses maupun gagal

curl -fsSL https://example.com/data.tar.gz -o "$tmpdir/data.tar.gz"
tar -xzf "$tmpdir/data.tar.gz" -C "$tmpdir"
echo "selesai; $tmpdir dibersihkan otomatis"`, 'bash'),
      code('shellcheck & debugging', `shellcheck deploy.sh
# In deploy.sh line 7:
# rm $file
#    ^---^ SC2086 (info): Double quote to prevent globbing and word splitting.

bash -n deploy.sh            # cek sintaks tanpa menjalankan
bash -x deploy.sh arg1       # jejak setiap perintah (atau set -x di bagian tertentu)`, 'bash'),
      callout('tip', 'Jadikan shellcheck kebiasaan', 'Pasang shellcheck (`apt install shellcheck`, `brew install shellcheck`, `scoop install shellcheck`) dan ekstensi ShellCheck di VS Code agar peringatan muncul saat mengetik. Setiap kode peringatan (misalnya SC2086) punya halaman penjelasan di wiki shellcheck.net. Jalankan juga di CI untuk folder `scripts/`.'),
      ...quiz([
        ['SH-07', 'Dengan `set -e` saja (tanpa pipefail), apakah `curl https://x.invalid | jq .` menghentikan skrip saat curl gagal?', 'Tidak. Exit code pipe adalah exit code perintah terakhir (`jq`), yang bisa saja 0. Dengan `set -o pipefail`, pipe gagal bila ada perintah di dalamnya yang gagal, sehingga `set -e` menghentikan skrip.'],
        ['SH-08', 'Apa beda `"$@"` dan `$*` saat meneruskan argumen ke perintah lain?', '`"$@"` meneruskan setiap argumen sebagai kata terpisah tanpa mengubahnya, termasuk argumen yang berisi spasi. `$*` tanpa kutip memecah ulang berdasarkan spasi dan mengembangkan glob, sedangkan `"$*"` menggabungkan semuanya menjadi satu argumen.'],
        ['SH-09', 'Mengapa memakai `[[ ]]` daripada `[ ]` di skrip bash?', '`[[ ]]` adalah sintaks bawaan bash: variabel di dalamnya tidak dipecah oleh spasi, mendukung pola glob (`== prod*`), regex (`=~`), serta `&&` dan `||`. `[ ]` adalah perintah biasa yang mengikuti aturan word splitting. Gunakan `[ ]` hanya bila skrip harus berjalan di `/bin/sh` POSIX.'],
      ]),
      ...practice('sh-scripting', [
        'Tulis skrip dengan kerangka `set -euo pipefail`, fungsi `log`/`die`, dan `main "$@"` yang memvalidasi jumlah argumen.',
        'Buat file bernama `laporan akhir.txt` dan buktikan perbedaan `rm $file` dengan `rm "$file"` di folder latihan.',
        'Tambahkan `trap cleanup EXIT` yang menghapus direktori sementara, lalu buktikan cleanup tetap berjalan saat skrip gagal di tengah.',
        'Jalankan `shellcheck` pada semua skrip latihan sampai tidak ada peringatan, dan baca halaman wiki untuk setiap kode yang muncul.',
      ]),
      references(
        ['Bash Manual: The Set Builtin', 'https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html'],
        ['Bash Manual: Special Parameters', 'https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html'],
        ['Bash Manual: Conditional Constructs', 'https://www.gnu.org/software/bash/manual/html_node/Conditional-Constructs.html'],
        ['Bash Manual: Shell Parameter Expansion', 'https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html'],
        ['ShellCheck', 'https://www.shellcheck.net/'],
        ['ShellCheck wiki: SC2086', 'https://www.shellcheck.net/wiki/SC2086'],
      ),
    ],
  },
  {
    id: 'sh-proses-jaringan-ssh',
    title: 'Shell: Proses, Port, curl & SSH',
    summary: 'ps/top/kill, job & background, mencari proses yang memakai port, curl untuk menguji API, SSH key & config, serta scp dan rsync.',
    track: SHELL, source: devToolsSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Sebagai developer backend kamu akan sering bertanya: *proses apa yang memakai port 8080?*, *apakah API ini merespons dengan benar?*, dan *bagaimana masuk ke server dengan aman?* Modul ini membahas alat terminal untuk ketiganya. Beberapa perintah (`ss`, `rsync`, `ssh-copy-id`) tidak tersedia di Git Bash; gunakan WSL2 untuk latihan lengkap.'),
      code('Proses & job', `ps aux | grep '[n]ode'           # trik [n]: grep tidak ikut menemukan dirinya sendiri
pgrep -f "node server.js"        # cari PID berdasarkan baris perintah
top                              # monitor interaktif (q untuk keluar); htop/btop lebih nyaman
kill 12345                       # SIGTERM: minta berhenti dengan sopan (proses bisa cleanup)
kill -9 12345                    # SIGKILL: paksa tanpa cleanup - pilihan terakhir
pkill -f "vite"                  # kirim SIGTERM berdasarkan pola perintah

npm run dev &                    # jalankan di background
jobs                             # daftar job di shell ini
fg %1                            # bawa job 1 ke foreground; Ctrl+Z lalu bg untuk sebaliknya
nohup ./worker.sh > worker.log 2>&1 &   # tetap jalan setelah terminal ditutup`, 'bash'),
      table(['Sinyal', 'Nomor', 'Dikirim oleh', 'Perilaku umum'], [
        ['SIGINT', '2', '`Ctrl+C`', 'Hentikan; aplikasi bisa menangkapnya untuk shutdown rapi'],
        ['SIGTERM', '15', '`kill` (default), Docker/Kubernetes saat stop', 'Minta berhenti dengan sopan; tutup koneksi, flush data'],
        ['SIGKILL', '9', '`kill -9`', 'Langsung dimatikan kernel, tidak bisa ditangkap'],
        ['SIGHUP', '1', 'Terminal ditutup', 'Banyak daemon memakainya untuk reload konfigurasi'],
        ['SIGTSTP', '20', '`Ctrl+Z`', 'Jeda proses; lanjutkan dengan `fg` atau `bg`'],
      ]),
      code('Port & curl untuk menguji API', `ss -tlnp                          # Linux: port TCP yang listen + prosesnya (sudo untuk proses user lain)
ss -tlnp | grep :8080
lsof -i :8080                     # Linux/macOS: proses yang memakai port 8080
netstat -ano | findstr :8080      # Windows (cmd/PowerShell): PID ada di kolom terakhir

curl -i http://localhost:8080/health                  # -i: tampilkan header respons
curl -s http://localhost:8080/api/users | jq .
curl -X POST http://localhost:8080/api/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"nama":"Ani","email":"ani@example.com"}'
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\\n" https://example.com   # status & waktu
curl -v https://example.com 2>&1 | grep -E '^[<>] '                            # header request/respons
curl -fsS --retry 3 --max-time 10 http://localhost:8080/health                 # -f: exit gagal bila HTTP >= 400`, 'bash'),
      code('SSH key', `ssh-keygen -t ed25519 -C "kamu@example.com"   # kunci baru: ~/.ssh/id_ed25519 (+ .pub); isi passphrase
cat ~/.ssh/id_ed25519.pub                       # kunci PUBLIK: boleh dibagikan ke GitHub/server
ssh-copy-id deploy@203.0.113.10                 # pasang kunci ke server (Linux/macOS/WSL)
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519   # simpan passphrase selama sesi
ssh -T git@github.com                           # uji koneksi ke GitHub`, 'bash'),
      code('~/.ssh/config', `Host prod
    HostName 203.0.113.10
    User deploy
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

# Akses database privat lewat server prod sebagai jump host
Host db-tunnel
    HostName 10.0.2.15
    User ubuntu
    ProxyJump prod
    LocalForward 5433 localhost:5432

Host *
    ServerAliveInterval 60`, 'text'),
      code('ssh, scp, rsync', `ssh prod                                       # memakai alias dari ~/.ssh/config
ssh prod 'df -h && systemctl status nginx --no-pager'
ssh -N db-tunnel                                # lalu: psql -h localhost -p 5433

scp dist.tar.gz prod:/tmp/                      # salin satu file ke server
scp prod:/var/log/nginx/error.log .             # ambil file dari server

rsync -avz --delete --dry-run dist/ prod:/var/www/app/   # lihat dulu apa yang akan berubah
rsync -avz --delete dist/ prod:/var/www/app/             # sinkronisasi sungguhan
rsync -avz -e "ssh -p 2222" data/ user@host:/backup/data/`, 'bash'),
      callout('warn', 'Hati-hati dengan rsync --delete dan kunci privat', '`rsync --delete` menghapus file di tujuan yang tidak ada di sumber; selalu jalankan `--dry-run` dulu. Perhatikan garis miring: `dist/` menyalin **isi** folder, `dist` menyalin folder itu sendiri ke dalam tujuan. Kunci privat (`id_ed25519` tanpa `.pub`) tidak boleh dibagikan atau di-commit; lindungi dengan passphrase dan izin `600`.'),
      ...quiz([
        ['SH-10', 'Mengapa `kill` (SIGTERM) lebih disarankan daripada `kill -9`?', 'SIGTERM bisa ditangkap aplikasi untuk shutdown rapi: menyelesaikan request yang berjalan, menutup koneksi database, dan menulis data ke disk. SIGKILL langsung menghentikan proses tanpa kesempatan cleanup, berisiko meninggalkan file sementara, lock, atau data setengah tertulis.'],
        ['SH-11', 'Server gagal start dengan error `EADDRINUSE :8080`. Bagaimana menyelidikinya?', 'Port sudah dipakai proses lain. Cari prosesnya dengan `lsof -i :8080` atau `ss -tlnp | grep :8080` (Windows: `netstat -ano | findstr :8080`), pastikan itu memang proses lama milikmu (misalnya dev server yang tertinggal), lalu hentikan dengan `kill <PID>` atau jalankan aplikasi di port lain.'],
        ['SH-12', 'Apa beda `rsync -av dist/ server:/app/` dan `rsync -av dist server:/app/`?', 'Dengan garis miring, isi folder `dist` disalin langsung ke `/app/`. Tanpa garis miring, folder `dist` sendiri yang disalin sehingga hasilnya `/app/dist/...`.'],
      ]),
      ...practice('sh-proses-jaringan-ssh', [
        'Jalankan dev server di background, temukan PID-nya lewat port dengan `lsof` atau `ss`, lalu hentikan dengan SIGTERM.',
        'Uji satu REST API (GET, POST dengan body JSON, header Authorization) memakai curl, dan catat status code serta waktu respons dengan `-w`.',
        'Buat kunci ed25519 dengan passphrase, daftarkan ke GitHub, dan buktikan dengan `ssh -T git@github.com`.',
        'Tulis `~/.ssh/config` dengan alias untuk satu server (VM lokal atau WSL) dan sinkronkan folder dengan `rsync --dry-run` lalu tanpa dry run.',
      ]),
      references(
        ['Bash Manual: Job Control', 'https://www.gnu.org/software/bash/manual/html_node/Job-Control.html'],
        ['curl man page', 'https://curl.se/docs/manpage.html'],
        ['OpenSSH: ssh_config(5)', 'https://man.openbsd.org/ssh_config'],
        ['GitHub Docs: Connecting to GitHub with SSH', 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh'],
        ['rsync(1) man page', 'https://download.samba.org/pub/rsync/rsync.1'],
      ),
    ],
  },
  {
    id: 'sh-otomasi-proyek',
    title: 'Shell: Otomasi Proyek & Skrip Rilis',
    summary: 'Makefile dan justfile untuk target umum, skrip backup, cron, dotfiles & alias, serta mini proyek skrip rilis yang membuat tag dan changelog dari Conventional Commits.',
    track: SHELL, source: devToolsSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Perintah yang kamu ketik lebih dari tiga kali layak diotomasi. **Makefile** atau **justfile** memberi satu pintu masuk (`make test`, `make build`) yang sama untuk semua anggota tim dan CI; skrip bash menangani alur yang lebih panjang; cron menjalankannya terjadwal. Modul ini ditutup dengan mini proyek yang menggabungkan Git dan scripting.'),
      code('Makefile', `# Makefile - baris resep WAJIB diawali karakter TAB, bukan spasi
.PHONY: help install dev test lint build clean release

help: ## tampilkan daftar target
\t@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "%-10s %s\\n", $$1, $$2}'

install: ## pasang dependensi persis sesuai lockfile
\tnpm ci

dev: ## jalankan server pengembangan
\tnpm run dev

test: ## jalankan unit test
\tnpm test

lint:
\tnpx eslint .

build: lint test ## build produksi (lint & test dulu)
\tnpm run build

clean:
\trm -rf dist coverage

release: ## rilis: make release atau make release VERSION=2.0.0
\t./scripts/release.sh $(VERSION)`, 'text'),
      code('justfile (alternatif tanpa aturan TAB)', `# justfile - jalankan dengan: just test, just release 2.0.0
default:
    @just --list

dev:
    npm run dev

test *args:
    npm test -- {{args}}

release version="":
    ./scripts/release.sh {{version}}`, 'text'),
      callout('info', 'make di Windows', 'Git Bash tidak menyertakan `make`. Pasang lewat WSL2 (`sudo apt install make`), `winget install ezwinports.make`, atau gunakan `just` (`winget install Casey.Just`) yang berjalan native di Windows, macOS, dan Linux. `.PHONY` memberi tahu make bahwa target seperti `test` bukan nama file, sehingga tetap dijalankan walau ada folder bernama `test`.'),
      code('scripts/backup-db.sh', `#!/usr/bin/env bash
# Dump PostgreSQL, kompres, simpan 7 hari terakhir
set -euo pipefail

: "\${DATABASE_URL:?DATABASE_URL wajib diisi}"
BACKUP_DIR="\${BACKUP_DIR:-$HOME/backups}"
mkdir -p "$BACKUP_DIR"

file="$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$file"
echo "backup tersimpan: $file ($(du -h "$file" | cut -f1))"

find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime +7 -print -delete   # rotasi backup lama`, 'bash'),
      code('crontab -e', `# menit jam tanggal bulan hari-minggu  perintah
# Setiap hari 02:30. Cron memakai PATH minimal dan tanpa .bashrc: tulis path absolut.
30 2 * * * . $HOME/.backup.env && $HOME/app/scripts/backup-db.sh >> $HOME/logs/backup.log 2>&1

# Setiap 15 menit, Senin-Jumat
*/15 * * * 1-5 $HOME/app/scripts/cek-health.sh

# % bermakna khusus di crontab (newline); escape menjadi \\%
0 3 * * 0 tar -czf $HOME/arsip-$(date +\\%F).tgz $HOME/data`, 'text'),
      code('Alias, fungsi & dotfiles', `# ~/.bashrc (zsh: ~/.zshrc)
alias gs='git status -sb'
alias gl='git log --oneline --graph --decorate -20'
alias ll='ls -lah'
mkcd() { mkdir -p "$1" && cd "$1"; }

# Alias Git disimpan di ~/.gitconfig
git config --global alias.st "status -sb"
git config --global alias.undo "reset --soft HEAD~1"
git config --global alias.last "log -1 HEAD --stat"

# Dotfiles dalam repo Git + symlink
git clone git@github.com:kamu/dotfiles.git ~/dotfiles
ln -sf ~/dotfiles/.bashrc ~/.bashrc
ln -sf ~/dotfiles/.gitconfig ~/.gitconfig`, 'bash'),
      heading('Mini proyek: skrip rilis dari Conventional Commits'),
      paragraph('Gabungkan semua yang sudah dipelajari: skrip memastikan berada di `main` yang bersih dan sinkron, membaca commit sejak tag terakhir, menentukan versi berikutnya sesuai SemVer ([Conventional Commits](#tools.git-remote-kolaborasi)), menulis `CHANGELOG.md`, lalu membuat annotated tag ([Tag & SemVer](#tools.git-lanjutan)) dan push.'),
      code('scripts/release.sh', `#!/usr/bin/env bash
# Pemakaian: ./scripts/release.sh          (versi dihitung dari commit)
#            ./scripts/release.sh 2.0.0    (versi manual)
set -euo pipefail

die() { echo "release: $*" >&2; exit 1; }

# 1. Prasyarat: di main, working tree bersih, sinkron dengan remote
[[ "$(git branch --show-current)" == "main" ]] || die "jalankan dari branch main"
[[ -z "$(git status --porcelain)" ]] || die "working tree belum bersih"
git fetch --tags origin
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || die "main belum sinkron dengan origin/main"

# 2. Commit sejak tag terakhir
last_tag="$(git describe --tags --abbrev=0 2>/dev/null || true)"
range="\${last_tag:+$last_tag..}HEAD"
subjects="$(git log "$range" --no-merges --format='%s')"
bodies="$(git log "$range" --no-merges --format='%B')"
[[ -n "$subjects" ]] || die "tidak ada commit baru sejak \${last_tag:-awal}"

# 3. Versi berikutnya (SemVer)
current="\${last_tag#v}"
current="\${current:-0.0.0}"
IFS=. read -r major minor patch <<< "$current"
if [[ -n "\${1:-}" ]]; then
  next="$1"
elif grep -qE '^[a-z]+(\\([^)]*\\))?!:|^BREAKING CHANGE:' <<< "$bodies"; then
  next="$((major + 1)).0.0"
elif grep -qE '^feat(\\([^)]*\\))?:' <<< "$subjects"; then
  next="$major.$((minor + 1)).0"
else
  next="$major.$minor.$((patch + 1))"
fi
tag="v$next"
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then die "tag $tag sudah ada"; fi

# 4. Bagian CHANGELOG baru ditaruh di atas isi lama
section() {   # $1 = judul, $2 = tipe commit
  local items
  items="$(grep -E "^$2(\\([^)]*\\))?!?: " <<< "$subjects" | sed -E 's/^[a-z]+(\\([^)]*\\))?!?: /- /' || true)"
  if [[ -n "$items" ]]; then printf '### %s\\n\\n%s\\n\\n' "$1" "$items"; fi
}
{
  printf '## %s (%s)\\n\\n' "$tag" "$(date +%Y-%m-%d)"
  section "Fitur" "feat"
  section "Perbaikan" "fix"
  section "Performa" "perf"
  if [[ -f CHANGELOG.md ]]; then cat CHANGELOG.md; fi
} > CHANGELOG.md.tmp
mv CHANGELOG.md.tmp CHANGELOG.md

# 5. Commit, tag, push
git add CHANGELOG.md
git commit -m "chore(release): $tag"
git tag -a "$tag" -m "Rilis $tag"
git push origin main "$tag"
echo "Rilis $tag selesai. Opsional: gh release create $tag --generate-notes"`, 'bash'),
      callout('warn', 'Sebelum menjalankan di repo sungguhan', 'Uji di repo latihan dulu: skrip ini membuat commit, tag, dan push. Perhatikan detail yang sengaja dipilih: `grep -q ... <<< "$var"` dan bukan `git log | grep -q`, karena dengan `pipefail` grep yang berhenti lebih awal bisa membuat `git log` gagal dengan SIGPIPE dan kondisi `if` salah. Bila `main` diproteksi (wajib PR), push langsung akan ditolak; pada tim besar gunakan alat CI seperti release-please, semantic-release, atau changesets.'),
      ...quiz([
        ['SH-13', 'Apa fungsi `.PHONY: test` di Makefile?', 'Menandai `test` sebagai target yang bukan file. Tanpa itu, bila ada file atau folder bernama `test` yang lebih baru dari dependensinya, make menganggap target sudah up to date dan tidak menjalankan resepnya.'],
        ['SH-14', 'Skrip berjalan normal di terminal tetapi gagal saat dijalankan cron. Apa penyebab umumnya?', 'Cron memakai lingkungan minimal: PATH pendek, tanpa `.bashrc`, tanpa variabel seperti `DATABASE_URL`, dan direktori kerja di home. Gunakan path absolut, muat variabel secara eksplisit (misalnya `. $HOME/.backup.env`), redirect output ke file log, dan escape `%` menjadi `\\%` di crontab.'],
        ['SH-15', 'Bagaimana skrip rilis menentukan versi bila sejak `v1.4.2` ada commit `fix: ...` dan `feat(api): ...`?', 'Tidak ada breaking change (`!` atau `BREAKING CHANGE:`), tetapi ada `feat`, sehingga MINOR naik dan PATCH kembali ke nol: `v1.5.0`.'],
      ]),
      ...practice('sh-otomasi-proyek', [
        'Tambahkan Makefile (atau justfile) ke proyekmu dengan target `help`, `install`, `dev`, `test`, `lint`, `build`, dan `clean`; pastikan `make help` menampilkan deskripsi.',
        'Jadwalkan skrip backup (atau skrip dummy yang menulis timestamp) dengan cron di WSL2 dan buktikan dari file log.',
        'Simpan `.bashrc` dan `.gitconfig` di repo dotfiles dengan minimal lima alias yang benar-benar kamu pakai.',
        'Jalankan `release.sh` di repo latihan dengan campuran commit `feat`, `fix`, dan `feat!`; verifikasi versi, isi `CHANGELOG.md`, tag, dan lolos `shellcheck`.',
      ]),
      references(
        ['GNU Make Manual', 'https://www.gnu.org/software/make/manual/make.html'],
        ['just: Programmer Manual', 'https://just.systems/man/en/'],
        ['crontab(5) man page', 'https://man7.org/linux/man-pages/man5/crontab.5.html'],
        ['Conventional Commits 1.0.0', 'https://www.conventionalcommits.org/en/v1.0.0/'],
        ['Keep a Changelog', 'https://keepachangelog.com/en/1.1.0/'],
        ['GitHub CLI: gh release create', 'https://cli.github.com/manual/gh_release_create'],
      ),
    ],
  },
];

export const devToolsCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'tools',
  title: 'Git & Shell untuk Developer',
  short: 'Git & Shell',
  monogram: 'Git',
  hue: 'stone',
  description:
    'Skill harian setiap developer: Git dari commit pertama sampai bisect dan hook, kolaborasi lewat GitHub, serta bash untuk navigasi, olah teks, scripting, SSH, dan otomasi proyek.',
  tracks: devToolsTracks,
  sources: [devToolsSource],
  intro: [
    callout('info', 'Skill harian, apa pun stack-mu', 'Bahasa dan framework berganti, tetapi Git dan terminal dipakai setiap hari: menyimpan pekerjaan, berkolaborasi lewat pull request, membaca log, menguji API, dan mengotomasi rilis. Kerjakan track **Git** lebih dulu, lalu **Shell & Terminal**; setiap modul berisi cheat sheet, kuis, dan latihan.'),
    callout('tip', 'Pengguna Windows 11', 'Semua contoh memakai bash. Untuk mulai cepat, pakai **Git Bash** yang terpasang bersama [Git for Windows](https://gitforwindows.org/). Untuk lingkungan Linux lengkap (`ss`, `rsync`, `cron`, `make`), pasang **WSL2** dengan `wsl --install` dan simpan proyek di home WSL (`~/proyek`), bukan `/mnt/c`, agar cepat. Perintah PowerShell berbeda sintaks; jangan menyalin contoh bash ke PowerShell.'),
  ],
  modules,
};
