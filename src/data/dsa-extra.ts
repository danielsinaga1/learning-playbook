import type { Module } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const STRUKTUR = 'Struktur Data';
const STRATEGI = 'Strategi Algoritma';

export const dsaExtraSource = 'Struktur Data & Algoritma: materi tambahan dari dokumentasi Java SE 21, Algorithms 4th Edition (Princeton) dan cp-algorithms (2 November 2026)';

export const dsaExtraModules: Omit<Module, 'code'>[] = [
  {
    id: 'dsa-big-o-kompleksitas',
    title: 'Big-O & Analisis Kompleksitas',
    summary: 'Pintu masuk track: membaca time/space complexity dari kode, best/average/worst case, amortized, dan tabel kompleksitas koleksi Java.',
    track: STRUKTUR, source: dsaExtraSource, duration: '1,5–2 jam', level: 'Easy',
    blocks: [
      paragraph('Sebelum mempelajari array, linked list, atau tree, kamu butuh satu alat ukur yang sama: **Big-O**. Big-O menjawab pertanyaan *"kalau input jadi 10× lebih besar, kira-kira berapa kali lebih lambat programnya?"*. Kode yang terasa cepat dengan 100 data bisa macet total dengan 1 juta data bila kompleksitasnya O(n²). Seluruh modul di track ini memakai notasi ini untuk membandingkan struktur data.'),
      paragraph('Aturan dasarnya: hitung berapa kali operasi dasar dijalankan sebagai fungsi dari ukuran input `n`, lalu **buang konstanta dan suku yang lebih kecil**. `3n² + 5n + 20` menjadi **O(n²)**, karena saat `n` besar suku `n²` yang mendominasi. **Time complexity** mengukur jumlah langkah; **space complexity** mengukur memori *tambahan* (termasuk call stack rekursi), di luar input itu sendiri.'),
      code('Menghitung kompleksitas langsung dari kode', `// O(1): jumlah langkah tidak bergantung pada n
int first(int[] a) { return a[0]; }

// O(n): satu loop sepanjang input
long sum(int[] a) {
    long total = 0;
    for (int x : a) total += x;
    return total;
}

// O(n²): loop bersarang; inner berjalan n-1, n-2, ..., 1 kali → n(n-1)/2 ≈ n²/2
boolean hasDuplicate(int[] a) {
    for (int i = 0; i < a.length; i++)
        for (int j = i + 1; j < a.length; j++)
            if (a[i] == a[j]) return true;
    return false;
}

// O(log n): ruang masalah dibagi dua setiap langkah
int countHalvings(int n) {
    int steps = 0;
    while (n > 1) { n /= 2; steps++; }
    return steps;
}

// O(n log n): loop luar n kali, loop dalam log n kali (j berlipat dua)
int nLogN(int n) {
    int ops = 0;
    for (int i = 0; i < n; i++)
        for (int j = 1; j < n; j *= 2) ops++;
    return ops;
}

// O(n + m), BUKAN O(n²): dua loop berurutan atas dua input berbeda
void printBoth(int[] a, int[] b) {
    for (int x : a) System.out.println(x);
    for (int y : b) System.out.println(y);
}`, 'java'),
      table(['Kompleksitas', 'Nama', 'Contoh', 'n = 1.000.000 → kira-kira'], [
        ['O(1)', 'Konstan', 'Akses `array[i]`, `HashMap.get` (rata-rata)', '1 langkah'],
        ['O(log n)', 'Logaritmik', 'Binary search, operasi `TreeMap`', '~20 langkah'],
        ['O(n)', 'Linear', 'Loop sekali, linear search', '10⁶ langkah'],
        ['O(n log n)', 'Linearitmik', '`Arrays.sort`, merge sort', '~2 × 10⁷ langkah'],
        ['O(n²)', 'Kuadratik', 'Dua loop bersarang, bubble sort', '10¹² langkah: tidak selesai dalam hitungan menit'],
        ['O(2ⁿ)', 'Eksponensial', 'Semua subset, Fibonacci rekursif naif', 'Hanya layak untuk n ≤ ~25'],
      ]),
      paragraph('**Best, average, worst case.** Linear search menemukan target di indeks pertama (best O(1)) atau tidak menemukannya sama sekali (worst O(n)). Quicksort rata-rata O(n log n) tetapi O(n²) bila pivot selalu buruk. Saat interview atau desain sistem, yang biasanya ditanyakan adalah **worst case** (jaminan) dan **average case** (perilaku umum); sebutkan mana yang kamu maksud.'),
      code('Biaya tersembunyi yang sering membuat kode O(n²)', `// 1) String += di dalam loop: setiap += menyalin seluruh string lama → O(n²) karakter disalin
String csv = "";
for (String s : items) csv += s + ",";

var sb = new StringBuilder();                      // total O(n)
for (String s : items) sb.append(s).append(',');
String csvFast = sb.toString();                    // atau String.join(",", items)

// 2) List.contains di dalam loop → O(n · m)
List<Integer> blocked = loadBlockedIds();          // m elemen
for (Order o : orders)                             // n order
    if (blocked.contains(o.userId())) skip(o);     // contains = linear search O(m)

Set<Integer> blockedSet = new HashSet<>(blocked);  // sekali O(m)
for (Order o : orders)
    if (blockedSet.contains(o.userId())) skip(o);  // O(1) rata-rata → total O(n + m)

// 3) ArrayList.remove(0) menggeser semua elemen → O(n) per operasi, O(n²) total
List<Task> queue = new ArrayList<>(tasks);
while (!queue.isEmpty()) process(queue.remove(0));

Deque<Task> deque = new ArrayDeque<>(tasks);
while (!deque.isEmpty()) process(deque.pollFirst()); // O(1) per operasi

// 4) LinkedList.get(i) berjalan dari ujung list → loop berindeks menjadi O(n²)
for (int i = 0; i < linked.size(); i++) use(linked.get(i));
for (var x : linked) use(x);                        // iterator: O(n)`, 'java'),
      paragraph('**Amortized analysis.** `ArrayList` menyimpan elemen di array berkapasitas tetap. Saat penuh, ia membuat array baru yang lebih besar dan menyalin semua elemen (O(n)). Karena kapasitas tumbuh secara *geometris* (di OpenJDK sekitar 1,5×), penyalinan mahal itu makin jarang terjadi, sehingga biaya rata-rata per `add` tetap konstan. Javadoc `ArrayList` hanya menjamin bahwa *"adding an element has constant amortized time cost"*; faktor 1,5× adalah detail implementasi OpenJDK.'),
      code('Simulasi: total penyalinan saat ArrayList tumbuh', `public class GrowthDemo {
    public static void main(String[] args) {
        int capacity = 10, size = 0, n = 1_000_000;
        long copies = 0;
        for (int i = 0; i < n; i++) {
            if (size == capacity) {
                copies += size;                          // salin semua elemen ke array baru
                capacity = capacity + (capacity >> 1);   // tumbuh ~1,5× seperti OpenJDK
            }
            size++;
        }
        System.out.printf("n=%d, total salinan=%d, rata-rata per add=%.2f%n",
            n, copies, (double) copies / n);
        // Keluaran: rata-rata ~2,4 salinan per add, dan tetap konstan walau n diperbesar
    }
}`, 'java'),
      code('Space complexity: memori tambahan, termasuk call stack', `// Ruang O(n) di call stack: kedalaman rekursi = n
long sumRec(int[] a, int i) {
    if (i == a.length) return 0;
    return a[i] + sumRec(a, i + 1);   // n = 1_000_000 → kemungkinan besar StackOverflowError
}

// Ruang O(1) tambahan: hanya beberapa variabel
long sumIter(int[] a) {
    long total = 0;
    for (int x : a) total += x;
    return total;
}

// Ruang O(n): struktur bantu sebesar input (prefix sum)
int[] prefixSum(int[] a) {
    int[] p = new int[a.length + 1];
    for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
    return p;                          // sum(a[l..r]) = p[r + 1] - p[l] dalam O(1)
}`, 'java'),
      table(['Struktur (Java)', 'Akses / cari', 'Tambah', 'Hapus', 'Catatan'], [
        ['`int[]` / array', 'Indeks O(1), cari O(n)', '— (ukuran tetap)', '—', 'Cari O(log n) bila terurut + binary search'],
        ['`ArrayList`', '`get(i)` O(1), `contains` O(n)', 'Di akhir O(1) amortized, di tengah O(n)', 'Di akhir O(1), di tengah/awal O(n)', 'Pilihan default untuk list'],
        ['`LinkedList`', '`get(i)` O(n)', 'Di ujung O(1)', 'Di ujung O(1)', 'Jarang lebih cepat dari ArrayList/ArrayDeque dalam praktik'],
        ['`ArrayDeque`', 'Ujung O(1)', '`offer/push` O(1) amortized', '`poll/pop` O(1)', 'Pengganti `Stack` dan queue'],
        ['`HashMap` / `HashSet`', 'O(1) rata-rata', 'O(1) rata-rata', 'O(1) rata-rata', 'Bergantung pada `hashCode` yang baik'],
        ['`TreeMap` / `TreeSet`', 'O(log n)', 'O(log n)', 'O(log n)', 'Terurut; ada `floorKey`, `ceilingKey`, range'],
        ['`PriorityQueue`', '`peek` O(1)', '`offer` O(log n)', '`poll` O(log n), `remove(Object)` O(n)', 'Binary heap, lihat modul Heap'],
        ['`Arrays.sort` / `List.sort`', '—', '—', '—', 'O(n log n); objek memakai TimSort yang stabil'],
      ]),
      callout('tip', 'Membaca constraint soal', 'Patokan kasar: komputer menjalankan sekitar 10⁸ operasi sederhana per detik. Jadi n ≤ 20 masih boleh O(2ⁿ), n ≤ 5.000 masih boleh O(n²), sedangkan n ≤ 10⁵–10⁶ menuntut O(n log n) atau O(n). Constraint di soal sering menjadi petunjuk algoritma yang diharapkan.'),
      callout('warn', 'Big-O bukan stopwatch', 'Dua algoritma O(n) bisa berbeda 10× kecepatannya karena konstanta dan cache CPU. Contoh: iterasi `ArrayList` (memori bersebelahan) jauh lebih cepat daripada `LinkedList` (node tersebar di heap) walau keduanya O(n). Big-O untuk memilih pendekatan; profiler dan benchmark (JMH) untuk memutuskan detail.'),
      code('Soal latihan + solusi: dari O(n²) ke O(n)', `// Soal 1 — Two Sum: kembalikan indeks dua angka yang jumlahnya = target.
// Brute force: cek semua pasangan → O(n²) waktu, O(1) ruang.
// Optimal: simpan angka yang sudah dilihat di HashMap → O(n) waktu, O(n) ruang.
static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();      // nilai → indeks
    for (int i = 0; i < nums.length; i++) {
        Integer j = seen.get(target - nums[i]);
        if (j != null) return new int[]{j, i};
        seen.put(nums[i], i);
    }
    return new int[0];
}

// Soal 2 — Contains Duplicate: tiga pilihan dengan trade-off berbeda.
// a) Dua loop: O(n²) waktu, O(1) ruang (lihat hasDuplicate di atas)
// b) Sort lalu cek tetangga: O(n log n) waktu, O(1) ruang tambahan (tapi mengubah array)
// c) HashSet: O(n) waktu, O(n) ruang
static boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums)
        if (!seen.add(x)) return true;                  // add() false → sudah ada
    return false;
}`, 'java'),
      ...quiz([
        ['DSA-01', 'Berapa time complexity kode ini? `for (int i = 1; i < n; i *= 2) for (int j = 0; j < i; j++) ops++;`', 'O(n), bukan O(n log n). Loop luar berjalan log n kali, tetapi loop dalam berjalan i kali dengan i = 1, 2, 4, 8, … sampai < n. Totalnya 1 + 2 + 4 + … < 2n, deret geometri yang dibatasi 2n. Pelajaran: jangan langsung mengalikan jumlah iterasi loop luar dan loop dalam bila batas loop dalam bergantung pada loop luar; jumlahkan iterasinya.'],
        ['DSA-02', 'Mengapa `ArrayList.add` disebut O(1) amortized padahal kadang memicu penyalinan O(n)?', 'Karena kapasitas tumbuh secara geometris (dikali faktor tetap, bukan ditambah konstanta). Setelah penyalinan sebesar k, baru akan ada penyalinan berikutnya setelah sekitar k/2 penambahan lagi, sehingga total biaya penyalinan untuk n add adalah O(n), atau O(1) per add bila dirata-rata. Bila kapasitas hanya ditambah 10 setiap penuh, totalnya menjadi O(n²). Jika ukuran akhir diketahui, `new ArrayList<>(expectedSize)` menghilangkan penyalinan sama sekali.'],
        ['DSA-03', 'Fibonacci rekursif naif `fib(n) = fib(n-1) + fib(n-2)`: berapa time dan space complexity-nya, dan bagaimana memperbaikinya?', 'Waktu eksponensial, O(2ⁿ) sebagai batas atas (lebih tepatnya sekitar O(1,618ⁿ)), karena subproblem yang sama dihitung berulang kali. Ruang O(n) karena kedalaman call stack maksimal n, bukan jumlah total panggilan. Dengan memoization atau loop bottom-up dengan dua variabel, waktunya menjadi O(n), dan ruangnya O(1) untuk versi loop. Lihat modul [Dynamic Programming](#java.dynamic-programming).'],
      ]),
      ...practice('dsa-big-o', [
        'Tulis Big-O (time dan space) untuk 5 method di salah satu proyekmu, termasuk biaya tersembunyi seperti `contains` pada List atau `String +=` di loop.',
        'Jalankan GrowthDemo dengan n = 10⁴, 10⁶, 10⁷ dan buktikan rata-rata salinan per add tetap konstan; ubah kebijakan menjadi `capacity + 10` lalu bandingkan.',
        'Ukur waktu `hasDuplicate` (O(n²)) vs `containsDuplicate` (O(n)) untuk n = 10³, 10⁴, 10⁵ dengan `System.nanoTime()` dan catat rasionya.',
        'Untuk setiap baris tabel koleksi Java di atas, tunjukkan kalimat pendukungnya di Javadoc resmi (`ArrayList`, `HashMap`, `TreeMap`, `PriorityQueue`).',
      ]),
      references(['Algorithms 4th Ed. — Analysis of Algorithms', 'https://algs4.cs.princeton.edu/14analysis/'], ['Javadoc ArrayList (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html'], ['Javadoc HashMap (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html'], ['Javadoc TreeMap (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html']),
    ],
  },
  {
    id: 'dsa-heap-priority-queue',
    title: 'Heap & Priority Queue',
    summary: 'Binary heap di dalam array, sift up/down, implementasi sendiri vs PriorityQueue, lalu pola top-K, merge k sorted lists, dan median stream.',
    track: STRUKTUR, source: dsaExtraSource, duration: '2–2,5 jam', level: 'Med',
    blocks: [
      paragraph('Banyak masalah hanya butuh **elemen terkecil (atau terbesar) saat ini**, bukan seluruh data dalam keadaan terurut: job scheduler yang mengambil tugas berprioritas tertinggi, Dijkstra yang mengambil node dengan jarak terkecil, atau dashboard "10 produk terlaris". Sorting ulang setiap kali data masuk berbiaya O(n log n); **binary heap** melakukannya dalam O(log n) per operasi dan O(1) untuk melihat puncaknya.'),
      paragraph('Binary heap adalah *complete binary tree* yang disimpan di array tanpa pointer. Untuk node di indeks `i`: parent di `(i - 1) / 2`, anak kiri `2i + 1`, anak kanan `2i + 2`. **Min-heap property**: setiap parent ≤ anak-anaknya, sehingga minimum selalu di `a[0]`. Heap *tidak* terurut penuh; ia hanya menjamin hubungan parent–anak.'),
      code('Implementasi min-heap sendiri', `import java.util.Arrays;
import java.util.NoSuchElementException;

public class MinHeap {
    private int[] a = new int[16];
    private int size;

    public void push(int x) {                       // O(log n)
        if (size == a.length) a = Arrays.copyOf(a, size * 2);
        a[size] = x;
        siftUp(size++);
    }

    public int peek() {                             // O(1)
        if (size == 0) throw new NoSuchElementException();
        return a[0];
    }

    public int pop() {                              // O(log n)
        int top = peek();
        a[0] = a[--size];                           // pindahkan elemen terakhir ke root
        siftDown(0);
        return top;
    }

    public int size() { return size; }

    private void siftUp(int i) {                    // naikkan selama lebih kecil dari parent
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (a[parent] <= a[i]) break;
            swap(i, parent);
            i = parent;
        }
    }

    private void siftDown(int i) {                  // turunkan ke anak terkecil
        while (true) {
            int left = 2 * i + 1, right = left + 1, smallest = i;
            if (left < size && a[left] < a[smallest]) smallest = left;
            if (right < size && a[right] < a[smallest]) smallest = right;
            if (smallest == i) return;
            swap(i, smallest);
            i = smallest;
        }
    }

    /** Heapify bottom-up dari array: O(n), bukan O(n log n). */
    public static MinHeap of(int[] values) {
        MinHeap h = new MinHeap();
        h.a = Arrays.copyOf(values, Math.max(16, values.length));
        h.size = values.length;
        for (int i = h.size / 2 - 1; i >= 0; i--) h.siftDown(i);   // mulai dari parent terakhir
        return h;
    }

    private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}`, 'java'),
      code('java.util.PriorityQueue: comparator dan jebakannya', `import java.util.*;

record Job(String name, int priority, long createdAt) {}

PriorityQueue<Integer> minHeap = new PriorityQueue<>();                       // default: min-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());

// Prioritas tertinggi dulu; bila seri, yang lebih dulu dibuat (FIFO)
PriorityQueue<Job> jobs = new PriorityQueue<>(
    Comparator.comparingInt(Job::priority).reversed()
              .thenComparingLong(Job::createdAt));

jobs.offer(new Job("kirim-email", 1, 100));
jobs.offer(new Job("bayar", 5, 200));
jobs.offer(new Job("refund", 5, 150));
while (!jobs.isEmpty()) System.out.println(jobs.poll().name());   // refund, bayar, kirim-email

// JEBAKAN 1: iterator dan toString() TIDAK terurut, hanya mengikuti array internal
minHeap.addAll(List.of(5, 1, 4, 2, 3));
System.out.println(minHeap);                    // di OpenJDK: [1, 2, 4, 5, 3], bukan urutan terurut
// Untuk urutan terurut: poll() berulang, atau salin ke List lalu sort

// JEBAKAN 2: comparator berbasis pengurangan bisa overflow
Comparator<Integer> bad  = (x, y) -> x - y;     // salah untuk Integer.MIN_VALUE vs 1
Comparator<Integer> good = Integer::compare;`, 'java'),
      table(['Operasi PriorityQueue', 'Kompleksitas', 'Keterangan'], [
        ['`offer`, `add`, `poll`, `remove()`', 'O(log n)', 'sift up / sift down'],
        ['`peek`, `element`, `size`', 'O(1)', 'Puncak selalu di indeks 0'],
        ['`remove(Object)`, `contains`', 'O(n)', 'Harus mencari linear; hindari di loop panas'],
        ['Iterasi / `toString`', 'O(n)', 'Urutan tidak dijamin terurut'],
      ]),
      code('Pola top-K: heap berukuran k', `// Kth Largest Element: simpan k elemen terbesar di MIN-heap; root = terbesar ke-k
static int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();          // buang yang terkecil
    }
    return heap.peek();
}
// Waktu O(n log k), ruang O(k)

// Top-K Frequent Elements
static List<Integer> topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int x : nums) freq.merge(x, 1, Integer::sum);

    PriorityQueue<Map.Entry<Integer, Integer>> heap =
        new PriorityQueue<>(Map.Entry.<Integer, Integer>comparingByValue());   // min-heap by frekuensi
    for (var e : freq.entrySet()) {
        heap.offer(e);
        if (heap.size() > k) heap.poll();
    }
    List<Integer> result = new ArrayList<>();
    while (!heap.isEmpty()) result.add(heap.poll().getKey());
    Collections.reverse(result);                    // paling sering di depan
    return result;
}
// Waktu O(n + u log k) dengan u = jumlah nilai unik, ruang O(u)`, 'java'),
      code('Merge k sorted lists', `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

static ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
    for (ListNode head : lists) if (head != null) heap.offer(head);   // satu kandidat per list

    ListNode dummy = new ListNode(0), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode smallest = heap.poll();
        tail.next = smallest;
        tail = smallest;
        if (smallest.next != null) heap.offer(smallest.next);       // ganti dengan penerusnya
    }
    return dummy.next;
}
// N = total node, k = jumlah list → waktu O(N log k), ruang O(k) untuk heap`, 'java'),
      code('Median dari data stream: dua heap', `class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder()); // max-heap: separuh kecil
    private final PriorityQueue<Integer> high = new PriorityQueue<>();                         // min-heap: separuh besar

    public void addNum(int num) {                  // O(log n)
        low.offer(num);
        high.offer(low.poll());                    // jaga max(low) <= min(high)
        if (high.size() > low.size()) low.offer(high.poll());   // low boleh lebih 1 elemen
    }

    public double findMedian() {                   // O(1)
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (long) high.peek()) / 2.0;          // long: cegah overflow
    }
}
// addNum 1, 2 → 1.5; addNum 3 → 2.0`, 'java'),
      table(['Cara mencari top-K dari n elemen', 'Waktu', 'Ruang', 'Kapan dipakai'], [
        ['Sort lalu ambil k', 'O(n log n)', 'O(1)–O(n)', 'Data kecil, kode paling sederhana'],
        ['Heap berukuran k', 'O(n log k)', 'O(k)', 'Data stream / tidak muat memori, k kecil'],
        ['Quickselect', 'O(n) rata-rata, O(n²) worst', 'O(1)', 'Satu kali query pada array di memori'],
        ['`TreeMap` berukuran k', 'O(n log k)', 'O(k)', 'Butuh hapus elemen sembarang dalam O(log k)'],
      ]),
      callout('warn', 'Jangan ubah elemen yang sudah di dalam heap', 'PriorityQueue hanya memeriksa urutan saat `offer` dan `poll`. Bila field yang dipakai comparator diubah setelah elemen masuk, heap property rusak secara diam-diam. Untuk "decrease key", masukkan entri baru dan abaikan entri basi saat di-poll (lazy deletion), seperti pada Dijkstra.'),
      callout('tip', 'Min-heap untuk K terbesar', 'Intuisinya terbalik: untuk menyimpan K elemen **terbesar**, pakai **min-heap** berukuran K, karena yang perlu dibuang setiap kali adalah yang terkecil di antara kandidat. Untuk K terkecil, pakai max-heap.'),
      ...quiz([
        ['DSA-04', 'Mengapa heapify bottom-up (`MinHeap.of`) hanya O(n), padahal ada n/2 pemanggilan siftDown yang masing-masing O(log n)?', 'Karena sebagian besar node berada di level bawah dan hanya bisa turun sedikit. Sekitar n/2 node adalah daun (tidak diproses), n/4 node turun paling banyak 1 level, n/8 node paling banyak 2 level, dan seterusnya. Jumlah n/4·1 + n/8·2 + n/16·3 + … konvergen ke O(n). Sebaliknya, memasukkan n elemen satu per satu dengan push memang O(n log n).'],
        ['DSA-05', 'Soal: K Closest Points to Origin. Diberikan `int[][] points` dan k, kembalikan k titik terdekat ke (0,0). Tulis pendekatan dan kompleksitasnya.', 'Pakai max-heap berukuran k dengan kunci jarak kuadrat `(long) x*x + (long) y*y` (tidak perlu `Math.sqrt`; `long` mencegah overflow). Comparator: `(p, q) -> Long.compare(dist(q), dist(p))`. Untuk setiap titik: `offer`, lalu bila `size() > k`, `poll` (membuang titik terjauh). Isi heap di akhir adalah jawabannya. Waktu O(n log k), ruang O(k). Alternatif quickselect memberi O(n) rata-rata.'],
        ['DSA-06', 'Kode Dijkstra memakai `pq.remove(node)` lalu `pq.offer(node)` setiap kali jarak node mengecil. Apa masalahnya?', '`remove(Object)` pada PriorityQueue adalah O(n), sehingga setiap relaksasi edge menjadi linear dan algoritma melambat menjadi sekitar O(V·E). Solusi umum: langsung `offer` pasangan (node, jarakBaru), lalu saat `poll` lewati entri bila jaraknya lebih besar dari `dist[node]` saat ini. Heap bisa berisi hingga O(E) entri, tetapi setiap operasi tetap O(log E).'],
      ]),
      ...practice('dsa-heap', [
        'Implementasikan `MinHeap` di atas, lalu uji dengan 10.000 angka acak: hasil `pop` berulang harus sama dengan `Arrays.sort`.',
        'Ubah `MinHeap` menjadi generik `Heap<T>` yang menerima `Comparator<T>` dan pakai untuk max-heap.',
        'Selesaikan LeetCode 215 (Kth Largest), 347 (Top K Frequent), dan 23 (Merge k Sorted Lists); tulis kompleksitas di komentar.',
        'Implementasikan `MedianFinder` dan uji dengan urutan menaik, menurun, dan berisi duplikat.',
      ]),
      references(['Javadoc PriorityQueue (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html'], ['Algorithms 4th Ed. — Priority Queues', 'https://algs4.cs.princeton.edu/24pq/'], ['LeetCode 295: Find Median from Data Stream', 'https://leetcode.com/problems/find-median-from-data-stream/']),
    ],
  },
  {
    id: 'dsa-trie',
    title: 'Trie (Prefix Tree)',
    summary: 'Struktur pohon per karakter untuk insert/search/prefix dalam O(panjang kata), autocomplete, dan Word Search II dengan pruning.',
    track: STRUKTUR, source: dsaExtraSource, duration: '1,5–2 jam', level: 'Med',
    blocks: [
      paragraph('`HashSet<String>` menjawab "apakah kata ini ada?" dengan cepat, tetapi tidak bisa menjawab "kata apa saja yang diawali `jav`?" tanpa memeriksa semua kata. **Trie** menyimpan kata karakter demi karakter di sepanjang jalur pohon, sehingga semua kata dengan prefix yang sama berbagi node. Insert, search, dan cek prefix berbiaya **O(L)** dengan L = panjang kata, *tidak bergantung pada jumlah kata*.'),
      paragraph('Trie dipakai pada autocomplete kolom pencarian, spell checker, filter kata, dan *longest prefix match* pada routing IP. Setiap node menyimpan anak per karakter dan penanda `end` bahwa jalur sampai node itu membentuk kata utuh. Tanpa `end`, kita tidak bisa membedakan kata `car` dari prefix kata `cart`.'),
      code('Trie dasar untuk huruf a–z', `public class Trie {
    private static final class Node {
        final Node[] next = new Node[26];   // satu slot per huruf
        boolean end;                         // ada kata yang berakhir di sini
    }

    private final Node root = new Node();

    public void insert(String word) {        // O(L)
        Node cur = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (cur.next[c] == null) cur.next[c] = new Node();
            cur = cur.next[c];
        }
        cur.end = true;
    }

    public boolean search(String word) {     // O(L): kata utuh
        Node n = walk(word);
        return n != null && n.end;
    }

    public boolean startsWith(String prefix) {   // O(L): cukup jalurnya ada
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node cur = root;
        for (int i = 0; i < s.length() && cur != null; i++) cur = cur.next[s.charAt(i) - 'a'];
        return cur;
    }
}
// Karakter di luar a–z akan melempar ArrayIndexOutOfBoundsException: validasi atau pakai Map`, 'java'),
      code('Autocomplete: TreeMap per node, hitung prefix, saran berurutan', `import java.util.*;

public class Autocomplete {
    private static final class Node {
        final TreeMap<Character, Node> children = new TreeMap<>();  // terurut → saran alfabetis
        int prefixCount;                                             // jumlah kata yang melewati node
        boolean end;
    }

    private final Node root = new Node();

    public void add(String word) {
        String w = word.toLowerCase();
        Node existing = find(w);
        if (existing != null && existing.end) return;      // kata duplikat tidak dihitung dua kali
        Node cur = root;
        for (char ch : w.toCharArray()) {
            cur = cur.children.computeIfAbsent(ch, k -> new Node());
            cur.prefixCount++;
        }
        cur.end = true;
    }

    public int countPrefix(String prefix) {                // O(P)
        Node n = find(prefix.toLowerCase());
        return n == null ? 0 : n.prefixCount;
    }

    public List<String> suggest(String prefix, int limit) {
        List<String> out = new ArrayList<>();
        String p = prefix.toLowerCase();
        Node start = find(p);
        if (start != null) collect(start, new StringBuilder(p), out, limit);
        return out;
    }

    private void collect(Node node, StringBuilder path, List<String> out, int limit) {
        if (out.size() >= limit) return;                    // berhenti lebih awal
        if (node.end) out.add(path.toString());
        for (var e : node.children.entrySet()) {
            if (out.size() >= limit) return;
            path.append(e.getKey());
            collect(e.getValue(), path, out, limit);
            path.deleteCharAt(path.length() - 1);           // backtrack
        }
    }

    private Node find(String s) {
        Node cur = root;
        for (char ch : s.toCharArray()) {
            cur = cur.children.get(ch);
            if (cur == null) return null;
        }
        return cur;
    }
}

// var ac = new Autocomplete();
// List.of("java", "javascript", "jar", "jakarta", "kotlin").forEach(ac::add);
// ac.suggest("ja", 3)    → [jakarta, jar, java]
// ac.countPrefix("jav")  → 2`, 'java'),
      code('Word Search II: trie + backtracking di grid', `// LeetCode 212: temukan semua kata dari daftar yang bisa dibentuk di board (gerak 4 arah, sel tidak dipakai ulang)
public List<String> findWords(char[][] board, String[] words) {
    Node root = new Node();
    for (String w : words) {                       // bangun trie; simpan kata utuh di node akhir
        Node cur = root;
        for (char ch : w.toCharArray()) {
            int i = ch - 'a';
            if (cur.next[i] == null) cur.next[i] = new Node();
            cur = cur.next[i];
        }
        cur.word = w;
    }
    List<String> found = new ArrayList<>();
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            dfs(board, r, c, root, found);
    return found;
}

private void dfs(char[][] board, int r, int c, Node parent, List<String> found) {
    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) return;
    char ch = board[r][c];
    if (ch == '#' || parent.next[ch - 'a'] == null) return;   // sedang dipakai / prefix tidak ada → pangkas
    Node node = parent.next[ch - 'a'];
    if (node.word != null) {
        found.add(node.word);
        node.word = null;                          // cegah kata yang sama ditambahkan dua kali
    }
    board[r][c] = '#';                             // tandai dipakai di jalur ini
    dfs(board, r + 1, c, node, found);
    dfs(board, r - 1, c, node, found);
    dfs(board, r, c + 1, node, found);
    dfs(board, r, c - 1, node, found);
    board[r][c] = ch;                              // backtrack
}

private static final class Node {
    final Node[] next = new Node[26];
    String word;
}
// Bangun trie O(total karakter). Pencarian worst case O(R·C·4·3^(L-1)), L = panjang kata terpanjang;
// dalam praktik trie memangkas jalur yang bukan prefix kata mana pun.`, 'java'),
      code('Kadang tidak perlu trie: prefix query dengan TreeSet', `TreeSet<String> words = new TreeSet<>(List.of("jakarta", "jar", "java", "javascript", "kotlin"));
for (String w : words.tailSet("jav", true)) {      // mulai dari kata pertama >= "jav"
    if (!w.startsWith("jav")) break;               // kata terurut: begitu tidak cocok, selesai
    System.out.println(w);                         // java, javascript
}
// O(log n) untuk menemukan awal + O(k) untuk k hasil. Cukup untuk ribuan kata statis.`, 'java'),
      table(['Kebutuhan', 'Trie', 'HashSet<String>', 'TreeSet<String>'], [
        ['Cek kata utuh', 'O(L)', 'O(L) rata-rata (hitung hash)', 'O(L · log n)'],
        ['Semua kata dengan prefix P', 'O(P + hasil)', 'O(n · L): scan semua', 'O(L · log n + hasil) lewat `tailSet`'],
        ['Hitung kata dengan prefix', 'O(P) dengan `prefixCount`', 'O(n · L)', 'O(hasil)'],
        ['Memori', 'Besar: satu node per karakter unik di jalur', 'Kecil', 'Sedang'],
      ]),
      callout('warn', 'Memori trie', 'Node dengan `Node[26]` menyimpan 26 referensi walau hanya 1–2 yang terpakai. Untuk jutaan kata atau alfabet Unicode, gunakan `HashMap`/`TreeMap` per node, atau varian terkompresi (radix tree) yang menggabungkan rantai node beranak tunggal.'),
      ...quiz([
        ['DSA-07', 'Soal: Replace Words (LeetCode 648). Diberikan kamus root `["cat","bat","rat"]` dan kalimat `"the cattle was rattled by the battery"`, ganti setiap kata dengan root terpendek yang menjadi prefix-nya. Jelaskan solusinya.', 'Masukkan semua root ke trie. Untuk setiap kata di kalimat, telusuri trie karakter demi karakter: begitu bertemu node dengan `end == true`, ganti kata dengan prefix sejauh itu (ini otomatis root terpendek); bila jalur putus sebelum ada `end`, pertahankan kata aslinya. Hasil: `"the cat was rat by the bat"`. Waktu O(total karakter root + total karakter kalimat), ruang O(total karakter root).'],
        ['DSA-08', 'Bagaimana menghapus kata dari trie tanpa merusak kata lain yang berbagi prefix?', 'Rekursif dari root: di node terakhir, set `end = false`. Saat kembali naik, sebuah node anak boleh dihapus (set referensinya ke null) hanya bila node itu tidak lagi `end` dan tidak punya anak sama sekali. Contoh: menghapus `cart` dari trie berisi `car` dan `cart` hanya membuang node `t`; node `r` dipertahankan karena `end` untuk `car`. Jika memakai `prefixCount`, kurangi juga di setiap node pada jalur. Waktu O(L).'],
        ['DSA-09', 'Mengapa Word Search II dengan trie jauh lebih cepat daripada menjalankan Word Search I untuk setiap kata?', 'Word Search I per kata mengulang DFS dari setiap sel untuk setiap kata: O(W · R · C · 3^L). Dengan trie, satu DFS dari setiap sel mencari semua kata sekaligus dan berhenti segera ketika jalur saat ini bukan prefix kata mana pun. Kata-kata dengan prefix sama berbagi penelusuran yang sama, dan menghapus `node.word` setelah ditemukan mencegah hasil ganda.'],
      ]),
      ...practice('dsa-trie', [
        'Implementasikan `Trie` dasar dan lulus LeetCode 208 (Implement Trie).',
        'Tambahkan method `delete(String)` sesuai jawaban DSA-08 dan uji dengan kata yang saling menjadi prefix (`car`, `cart`, `carton`).',
        'Bangun autocomplete untuk 10.000 nama produk; bandingkan waktu `suggest` vs scan `List<String>` dengan `startsWith`.',
        'Selesaikan LeetCode 212 (Word Search II) dan 648 (Replace Words) dengan kompleksitas tertulis.',
      ]),
      references(['Algorithms 4th Ed. — Tries', 'https://algs4.cs.princeton.edu/52trie/'], ['Javadoc TreeSet (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeSet.html'], ['LeetCode 208: Implement Trie', 'https://leetcode.com/problems/implement-trie-prefix-tree/'], ['LeetCode 212: Word Search II', 'https://leetcode.com/problems/word-search-ii/']),
    ],
  },
  {
    id: 'dsa-union-find',
    title: 'Union-Find (Disjoint Set Union)',
    summary: 'Mengelompokkan elemen ke himpunan saling lepas: path compression, union by rank, deteksi cycle, jumlah komponen, dan Kruskal.',
    track: STRUKTUR, source: dsaExtraSource, duration: '1,5–2 jam', level: 'Med',
    blocks: [
      paragraph('Bayangkan sistem pertemanan atau jaringan server: koneksi baru terus berdatangan, dan kamu berulang kali ditanya "apakah A dan B sudah terhubung?". Menjalankan BFS/DFS untuk setiap pertanyaan berbiaya O(V + E). **Union-Find** (Disjoint Set Union, DSU) menjawabnya hampir O(1) dengan dua operasi: `find(x)` mengembalikan *wakil* (root) himpunan x, dan `union(a, b)` menggabungkan dua himpunan.'),
      paragraph('Setiap himpunan disimpan sebagai pohon lewat array `parent`; dua elemen satu himpunan bila root-nya sama. Tanpa optimasi, pohon bisa memanjang seperti linked list sehingga `find` menjadi O(n). Dua optimasi membuatnya hampir konstan: **union by rank** (gantung pohon pendek ke pohon tinggi) dan **path compression** (saat `find`, arahkan semua node di jalur langsung ke root). Bersama-sama, biayanya O(α(n)) amortized, dengan α fungsi invers Ackermann yang tidak lebih dari 4 untuk ukuran input praktis.'),
      code('UnionFind lengkap', `public class UnionFind {
    private final int[] parent;
    private final int[] rank;          // batas atas tinggi pohon
    private int components;

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;   // awalnya setiap node root dirinya sendiri
    }

    /** Path compression: setiap node di jalur langsung menunjuk ke root. */
    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    /** Union by rank. Mengembalikan false bila a dan b sudah satu himpunan (edge ini membentuk cycle). */
    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                               // pohon pendek digantung ke yang tinggi
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
        return true;
    }

    public boolean connected(int a, int b) { return find(a) == find(b); }
    public int components() { return components; }
}

// Alternatif find iteratif (path halving), aman dari rekursi dalam:
// while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x;`, 'java'),
      code('Jumlah komponen dan deteksi cycle (graph tak berarah)', `// LeetCode 323: jumlah komponen terhubung; n node, edges[i] = {u, v}
static int countComponents(int n, int[][] edges) {
    UnionFind uf = new UnionFind(n);
    for (int[] e : edges) uf.union(e[0], e[1]);
    return uf.components();
}

// LeetCode 684 Redundant Connection: edge pertama yang membuat cycle (node bernomor 1..n)
static int[] findRedundantConnection(int[][] edges) {
    UnionFind uf = new UnionFind(edges.length + 1);
    for (int[] e : edges)
        if (!uf.union(e[0], e[1])) return e;     // kedua ujung sudah terhubung → edge ini menutup cycle
    return new int[0];
}
// Keduanya: waktu O(E · α(n)) ≈ O(E), ruang O(n)`, 'java'),
      code('Kruskal: MST dengan Union-Find', `record Edge(int u, int v, int weight) {}

/** Total bobot minimum spanning tree, atau -1 bila graph tidak terhubung. */
static long kruskal(int n, List<Edge> edges) {
    List<Edge> sorted = new ArrayList<>(edges);
    sorted.sort(Comparator.comparingInt(Edge::weight));   // O(E log E)
    UnionFind uf = new UnionFind(n);
    long total = 0;
    int used = 0;
    for (Edge e : sorted) {
        if (uf.union(e.u(), e.v())) {        // ambil edge termurah yang tidak membentuk cycle
            total += e.weight();
            if (++used == n - 1) break;      // MST punya tepat n-1 edge
        }
    }
    return used == n - 1 ? total : -1;
}
// Waktu O(E log E) didominasi sorting; Union-Find hanya O(E · α(n))`, 'java'),
      code('Soal + solusi: Satisfiability of Equality Equations', `// LeetCode 990: ["a==b", "b!=c", "c==a"] → false. Variabel huruf a–z.
// Kunci: proses semua "==" dulu (union), baru cek "!=" (tidak boleh satu himpunan).
static boolean equationsPossible(String[] equations) {
    UnionFind uf = new UnionFind(26);
    for (String eq : equations)
        if (eq.charAt(1) == '=') uf.union(eq.charAt(0) - 'a', eq.charAt(3) - 'a');
    for (String eq : equations)
        if (eq.charAt(1) == '!' && uf.connected(eq.charAt(0) - 'a', eq.charAt(3) - 'a'))
            return false;
    return true;
}
// Waktu O(n · α(26)) = O(n), ruang O(1) (array tetap 26)`, 'java'),
      table(['Varian', 'find (worst / amortized)', 'Catatan'], [
        ['Tanpa optimasi', 'O(n)', 'Pohon bisa menjadi rantai panjang'],
        ['Union by rank/size saja', 'O(log n)', 'Tinggi pohon dibatasi log n'],
        ['Path compression saja', 'O(log n) amortized', 'Jalur dipadatkan setelah dilalui'],
        ['Keduanya', 'O(α(n)) amortized', 'Praktis konstan; ini yang dipakai sehari-hari'],
      ]),
      table(['Kebutuhan', 'Union-Find', 'BFS / DFS'], [
        ['Edge datang bertahap, query konektivitas berulang', 'Sangat cocok', 'Harus diulang setiap query'],
        ['Menghapus edge', 'Tidak didukung', 'Bisa (bangun ulang / traversal ulang)'],
        ['Mencari jalur atau jarak antar node', 'Tidak bisa', 'Bisa'],
        ['Cycle pada graph berarah', 'Tidak bisa', 'Bisa (DFS tiga warna, algoritma Kahn)'],
      ]),
      callout('warn', 'Hanya untuk graph tak berarah', 'Union-Find tidak mengenal arah edge. Pada graph berarah, A→B dan C→B membuat A dan C satu himpunan padahal tidak ada cycle. Untuk cycle berarah, gunakan DFS tiga warna atau algoritma Kahn di modul [Algoritma Graf](#java.dsa-graph-algorithms).'),
      callout('tip', 'Key bukan angka', 'Untuk elemen berupa String (email, username), petakan dulu ke indeks dengan `Map<String, Integer> id = new HashMap<>()` dan `id.computeIfAbsent(key, k -> id.size())`, lalu jalankan UnionFind berbasis array. Ini pola standar untuk soal seperti Accounts Merge (LeetCode 721).'),
      ...quiz([
        ['DSA-10', 'Soal: Number of Provinces (LeetCode 547). Diberikan matriks `isConnected[n][n]`, hitung jumlah kelompok kota yang terhubung. Bagaimana solusinya dengan Union-Find?', 'Buat `UnionFind(n)`. Untuk setiap pasangan i < j dengan `isConnected[i][j] == 1`, panggil `union(i, j)`. Jawabannya `components()`. Waktu O(n² · α(n)) karena harus membaca seluruh matriks, ruang O(n). DFS dari setiap kota yang belum dikunjungi memberi kompleksitas yang sama; Union-Find lebih unggul bila koneksi datang satu per satu.'],
        ['DSA-11', 'Mengapa `union` mengembalikan boolean, dan bagaimana itu dipakai di Kruskal dan deteksi cycle?', 'Nilai false berarti kedua elemen sudah berada di himpunan yang sama sebelum digabung. Pada graph tak berarah, menambahkan edge di antara dua node yang sudah terhubung pasti menutup cycle. Kruskal memakai informasi ini untuk menolak edge yang akan membentuk cycle, dan Redundant Connection langsung mengembalikan edge tersebut.'],
        ['DSA-12', 'Apa risiko memakai `find` rekursif tanpa union by rank pada 10⁶ elemen?', 'Tanpa union by rank, urutan union yang buruk (mis. `union(i, i+1)` dengan arah gantung yang salah) bisa membuat rantai sepanjang n sebelum path compression sempat bekerja. Panggilan `find` rekursif pertama pada rantai itu sedalam 10⁶ dan memicu `StackOverflowError`. Solusinya: union by rank/size (tinggi ≤ log n ≈ 20) atau `find` iteratif dengan path halving.'],
      ]),
      ...practice('dsa-union-find', [
        'Implementasikan `UnionFind` dan uji: setelah `union(0,1)`, `union(2,3)`, `union(1,3)`, `connected(0,2)` true dan `components()` = n - 3.',
        'Selesaikan LeetCode 323, 547, 684, dan 990; tulis kompleksitas di komentar.',
        'Ganti union by rank dengan union by size, lalu tambahkan method `size(x)` yang mengembalikan ukuran himpunan x dalam O(α(n)).',
        'Implementasikan Kruskal dan bandingkan hasilnya dengan modul [Kruskal MST](#java.kruskal-s-minimum-spanning-tree-algorithm) pada graph contoh yang sama.',
      ]),
      references(['Algorithms 4th Ed. — Union-Find', 'https://algs4.cs.princeton.edu/15uf/'], ['cp-algorithms: Disjoint Set Union', 'https://cp-algorithms.com/data_structures/disjoint_set_union.html'], ['LeetCode 684: Redundant Connection', 'https://leetcode.com/problems/redundant-connection/']),
    ],
  },
  {
    id: 'dsa-graph-algorithms',
    title: 'Algoritma Graf: BFS/DFS sebagai Pola, Topological Sort & Shortest Path',
    summary: 'BFS di grid dan multi-source, topological sort (Kahn & DFS), deteksi cycle berarah, serta kapan memakai Dijkstra, Bellman-Ford, atau 0-1 BFS.',
    track: STRATEGI, source: dsaExtraSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Modul [Graph](#java.graph) sudah membahas representasi adjacency list, BFS, dan DFS dasar. Modul ini memperlakukan keduanya sebagai **pola** yang muncul berulang: grid adalah graph implisit (sel = node, tetangga = edge), urutan build atau prasyarat mata kuliah adalah **DAG** yang perlu diurutkan, dan "jarak terpendek" punya algoritma berbeda tergantung bobot edge-nya. Kesalahan memilih algoritma menghasilkan jawaban yang salah, bukan sekadar lambat.'),
      paragraph('Pegangan cepat: **BFS** memberi jarak terpendek bila semua edge berbobot sama; **DFS** cocok untuk eksplorasi, komponen, dan topological sort; **Dijkstra** untuk bobot non-negatif; **Bellman-Ford** bila ada bobot negatif. Semua traversal pada adjacency list berbiaya O(V + E).'),
      code('BFS di grid: jarak terpendek unweighted', `import java.util.*;

static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

// Jarak terpendek dari (sr, sc) ke (tr, tc); '#' = tembok. Semua langkah berbobot 1 → BFS optimal.
static int shortestPath(char[][] grid, int sr, int sc, int tr, int tc) {
    int rows = grid.length, cols = grid[0].length;
    int[][] dist = new int[rows][cols];
    for (int[] row : dist) Arrays.fill(row, -1);       // -1 = belum dikunjungi

    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{sr, sc});
    dist[sr][sc] = 0;
    while (!queue.isEmpty()) {
        int[] cur = queue.poll();
        int r = cur[0], c = cur[1];
        if (r == tr && c == tc) return dist[r][c];
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;              // tandai SAAT masuk queue, bukan saat keluar
            queue.offer(new int[]{nr, nc});
        }
    }
    return -1;
}
// Waktu dan ruang O(R · C)`, 'java'),
      code('Multi-source BFS: Rotting Oranges', `// LeetCode 994: 2 = busuk, 1 = segar. Setiap menit, busuk menular ke 4 tetangga.
// Semua sumber masuk queue sejak awal → BFS menyebar serentak dari banyak titik.
static int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length, fresh = 0;
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.offer(new int[]{r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    int minutes = 0;
    while (!queue.isEmpty() && fresh > 0) {
        for (int size = queue.size(); size > 0; size--) {      // satu level BFS = satu menit
            int[] cur = queue.poll();
            for (int[] d : DIRS) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.offer(new int[]{nr, nc});
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
// Waktu dan ruang O(R · C)`, 'java'),
      code('Topological sort: algoritma Kahn (BFS indegree)', `// LeetCode 210 Course Schedule II: prerequisites[i] = {course, harusDiambilDulu}
static int[] findOrder(int n, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] p : prerequisites) {
        adj.get(p[1]).add(p[0]);                 // edge: prasyarat → kursus
        indegree[p[0]]++;
    }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.offer(i);   // tanpa prasyarat

    int[] order = new int[n];
    int idx = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        order[idx++] = u;
        for (int v : adj.get(u))
            if (--indegree[v] == 0) queue.offer(v);   // semua prasyarat v sudah selesai
    }
    return idx == n ? order : new int[0];        // ada node tersisa → ada cycle
}
// Waktu dan ruang O(V + E)`, 'java'),
      code('Topological sort DFS + deteksi cycle berarah (tiga warna)', `// 0 = WHITE (belum), 1 = GRAY (sedang di stack rekursi), 2 = BLACK (selesai)
static List<Integer> topoSortDfs(List<List<Integer>> adj) {
    int n = adj.size();
    int[] color = new int[n];
    Deque<Integer> stack = new ArrayDeque<>();
    for (int u = 0; u < n; u++)
        if (color[u] == 0 && hasCycle(u, adj, color, stack))
            throw new IllegalStateException("graph punya cycle, tidak ada topological order");
    return new ArrayList<>(stack);               // urutan dari atas stack = reverse post-order
}

static boolean hasCycle(int u, List<List<Integer>> adj, int[] color, Deque<Integer> stack) {
    color[u] = 1;
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;          // back edge ke node GRAY → cycle berarah
        if (color[v] == 0 && hasCycle(v, adj, color, stack)) return true;
    }
    color[u] = 2;
    stack.push(u);                               // masuk setelah semua turunannya selesai
    return false;
}
// Waktu O(V + E). Node BLACK aman dilewati: semua jalurnya sudah terbukti bebas cycle.`, 'java'),
      code('Dijkstra (bobot ≥ 0) dan Bellman-Ford (boleh negatif)', `// Dijkstra dengan lazy deletion; adj.get(u) berisi {v, w}
static long[] dijkstra(List<List<int[]>> adj, int src) {
    long[] dist = new long[adj.size()];
    Arrays.fill(dist, Long.MAX_VALUE);
    dist[src] = 0;
    PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));
    pq.offer(new long[]{src, 0});
    while (!pq.isEmpty()) {
        long[] top = pq.poll();
        int u = (int) top[0];
        if (top[1] > dist[u]) continue;                    // entri basi, sudah ada jarak lebih baik
        for (int[] e : adj.get(u)) {
            long nd = dist[u] + e[1];
            if (nd < dist[e[0]]) {
                dist[e[0]] = nd;
                pq.offer(new long[]{e[0], nd});
            }
        }
    }
    return dist;
}
// O((V + E) log V) dengan binary heap

// Bellman-Ford: relaksasi semua edge V-1 kali; edges[i] = {u, v, w}
static long[] bellmanFord(int n, int[][] edges, int src) {
    final long inf = Long.MAX_VALUE / 2;
    long[] dist = new long[n];
    Arrays.fill(dist, inf);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++)
        for (int[] e : edges)
            if (dist[e[0]] != inf && dist[e[0]] + e[2] < dist[e[1]]) dist[e[1]] = dist[e[0]] + e[2];
    for (int[] e : edges)                                  // putaran ke-V masih bisa relaksasi?
        if (dist[e[0]] != inf && dist[e[0]] + e[2] < dist[e[1]])
            throw new IllegalStateException("ada negative cycle yang terjangkau dari src");
    return dist;
}
// O(V · E)`, 'java'),
      table(['Situasi', 'Algoritma', 'Kompleksitas'], [
        ['Semua edge berbobot sama (grid, jumlah langkah)', 'BFS', 'O(V + E)'],
        ['Bobot hanya 0 atau 1', '0-1 BFS dengan `ArrayDeque` (bobot 0 → `offerFirst`, bobot 1 → `offerLast`)', 'O(V + E)'],
        ['Bobot non-negatif', 'Dijkstra + `PriorityQueue`', 'O((V + E) log V)'],
        ['Ada bobot negatif / perlu deteksi negative cycle', 'Bellman-Ford', 'O(V · E)'],
        ['Graph berupa DAG (boleh bobot negatif)', 'Relaksasi dalam topological order', 'O(V + E)'],
        ['Jarak semua pasangan, V kecil (≤ ~400)', 'Floyd-Warshall', 'O(V³)'],
      ]),
      callout('warn', 'Tandai visited saat enqueue', 'Bila `visited` baru ditandai saat node di-poll, node yang sama bisa masuk queue berkali-kali dari banyak tetangga. Pada grid besar queue membengkak (bahkan bisa `OutOfMemoryError`) dan jarak tetap benar tapi kerjanya berlipat. Pengecualian: Dijkstra memang memeriksa saat poll, karena jarak node bisa membaik setelah ia masuk heap.'),
      callout('warn', 'Rekursi DFS dan StackOverflowError', 'DFS rekursif pada graph berbentuk rantai dengan 10⁵ node bisa melampaui stack default JVM. Untuk input besar, pakai DFS iteratif dengan `ArrayDeque` sebagai stack, gunakan Kahn untuk topological sort, atau jalankan di thread dengan stack besar: `new Thread(null, task, "dfs", 1 << 26)`.'),
      ...quiz([
        ['DSA-13', 'Mengapa Dijkstra bisa memberi jawaban salah bila ada edge berbobot negatif? Beri contoh kecil.', 'Dijkstra mengasumsikan bahwa node yang sudah di-poll dengan jarak terkecil tidak akan pernah mendapat jarak lebih kecil lagi. Edge negatif melanggar asumsi itu. Contoh: A→B (2), A→C (5), C→B (−4). Dijkstra mem-poll B dengan jarak 2 dan memfinalkannya, padahal A→C→B = 1. Bila ada node yang bergantung pada B, nilai jaraknya ikut salah. Gunakan Bellman-Ford, atau relaksasi dalam topological order bila graph berupa DAG.'],
        ['DSA-14', 'Soal: Durasi build minimum. Ada n task dengan `duration[i]` dan dependensi `{a, b}` (a harus selesai sebelum b). Bila task independen boleh berjalan paralel, berapa waktu minimum seluruh build? Tulis solusi dan kompleksitasnya.', 'Ini longest path pada DAG (critical path). Jalankan algoritma Kahn; simpan `finish[u]` = waktu selesai paling awal task u. Inisialisasi `finish[u] = duration[u]` untuk semua task. Saat memproses edge u→v: `finish[v] = max(finish[v], finish[u] + duration[v])`. Jawabannya `max(finish)`; bila Kahn tidak memproses semua node, ada cycle dan build mustahil. Waktu O(V + E), ruang O(V + E).'],
        ['DSA-15', 'Bagaimana mendeteksi cycle pada graph TAK berarah dengan DFS, dan mengapa cara tiga warna tidak langsung bisa dipakai?', 'Pada graph tak berarah, setiap edge u–v muncul dua arah, sehingga dari v kita pasti melihat kembali u yang masih GRAY dan salah menyimpulkan ada cycle. Solusinya: kirim `parent` di DFS dan abaikan tetangga yang sama dengan parent; cycle terdeteksi bila menemukan tetangga yang sudah visited dan bukan parent. Alternatif lebih ringkas: Union-Find, di mana `union` yang mengembalikan false berarti cycle. Keduanya O(V + E).'],
      ]),
      ...practice('dsa-graph', [
        'Tambahkan rekonstruksi jalur pada `shortestPath` grid: simpan parent setiap sel lalu cetak urutan koordinat dari start ke target.',
        'Selesaikan LeetCode 994 (Rotting Oranges), 207/210 (Course Schedule I/II), dan 743 (Network Delay Time); tulis kompleksitas di komentar.',
        'Implementasikan 0-1 BFS untuk LeetCode 1368 (Minimum Cost to Make at Least One Valid Path in a Grid).',
        'Buat graph contoh dengan negative cycle dan pastikan `bellmanFord` melempar exception, sementara Dijkstra memberi angka yang salah.',
      ]),
      references(['cp-algorithms: Breadth-first search', 'https://cp-algorithms.com/graph/breadth-first-search.html'], ['cp-algorithms: Topological sorting', 'https://cp-algorithms.com/graph/topological-sort.html'], ['cp-algorithms: Dijkstra', 'https://cp-algorithms.com/graph/dijkstra.html'], ['cp-algorithms: Bellman-Ford', 'https://cp-algorithms.com/graph/bellman_ford.html'], ['cp-algorithms: 0-1 BFS', 'https://cp-algorithms.com/graph/01_bfs.html']),
    ],
  },
  {
    id: 'dsa-binary-search-pattern',
    title: 'Binary Search sebagai Pola',
    summary: 'Template lower/upper bound yang bebas off-by-one, rotated sorted array, binary search on answer, dan perilaku Arrays.binarySearch.',
    track: STRATEGI, source: dsaExtraSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Binary search bukan hanya "cari angka di array terurut". Bentuk umumnya: **cari titik pertama di mana sebuah predikat monoton berubah dari false menjadi true**. Selama kamu bisa menulis `ok(x)` yang bernilai `false, false, …, false, true, true, …` sepanjang ruang pencarian, binary search menemukan batasnya dalam O(log n) evaluasi, baik ruangnya indeks array, kecepatan, kapasitas, maupun waktu.'),
      paragraph('Sumber bug binary search hampir selalu sama: batas `lo`/`hi`, kondisi loop `<` vs `<=`, dan update `mid` vs `mid ± 1`. Solusinya adalah memilih **satu template** dan memegang *invariant*-nya. Modul [Soal Searching](#java.soal-searching) sudah memuat latihan dasar (first/last occurrence, rotated search, sqrt); di sini kita menyatukannya menjadi pola.'),
      code('Template lower bound dan upper bound (rentang setengah terbuka)', `// lowerBound: indeks pertama dengan a[i] >= x (a.length bila tidak ada)
// Invariant: semua indeks < lo punya a[i] < x; semua indeks >= hi punya a[i] >= x
static int lowerBound(int[] a, int x) {
    int lo = 0, hi = a.length;            // rentang [lo, hi)
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;        // >>> aman dari overflow untuk lo, hi >= 0
        if (a[mid] < x) lo = mid + 1;     // jawaban pasti di kanan mid
        else hi = mid;                    // mid mungkin jawaban → pertahankan
    }
    return lo;                            // lo == hi
}

// upperBound: indeks pertama dengan a[i] > x
static int upperBound(int[] a, int x) {
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (a[mid] <= x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

int[] a = {1, 2, 2, 2, 5, 7};
int first = lowerBound(a, 2);                      // 1  (kemunculan pertama)
int last  = upperBound(a, 2) - 1;                  // 3  (kemunculan terakhir)
int count = upperBound(a, 2) - lowerBound(a, 2);   // 3  (jumlah kemunculan)
int ins   = lowerBound(a, 6);                      // 5  (posisi insert; a[5] = 7 ≠ 6 → 6 tidak ada)`, 'java'),
      code('Template umum: nilai terkecil yang memenuhi predikat', `import java.util.function.LongPredicate;

/** Nilai terkecil di [lo, hi] dengan ok(x) == true. Syarat: ok monoton (false...false true...true). */
static long firstTrue(long lo, long hi, LongPredicate ok) {
    while (lo < hi) {
        long mid = lo + (hi - lo) / 2;    // dibulatkan ke bawah
        if (ok.test(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;     // bila tidak ada yang true, hasilnya hi: pemanggil wajib memilih hi yang pasti true
}`, 'java'),
      code('Binary search on answer: Koko Eating Bananas & Ship Within D Days', `// LeetCode 875: kecepatan minimum k (pisang/jam) agar semua tumpukan habis dalam h jam
static int minEatingSpeed(int[] piles, int h) {
    int max = Arrays.stream(piles).max().orElseThrow();   // k = max pasti cukup (h >= piles.length)
    return (int) firstTrue(1, max, k -> {
        long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k;      // ceil(p / k) tanpa floating point
        return hours <= h;                                 // makin besar k, makin mudah → monoton
    });
}
// Waktu O(n log max), ruang O(1)

// LeetCode 1011: kapasitas kapal minimum agar semua paket (urutan tetap) terkirim dalam 'days' hari
static int shipWithinDays(int[] weights, int days) {
    long lo = Arrays.stream(weights).max().orElseThrow();      // minimal muat paket terberat
    long hi = Arrays.stream(weights).asLongStream().sum();     // sekali angkut semua
    return (int) firstTrue(lo, hi, cap -> {
        int need = 1;
        long load = 0;
        for (int w : weights) {
            if (load + w > cap) { need++; load = 0; }          // greedy: mulai hari baru
            load += w;
        }
        return need <= days;
    });
}
// Waktu O(n log(sum)), ruang O(1)`, 'java'),
      code('Rotated sorted array: cari minimum', `// LeetCode 153: [4,5,6,7,0,1,2] → 0 (elemen unik)
static int findMin(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1;   // titik rotasi (minimum) di kanan mid
        else hi = mid;                            // mid..hi terurut → minimum di mid atau kirinya
    }
    return nums[lo];
}
// O(log n). Bandingkan dengan nums[hi], bukan nums[lo]: untuk array yang tidak dirotasi,
// nums[mid] > nums[lo] tidak memberi tahu arah minimum.
// Dengan duplikat (LeetCode 154): saat nums[mid] == nums[hi], lakukan hi-- → worst case O(n).`, 'java'),
      code('API JDK: Arrays.binarySearch dan TreeMap', `int[] sorted = {10, 20, 30, 40};
Arrays.binarySearch(sorted, 30);      // 2
Arrays.binarySearch(sorted, 25);      // -3, yaitu -(insertion point) - 1 dengan insertion point = 2
int r = Arrays.binarySearch(sorted, 25);
int insertAt = r >= 0 ? r : -r - 1;   // 2

// Javadoc: bila ada duplikat, TIDAK dijamin indeks mana yang ditemukan → pakai lowerBound sendiri.
// Array harus sudah terurut (dengan comparator yang sama); bila tidak, hasilnya tidak terdefinisi.

// Untuk data yang sering berubah, TreeMap memberi "binary search" O(log n) siap pakai
TreeMap<Integer, String> tiers = new TreeMap<>(Map.of(0, "Bronze", 1_000, "Silver", 5_000, "Gold"));
tiers.floorEntry(3_200).getValue();   // "Silver": kunci terbesar <= 3200
tiers.ceilingKey(3_200);              // 5000: kunci terkecil >= 3200`, 'java'),
      table(['Tujuan', 'Kondisi geser `lo = mid + 1`', 'Hasil `lo`'], [
        ['Lower bound (pertama ≥ x)', '`a[mid] < x`', 'Indeks pertama ≥ x, atau n'],
        ['Upper bound (pertama > x)', '`a[mid] <= x`', 'Indeks pertama > x, atau n'],
        ['Kemunculan terakhir x', 'Upper bound lalu − 1', 'Cek `a[i] == x` dulu'],
        ['Jawaban minimum yang memenuhi', '`!ok(mid)`', 'Nilai terkecil dengan ok = true'],
        ['Jawaban maksimum yang memenuhi', 'Ubah jadi minimum: cari pertama `!ok` lalu − 1', 'Hindari template `lo = mid` yang rawan loop tak berhenti'],
      ]),
      callout('warn', 'Overflow (lo + hi) / 2', 'Bila lo dan hi mendekati `Integer.MAX_VALUE`, `lo + hi` overflow menjadi negatif dan `mid` menjadi indeks negatif. Bug ini bertahun-tahun ada di `Arrays.binarySearch` JDK dan dipopulerkan oleh tulisan Joshua Bloch pada 2006. Gunakan `lo + (hi - lo) / 2` atau `(lo + hi) >>> 1` (hanya untuk lo, hi ≥ 0).'),
      callout('tip', 'Cara mengenali "binary search on answer"', 'Ciri soalnya: diminta nilai **minimum yang masih cukup** atau **maksimum yang masih aman** (kecepatan, kapasitas, jarak, waktu), dan mengecek satu kandidat jauh lebih mudah daripada langsung menghitung jawaban. Tulis dulu `ok(x)` dan buktikan monoton; sisanya template.'),
      ...quiz([
        ['DSA-16', 'Soal: First Bad Version (LeetCode 278). Versi 1..n; sejak versi tertentu semua versi rusak. API `isBadVersion(v)` mahal. Tulis solusinya.', 'Predikatnya `isBadVersion` sudah monoton (false…false true…true), jadi ini persis `firstTrue(1, n, v -> isBadVersion((int) v))`. Versi int: `int lo = 1, hi = n; while (lo < hi) { int mid = lo + (hi - lo) / 2; if (isBadVersion(mid)) hi = mid; else lo = mid + 1; } return lo;`. Pemakaian `lo + (hi - lo) / 2` penting karena n bisa mendekati `Integer.MAX_VALUE`. Waktu O(log n) panggilan API, ruang O(1).'],
        ['DSA-17', 'Mengapa loop `while (lo < hi) { int mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid - 1; }` bisa berjalan selamanya?', 'Saat hi = lo + 1, `mid` dibulatkan ke bawah menjadi lo. Bila `ok(mid)` true, `lo = mid` tidak mengubah apa pun dan loop tidak pernah menyempit. Template "cari maksimum" seperti ini harus memakai mid yang dibulatkan ke atas: `mid = lo + (hi - lo + 1) / 2`. Cara yang lebih aman: ubah soal menjadi "cari nilai pertama yang tidak ok" dengan template firstTrue, lalu kurangi 1.'],
        ['DSA-18', 'Soal: Split Array Largest Sum (LeetCode 410). Bagi array non-negatif menjadi k subarray berurutan sehingga jumlah terbesar di antara subarray sekecil mungkin. Bagaimana solusinya?', 'Ini soal yang sama dengan Ship Within D Days: jawaban ada di [max(nums), sum(nums)]. `ok(limit)` = jumlah subarray yang dibutuhkan bila setiap subarray diisi secara greedy tanpa melewati limit adalah ≤ k. Makin besar limit, makin sedikit potongan, sehingga ok monoton. Jawabannya `firstTrue(max, sum, ok)`. Waktu O(n log(sum)), ruang O(1). Pakai `long` untuk sum.'],
      ]),
      ...practice('dsa-binary-search', [
        'Tulis `lowerBound`/`upperBound` dan uji terhadap 1.000 array acak berisi duplikat dengan membandingkan hasilnya ke linear scan.',
        'Selesaikan LeetCode 34, 153, 875, dan 1011 hanya dengan template `firstTrue`/`lowerBound`; tulis kompleksitas di komentar.',
        'Selesaikan LeetCode 410 (Split Array Largest Sum) dan jelaskan di komentar mengapa predikatnya monoton.',
        'Tunjukkan dengan tes bahwa `Arrays.binarySearch` pada array berisi duplikat bisa mengembalikan indeks yang bukan kemunculan pertama.',
      ]),
      references(['Javadoc Arrays.binarySearch (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html'], ['Javadoc TreeMap (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html'], ['Google Research: Nearly All Binary Searches and Mergesorts are Broken', 'https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/'], ['cp-algorithms: Binary search', 'https://cp-algorithms.com/num_methods/binary_search.html']),
    ],
  },
  {
    id: 'dsa-bit-manipulation',
    title: 'Bit Manipulation',
    summary: 'Operator bitwise Java, trik umum (power of two, hitung bit, XOR, subset via bitmask), flag izin, dan jebakan signed shift.',
    track: STRATEGI, source: dsaExtraSource, duration: '1,5–2 jam', level: 'Med',
    blocks: [
      paragraph('Di balik `int` ada 32 bit, dan banyak masalah menjadi sangat ringkas bila dilihat per bit: menyimpan 32 flag boolean dalam satu kolom database, mengecek kelipatan dua dalam satu operasi, menemukan satu angka unik di antara pasangan tanpa memori tambahan, atau mewakili subset dari n ≤ 20 elemen sebagai satu angka untuk DP bitmask. Java memakai **two\'s complement** untuk bilangan bulat bertanda, sehingga ada beberapa jebakan khas yang perlu dipahami.'),
      code('Operator bitwise dan operasi pada bit ke-i', `int a = 0b1100, b = 0b1010;           // 12, 10
System.out.println(a & b);            // 8   (0b1000)  AND: 1 bila keduanya 1
System.out.println(a | b);            // 14  (0b1110)  OR: 1 bila salah satu 1
System.out.println(a ^ b);            // 6   (0b0110)  XOR: 1 bila berbeda
System.out.println(~a);               // -13           NOT: ~x == -x - 1 (two's complement)
System.out.println(a << 2);           // 48            geser kiri = kali 2^2 (selama tidak overflow)
System.out.println(a >> 1);           // 6             geser kanan aritmetika: pertahankan tanda
System.out.println(Integer.toBinaryString(-1 >>> 28));   // 1111: geser kanan logika, isi 0

int x = 0;
x |= (1 << 3);                        // set bit 3      → 8
boolean on = (x & (1 << 3)) != 0;     // cek bit 3      → true
x &= ~(1 << 3);                       // clear bit 3    → 0
x ^= (1 << 0);                        // toggle bit 0   → 1`, 'java'),
      table(['Operator', 'Arti', 'Contoh (8 bit terakhir)'], [
        ['`&`', 'AND', '`1100 & 1010 = 1000`'],
        ['`|`', 'OR', '`1100 | 1010 = 1110`'],
        ['`^`', 'XOR', '`1100 ^ 1010 = 0110`; `x ^ x = 0`, `x ^ 0 = x`'],
        ['`~`', 'NOT (semua bit dibalik)', '`~0 = -1`'],
        ['`<<`', 'Geser kiri, isi 0 dari kanan', '`1 << 4 = 16`'],
        ['`>>`', 'Geser kanan aritmetika (salin bit tanda)', '`-8 >> 1 = -4`'],
        ['`>>>`', 'Geser kanan logika (isi 0)', '`-8 >>> 1 = 2147483644`'],
      ]),
      code('Trik umum', `// Power of two: tepat satu bit 1. 8 = 1000, 7 = 0111 → 8 & 7 = 0
static boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }

static int lowestSetBit(int x) { return x & -x; }          // 12 (1100) → 4 (0100)
static int clearLowestSetBit(int x) { return x & (x - 1); } // 12 (1100) → 8 (1000)

// Brian Kernighan: loop sebanyak jumlah bit 1, bukan 32 kali
static int countBits(int x) {
    int count = 0;
    while (x != 0) { x &= x - 1; count++; }
    return count;                                          // sama dengan Integer.bitCount(x)
}

// Method bawaan JDK: lebih jelas dan sudah teruji
Integer.bitCount(0b1011);              // 3
Integer.numberOfTrailingZeros(8);      // 3
Integer.highestOneBit(100);            // 64
Long.bitCount(-1L);                    // 64`, 'java'),
      code('XOR: Single Number, Missing Number, Single Number III', `// LeetCode 136: semua angka muncul dua kali kecuali satu. Pasangan saling menghapus (x ^ x = 0).
static int singleNumber(int[] nums) {
    int r = 0;
    for (int n : nums) r ^= n;
    return r;
}   // waktu O(n), ruang O(1)

// LeetCode 268: angka 0..n dengan tepat satu yang hilang
static int missingNumber(int[] nums) {
    int r = nums.length;                         // mulai dari n
    for (int i = 0; i < nums.length; i++) r ^= i ^ nums[i];
    return r;                                    // semua indeks dan nilai berpasangan kecuali yang hilang
}   // waktu O(n), ruang O(1); versi jumlah (n(n+1)/2 - sum) rawan overflow untuk n besar

// LeetCode 260: tepat dua angka muncul sekali, sisanya dua kali
static int[] singleNumberIII(int[] nums) {
    int xor = 0;
    for (int n : nums) xor ^= n;                 // = a ^ b, pasti tidak 0
    int diff = xor & -xor;                       // bit terendah tempat a dan b berbeda
    int a = 0;
    for (int n : nums) if ((n & diff) != 0) a ^= n;   // kelompokkan berdasarkan bit itu
    return new int[]{a, xor ^ a};
}   // waktu O(n), ruang O(1)`, 'java'),
      code('Subset via bitmask dan flag izin', `// Semua subset dari n elemen: mask 0 .. 2^n - 1, bit i menyala = elemen i diambil
static List<List<String>> subsets(List<String> items) {
    int n = items.size();                        // n <= 30 agar 1 << n masih muat di int
    List<List<String>> result = new ArrayList<>();
    for (int mask = 0; mask < (1 << n); mask++) {
        List<String> subset = new ArrayList<>();
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) != 0) subset.add(items.get(i));
        result.add(subset);
    }
    return result;                               // waktu O(n · 2^n)
}

// Enumerasi semua submask non-kosong dari sebuah mask (sering dipakai di DP bitmask)
int mask = 0b1011;
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    System.out.println(Integer.toBinaryString(sub));   // 1011, 1010, 1001, 1000, 11, 10, 1
}

// Flag izin: ringkas untuk satu kolom INT di database
static final int READ = 1, WRITE = 1 << 1, DELETE = 1 << 2;
int perms = READ | WRITE;
boolean canDelete = (perms & DELETE) != 0;       // false
perms |= DELETE;                                 // beri izin
perms &= ~WRITE;                                 // cabut izin

// Di kode domain, EnumSet lebih mudah dibaca; Javadoc-nya menyebut representasi internal bit vector
enum Permission { READ, WRITE, DELETE }
EnumSet<Permission> p = EnumSet.of(Permission.READ, Permission.WRITE);
p.contains(Permission.DELETE);                   // false`, 'java'),
      code('Jebakan khas Java', `// 1) >> menyalin bit tanda, >>> mengisi 0
System.out.println(-8 >> 1);     // -4
System.out.println(-8 >>> 1);    // 2147483644

// 2) Jarak shift dimodulo: int memakai 5 bit terbawah (& 31), long 6 bit (& 63)
System.out.println(1 << 32);     // 1, bukan 0!
System.out.println(1 << 31);     // -2147483648 (menyentuh bit tanda)
long big = 1 << 40;              // SALAH: dihitung sebagai int (40 & 31 = 8) → 256
long ok  = 1L << 40;             // 1099511627776

// 3) byte/short dipromosikan ke int dengan sign extension sebelum dioperasikan
byte b = (byte) 0xF0;            // -16
System.out.println(b >> 4);               // -1
System.out.println((b & 0xFF) >>> 4);     // 15 → mask dulu dengan 0xFF untuk byte "unsigned"

// 4) Prioritas: == lebih kuat daripada &
int n = 6;
// if (n & 1 == 0) { }           // error kompilasi: int & boolean
if ((n & 1) == 0) { /* genap */ }

// 5) Bilangan negatif
System.out.println(-7 % 2);                       // -1 → (x % 2 == 1) salah untuk ganjil negatif
System.out.println(Math.abs(Integer.MIN_VALUE));  // -2147483648 (overflow; -MIN_VALUE == MIN_VALUE)`, 'java'),
      callout('warn', 'Geser 1 harus bertipe long untuk bit ≥ 31', '`1 << i` bertipe `int`. Untuk mask 64 bit, tulis `1L << i`; bila tidak, bit 32 ke atas "berputar" kembali ke bit rendah tanpa error kompilasi maupun exception. Bug ini sering muncul di DP bitmask dan bitset buatan sendiri; untuk bitset besar, pakai `java.util.BitSet`.'),
      callout('tip', 'Kapan tidak perlu trik bit', 'Di kode aplikasi, keterbacaan lebih penting: `EnumSet` untuk flag, `BitSet` untuk himpunan angka, dan `Integer.bitCount` daripada loop buatan sendiri. Simpan trik bit untuk bagian yang memang sempit memori atau sangat sering dijalankan, dan beri komentar.'),
      ...quiz([
        ['DSA-19', 'Soal: Counting Bits (LeetCode 338). Kembalikan array `ans[0..n]` dengan `ans[i]` = jumlah bit 1 pada i, dalam O(n). Tulis solusinya.', '`int[] ans = new int[n + 1]; for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1); return ans;`. Alasannya: `i >> 1` adalah i tanpa bit terendah, yang jawabannya sudah dihitung karena lebih kecil dari i, lalu tambahkan bit terendah `i & 1`. Alternatif: `ans[i] = ans[i & (i - 1)] + 1`. Waktu O(n), ruang O(n) untuk output.'],
        ['DSA-20', 'Soal: Hamming Distance (LeetCode 461) dan Total Hamming Distance (LeetCode 477) untuk array `nums`. Jelaskan solusinya.', 'Hamming distance dua angka = jumlah posisi bit yang berbeda = `Integer.bitCount(x ^ y)`, O(1). Untuk total semua pasangan, membandingkan semua pasangan O(n²) terlalu lambat. Hitung per posisi bit: bila ada `ones` angka dengan bit k menyala, setiap pasangan (satu menyala, satu mati) menyumbang 1, jadi kontribusinya `ones * (n - ones)`. Jumlahkan untuk k = 0..31. Waktu O(32 · n) = O(n), ruang O(1).'],
        ['DSA-21', 'Mengapa `(lo + hi) >>> 1` tetap benar walau `lo + hi` overflow, sedangkan `(lo + hi) / 2` tidak?', 'Untuk lo, hi ≥ 0, jumlahnya paling besar 2³² − 2 dan selalu muat dalam 32 bit bila dibaca sebagai bilangan *unsigned*. Overflow hanya membuat bit tertinggi menyala sehingga Java menafsirkannya sebagai negatif. `>>> 1` menggeser dengan mengisi 0, sehingga hasilnya adalah pembagian unsigned yang benar. `/ 2` dan `>> 1` memperlakukan nilainya sebagai negatif dan menghasilkan mid negatif. Trik ini tidak berlaku bila lo atau hi bisa negatif.'],
      ]),
      ...practice('dsa-bits', [
        'Jalankan semua contoh di blok "Jebakan khas Java" dan cocokkan keluarannya dengan komentar.',
        'Selesaikan LeetCode 136, 191, 231, 268, dan 338 tanpa melihat solusi; tulis kompleksitas di komentar.',
        'Simpan izin user sebagai `int` di kolom database, lalu buat konverter dua arah ke `EnumSet<Permission>` beserta unit test.',
        'Selesaikan LeetCode 78 (Subsets) dengan bitmask lalu dengan backtracking; bandingkan keterbacaan dan kompleksitasnya.',
      ]),
      references(['JLS 21 §15.19 Shift Operators', 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.19'], ['Javadoc Integer (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html'], ['Javadoc EnumSet (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumSet.html'], ['Javadoc BitSet (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/BitSet.html']),
    ],
  },
];
