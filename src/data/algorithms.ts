import type { Curriculum } from '../types';

export const algorithms: Curriculum = {
  id: 'algo',
  title: 'Java Algorithm Mastery',
  short: 'Algoritma Java',
  monogram: 'O(n)',
  hue: 'teal',
  description:
    'Strategi pemecahan masalah paling penting dalam Java, dari rekursi dan brute force sampai dynamic programming, lengkap dengan kode dan kompleksitasnya.',
  intro: [
    {
      type: 'cards',
      items: [
        {
          label: 'Karier',
          title: 'Interview kerja',
          text: 'Hampir semua interview teknis di perusahaan tech membutuhkan pemahaman algoritma.',
        },
        {
          label: 'Performa',
          title: 'Aplikasi lebih cepat',
          text: 'Algoritma yang tepat bisa membuat aplikasi jauh lebih cepat, misalnya O(n²) menjadi O(n log n).',
        },
        {
          label: 'Cara berpikir',
          title: 'Problem solving',
          text: 'Berpikir algoritmik membantu memecahkan masalah kompleks secara sistematis.',
        },
      ],
    },
  ],
  modules: [
    {
      id: 'rekursi',
      code: '00',
      title: 'Rekursi',
      summary: 'Fungsi yang memanggil dirinya sendiri. Fondasi DP dan Divide & Conquer.',
      level: 'Med',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Fondasi',
          text: 'Rekursi adalah dasar dari DP, Divide & Conquer, dan banyak algoritma lain. Setiap rekursi HARUS punya **base case** (kondisi berhenti) agar tidak infinite loop.',
        },
        {
          type: 'cards',
          items: [
            { label: 'Berhenti', title: 'Base Case', text: 'Kondisi di mana fungsi berhenti memanggil dirinya. Wajib ada.' },
            { label: 'Lanjut', title: 'Recursive Case', text: 'Fungsi memanggil dirinya dengan input yang lebih kecil/sederhana.' },
          ],
        },
        {
          type: 'code',
          lang: 'java',
          title: 'Contoh-contoh rekursi',
          code: `// 1. Factorial: n! = n × (n-1)!
static long factorial(int n) {
    if (n == 0) return 1;            // ← base case
    return n * factorial(n - 1);     // ← recursive case
}
// factorial(5) = 5×4×3×2×1 = 120

// 2. Power: xⁿ
static double power(double x, int n) {
    if (n == 0) return 1;
    if (n % 2 == 0) {
        double half = power(x, n / 2);
        return half * half;          // efisien: O(log n)
    }
    return x * power(x, n - 1);
}

// 3. Balik string
static String reverse(String s) {
    if (s.length() <= 1) return s;
    return reverse(s.substring(1)) + s.charAt(0);
}
// reverse("Java") → "avaJ"`,
        },
      ],
    },
    {
      id: 'brute-force',
      code: '01',
      title: 'Brute Force',
      summary: 'Coba semua kemungkinan hingga menemukan solusi yang benar.',
      level: 'Easy',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Definisi',
          text: 'Brute Force adalah pendekatan langsung yang mencoba semua kemungkinan solusi secara sistematis. Sederhana, tapi bisa sangat lambat untuk input besar.',
        },
        { type: 'h', text: 'Kapan pakai Brute Force?' },
        {
          type: 'cards',
          items: [
            { label: 'n ≤ 1000', title: 'Dataset kecil', text: 'Ketika input kecil dan tidak butuh performa tinggi.' },
            { label: 'Testing', title: 'Verifikasi solusi', text: 'Dipakai untuk memvalidasi algoritma yang lebih kompleks.' },
            { label: 'MVP', title: 'Prototype cepat', text: 'Ketika butuh solusi yang bekerja dulu, baru dioptimasi.' },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Linear Search',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Linear Search — O(n)',
                  code: `public class BruteForce {

    // Cari elemen dalam array — periksa satu per satu
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // ← ketemu! return index-nya
            }
        }
        return -1; // ← tidak ketemu
    }

    public static void main(String[] args) {
        int[] data = {5, 3, 8, 1, 9, 2};
        int hasil = linearSearch(data, 8);

        System.out.println("Angka 8 ada di index: " + hasil); // → 2
    }
}`,
                },
              ],
            },
            {
              label: 'Two Sum',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Two Sum Brute Force — O(n²)',
                  code: `// Cari dua angka yang jumlahnya = target
public static int[] twoSum(int[] nums, int target) {
    // Coba SETIAP pasangan — nested loop
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j}; // ketemu!
            }
        }
    }
    return new int[]{-1, -1};
}

// Input: [2, 7, 11, 15], target = 9
// Output: [0, 1]  karena nums[0]+nums[1] = 2+7 = 9
// Kompleksitas: O(n²) — lambat untuk n besar!`,
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  text: 'Two Sum brute force O(n²) bisa dioptimasi ke O(n) memakai HashMap. Tapi untuk belajar, mulai dari brute force dulu.',
                },
              ],
            },
            {
              label: 'String Match',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'String Pattern Matching — O(n×m)',
                  code: `public static int naiveSearch(String text, String pattern) {
    int n = text.length();
    int m = pattern.length();

    for (int i = 0; i <= n - m; i++) {
        int j;
        // Cek satu per satu karakter
        for (j = 0; j < m; j++) {
            if (text.charAt(i + j) != pattern.charAt(j)) {
                break; // tidak cocok, lanjut
            }
        }
        if (j == m) return i; // ← pattern ketemu di index i
    }
    return -1;
}

// naiveSearch("hello world", "world") → 6`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'dynamic-programming',
      code: '02',
      title: 'Dynamic Programming',
      summary: 'Simpan hasil submasalah, jangan hitung dua kali.',
      level: 'Hard',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Kunci DP',
          text: 'Masalah bisa diselesaikan dengan DP jika punya **optimal substructure** (solusi optimal dibangun dari solusi submasalah) dan **overlapping subproblems** (submasalah yang sama dihitung berulang).',
        },
        { type: 'h', text: 'Dua pendekatan DP' },
        {
          type: 'cards',
          items: [
            {
              label: 'Top-down',
              title: 'Memoization',
              text: 'Rekursi + cache hasil. Mulai dari masalah besar, pecah ke yang kecil. Lebih intuitif.',
            },
            {
              label: 'Bottom-up',
              title: 'Tabulation',
              text: 'Iteratif. Mulai dari kasus terkecil, bangun ke masalah lebih besar. Lebih hemat memori.',
            },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Fibonacci',
              blocks: [
                { type: 'h', text: 'Tanpa DP: eksponensial O(2ⁿ)' },
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Fibonacci biasa (lambat)',
                  code: `public static long fibLambat(int n) {
    if (n <= 1) return n;
    // Menghitung fib(n-2) BERKALI-KALI!
    return fibLambat(n - 1) + fibLambat(n - 2);
}
// fib(40) sudah butuh ratusan juta pemanggilan!`,
                },
                { type: 'h', text: 'Top-down DP (memoization)' },
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Fibonacci dengan memoization — O(n)',
                  code: `Map<Integer, Long> memo = new HashMap<>();

public long fibMemo(int n) {
    if (n <= 1) return n;

    // Sudah pernah dihitung? Ambil dari cache!
    if (memo.containsKey(n)) {
        return memo.get(n);
    }

    long hasil = fibMemo(n - 1) + fibMemo(n - 2);
    memo.put(n, hasil); // ← simpan hasilnya
    return hasil;
}`,
                },
                { type: 'h', text: 'Bottom-up DP (tabulation)' },
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Fibonacci bottom-up — O(n) waktu, O(1) memori',
                  code: `public static long fibBottomUp(int n) {
    if (n <= 1) return n;

    long prev2 = 0, prev1 = 1;

    for (int i = 2; i <= n; i++) {
        long curr = prev1 + prev2; // hitung dari bawah ke atas
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
// fib(50) = 12586269025 — instan!`,
                },
              ],
            },
            {
              label: 'Knapsack',
              blocks: [
                {
                  type: 'callout',
                  tone: 'info',
                  title: '0/1 Knapsack',
                  text: 'Diberi n item dengan berat & nilai masing-masing, kapasitas tas W. Pilih item agar total nilai maksimal tanpa melebihi kapasitas.',
                },
                {
                  type: 'code',
                  lang: 'java',
                  title: '0/1 Knapsack — O(n × W)',
                  code: `public static int knapsack(int[] weight, int[] value, int W) {
    int n = weight.length;
    int[][] dp = new int[n + 1][W + 1];

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {

            // Jangan ambil item ke-i
            dp[i][w] = dp[i - 1][w];

            // Ambil item ke-i (jika muat)
            if (weight[i - 1] <= w) {
                int nilaiDenganItem = dp[i - 1][w - weight[i - 1]] + value[i - 1];
                dp[i][w] = Math.max(dp[i][w], nilaiDenganItem);
            }
        }
    }
    return dp[n][W];
}

// Contoh:
// weight = {2, 3, 4, 5}, value = {3, 4, 5, 6}, W = 5
// Output: 7 (ambil item 1 dan 2: berat 2+3=5, nilai 3+4=7)`,
                },
              ],
            },
            {
              label: 'LCS',
              blocks: [
                {
                  type: 'callout',
                  tone: 'info',
                  title: 'Longest Common Subsequence',
                  text: 'Cari subsequence terpanjang yang sama di dua string. Contoh: `"ABCBDAB"` & `"BDCAB"` → LCS = `"BCAB"` (panjang 4).',
                },
                {
                  type: 'code',
                  lang: 'java',
                  title: 'LCS — O(m × n)',
                  code: `public static int lcs(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                // Karakter sama → tambah 1 dari diagonal
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                // Ambil yang terbesar dari atas atau kiri
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

// lcs("ABCBDAB", "BDCAB") → 4`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'greedy',
      code: '03',
      title: 'Greedy Algorithm',
      summary: 'Pilih yang terbaik sekarang, tanpa melihat ke depan.',
      level: 'Med',
      blocks: [
        {
          type: 'callout',
          tone: 'success',
          title: 'Prinsip Greedy',
          text: 'Di setiap langkah, ambil pilihan yang terlihat paling optimal *saat itu*. Tidak kembali ke pilihan sebelumnya. Bekerja untuk masalah yang punya **greedy choice property**.',
        },
        {
          type: 'cards',
          items: [
            { label: 'Kelebihan', title: 'Cepat & sederhana', text: 'Sangat cepat, mudah diimplementasi, dan sering optimal untuk masalah tertentu.' },
            {
              label: 'Kelemahan',
              title: 'Tidak selalu optimal',
              text: 'Tidak selalu menghasilkan solusi optimal global. Perlu bukti bahwa greedy benar untuk masalah tersebut.',
            },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Coin Change',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Coin Change Greedy — O(n log n)',
                  code: `import java.util.*;

public static List<Integer> coinChangeGreedy(int[] coins, int amount) {
    // Urutkan koin dari kecil ke besar, lalu iterasi dari yang terbesar
    Arrays.sort(coins);
    List<Integer> result = new ArrayList<>();

    for (int i = coins.length - 1; i >= 0 && amount > 0; i--) {
        // Pakai koin terbesar sebanyak mungkin
        while (amount >= coins[i]) {
            result.add(coins[i]);
            amount -= coins[i];
        }
    }

    return amount == 0 ? result : null; // null = tidak bisa
}

// coins={1,5,10,25}, amount=41 → [25,10,5,1]
// HATI-HATI: Greedy tidak selalu benar!
// coins={1,3,4}, amount=6 → Greedy: [4,1,1] (3 koin)
// Optimal: [3,3] (2 koin) ← Greedy salah di sini!`,
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  text: 'Greedy Coin Change hanya benar untuk sistem koin tertentu (seperti Rupiah/Dollar). Untuk kasus umum, gunakan **Dynamic Programming**.',
                },
              ],
            },
            {
              label: 'Activity Selection',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Activity Selection — O(n log n)',
                  code: `// Pilih aktivitas terbanyak yang tidak bertabrakan
public static List<int[]> activitySelection(int[][] activities) {
    // Urutkan berdasarkan waktu SELESAI
    Arrays.sort(activities, (a, b) -> a[1] - b[1]);

    List<int[]> selected = new ArrayList<>();
    int lastEnd = -1;

    for (int[] act : activities) {
        if (act[0] >= lastEnd) { // mulai setelah yang terakhir selesai
            selected.add(act);
            lastEnd = act[1];
        }
    }
    return selected;
}

// activities = {{1,3},{2,5},{4,6},{6,8},{5,7},{8,9}}
// Output: [1,3], [4,6], [6,8], [8,9] → 4 aktivitas`,
                },
                {
                  type: 'callout',
                  tone: 'success',
                  text: 'Activity Selection dengan Greedy (pilih yang selesai paling awal) **terbukti optimal**. Ini salah satu kasus di mana greedy selalu memberi solusi terbaik.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'divide-conquer',
      code: '04',
      title: 'Divide & Conquer',
      summary: 'Pecah, selesaikan, gabungkan.',
      level: 'Med',
      blocks: [
        {
          type: 'steps',
          items: [
            { title: 'Divide', text: 'Bagi masalah menjadi sub-masalah yang lebih kecil dan serupa.' },
            { title: 'Conquer', text: 'Selesaikan setiap sub-masalah secara rekursif (atau langsung jika sudah kecil).' },
            { title: 'Combine', text: 'Gabungkan solusi sub-masalah menjadi solusi masalah asli.' },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Merge Sort',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Merge Sort — O(n log n)',
                  code: `public static void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return; // base case

    int mid = (left + right) / 2;

    // DIVIDE: bagi dua
    mergeSort(arr, left, mid);       // kiri
    mergeSort(arr, mid + 1, right);  // kanan

    // COMBINE: gabungkan (merge)
    merge(arr, left, mid, right);
}

static void merge(int[] arr, int l, int m, int r) {
    int[] temp = new int[r - l + 1];
    int i = l, j = m + 1, k = 0;

    while (i <= m && j <= r) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= m) temp[k++] = arr[i++];
    while (j <= r) temp[k++] = arr[j++];

    for (int x = 0; x < temp.length; x++)
        arr[l + x] = temp[x];
}

// Contoh: [5,3,8,1,9] → [1,3,5,8,9]
// Panggil: mergeSort(arr, 0, arr.length - 1)`,
                },
              ],
            },
            {
              label: 'Binary Search',
              blocks: [
                {
                  type: 'code',
                  lang: 'java',
                  title: 'Binary Search — O(log n)',
                  code: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid;          // ← ketemu!
        } else if (arr[mid] < target) {
            left = mid + 1;      // cari di kanan
        } else {
            right = mid - 1;     // cari di kiri
        }
    }
    return -1;
}

// Array HARUS sudah diurutkan!
// [1,3,5,7,9,11], target=7 → index 3
// Cuma butuh ~log₂(n) langkah vs n langkah linear search`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'perbandingan',
      code: '05',
      title: 'Perbandingan Algoritma',
      summary: 'Kapan pakai yang mana, dan alur memilih strategi.',
      blocks: [
        {
          type: 'table',
          head: ['Strategi', 'Waktu', 'Ruang', 'Cocok untuk', 'Tidak cocok untuk'],
          rows: [
            ['**Brute Force**', { badge: 'high', text: 'O(n²) atau lebih' }, { badge: 'low', text: 'O(1)' }, 'Dataset kecil, prototyping', 'Input besar, sistem produksi'],
            ['**Dynamic Programming**', { badge: 'mid', text: 'Polinomial, mis. O(n²)' }, { badge: 'mid', text: 'O(n) atau O(n²)' }, 'Optimasi, submasalah overlap', 'Masalah tanpa substruktur'],
            ['**Greedy**', { badge: 'low', text: 'O(n log n)' }, { badge: 'low', text: 'O(1)' }, 'Scheduling, Huffman, MST', 'Masalah yang butuh backtrack'],
            ['**Divide & Conquer**', { badge: 'low', text: 'O(n log n)' }, { badge: 'mid', text: 'O(log n)' }, 'Sorting, searching, tree', 'Submasalah yang overlap'],
            ['**Rekursi**', { badge: 'high', text: 'Bervariasi' }, { badge: 'mid', text: 'O(depth)' }, 'Tree traversal, backtracking', 'Risiko stack overflow (n dalam)'],
          ],
        },
        { type: 'h', text: 'Alur pemilihan algoritma' },
        {
          type: 'steps',
          items: [
            { title: 'Apakah n kecil? (≤ 1000)', text: 'Ya → Brute Force boleh. Tidak → lanjut ke langkah 2.' },
            { title: 'Ada submasalah yang tumpang tindih?', text: 'Ya → pertimbangkan Dynamic Programming. Tidak → lanjut.' },
            { title: 'Pilihan lokal menghasilkan optimal global?', text: 'Ya → coba Greedy (tapi buktikan kebenarannya).' },
            { title: 'Bisa dipecah jadi sub-masalah independen?', text: 'Ya → Divide & Conquer. Contoh: sorting, binary search.' },
          ],
        },
      ],
    },
  ],
};
