import type { Module } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const FOUNDATION = 'Fondasi';
const BUILD = 'Membangun Aplikasi';
const PRODUCTION = 'Menuju Produksi';

export const dartModernSource = 'Flutter & Dart: materi tambahan dari dokumentasi resmi dart.dev dan docs.flutter.dev (29 Oktober 2026); ditambah async Dart & isolate, go_router lanjutan, Firebase, lokalisasi, serta flavors & CI/CD dari docs.flutter.dev, firebase.google.com, dan pub.dev (2 November 2026)';

/** Ditambahkan ke track Flutter yang sudah ada; tidak membuat track baru. */
export const dartModernModules: Omit<Module, 'code'>[] = [
  {
    id: 'dart3-records-patterns-sealed',
    title: 'Dart 3 Mendalam: Records, Patterns & Sealed Class',
    summary: 'Memodelkan state UI dan hasil API dengan records, destructuring, switch expression, sealed class, dan extension type.',
    track: FOUNDATION, source: dartModernSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Dart 3 menambahkan fitur yang mengubah cara menulis kode Flutter: **records** untuk nilai kembali ganda tanpa class, **patterns** untuk destructuring dan validasi bentuk data, dan **sealed class** agar `switch` dicek kelengkapannya oleh compiler. Kombinasinya ideal untuk state loading/sukses/error.'),
      code('Records dan destructuring', `(int, String) ambilStatus() => (200, 'OK');

({double lat, double lng}) lokasiKantor() => (lat: -6.2, lng: 106.8);

void main() {
  final (kode, pesan) = ambilStatus();
  final (:lat, :lng) = lokasiKantor();       // destructuring named field
  print('$kode $pesan $lat,$lng');

  final json = {'user': {'nama': 'Ani', 'umur': 27}};
  if (json case {'user': {'nama': String nama, 'umur': int umur}}) {
    print('$nama berumur $umur');              // validasi bentuk JSON + cast sekaligus
  }
}`, 'dart'),
      code('Sealed class untuk state + switch expression', `sealed class TransaksiState {}

final class Memuat extends TransaksiState {}

final class Berhasil extends TransaksiState {
  Berhasil(this.items);
  final List<String> items;
}

final class Gagal extends TransaksiState {
  Gagal(this.pesan);
  final String pesan;
}

Widget bangun(TransaksiState state) => switch (state) {
      Memuat() => const CircularProgressIndicator(),
      Berhasil(items: []) => const Text('Belum ada transaksi'),
      Berhasil(:final items) => ListView(children: [for (final i in items) Text(i)]),
      Gagal(:final pesan) => Text('Error: $pesan'),
    };  // tanpa default: menambah subclass baru memaksa semua switch diperbarui`, 'dart'),
      code('Pattern di switch dan extension type', `String kategoriUmur(int umur) => switch (umur) {
      < 13 => 'anak',
      >= 13 && < 18 => 'remaja',
      _ => 'dewasa',
    };

// Extension type: pembungkus tanpa biaya runtime agar ID tidak tertukar
extension type UserId(int value) {}
extension type OrderId(int value) {}

void hapusPesanan(UserId user, OrderId order) {}
// hapusPesanan(OrderId(1), UserId(2));  // error kompilasi: tipe tertukar`, 'dart'),
      table(['Fitur', 'Versi Dart', 'Menggantikan'], [
        ['Records', '3.0', 'Class kecil atau List untuk nilai kembali ganda'],
        ['Patterns & switch expression', '3.0', 'Rantai if/is + cast manual'],
        ['Sealed / final / base / interface class', '3.0', 'Hierarki terbuka tanpa cek kelengkapan'],
        ['Extension types', '3.3', 'Class pembungkus yang menambah alokasi'],
      ]),
      ...quiz([
        ['DART-01', 'Mengapa sealed class lebih aman daripada enum + nullable field untuk state loading/sukses/error?', 'Dengan enum + field nullable, kombinasi tidak valid bisa terjadi (status sukses tapi data null). Sealed class membuat setiap state hanya membawa data yang relevan, dan switch tanpa default dicek kelengkapannya, sehingga state baru tidak terlupa ditangani di UI.'],
      ]),
      ...practice('dart3', ['Ubah state layar transaksi menjadi sealed class dan render dengan switch expression.', 'Parse respons JSON memakai if-case pattern, termasuk kasus bentuk JSON salah.', 'Bungkus ID user dan pesanan dengan extension type, lalu buktikan tipe tertukar menjadi error kompilasi.']),
      references(['Records', 'https://dart.dev/language/records'], ['Patterns', 'https://dart.dev/language/patterns'], ['Class modifiers', 'https://dart.dev/language/class-modifiers'], ['Extension types', 'https://dart.dev/language/extension-types']),
    ],
  },
  {
    id: 'flutter-pigeon-native',
    title: 'Integrasi Native dengan Pigeon (Platform Channel Type-Safe)',
    summary: 'Panggil API Android/iOS dari Dart dengan kontrak yang di-generate: HostApi, Kotlin, Swift, dan error handling.',
    track: BUILD, source: dartModernSource, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Ketika plugin yang ada tidak cukup (SDK pembayaran, perangkat khusus, API OS terbaru), Flutter berkomunikasi dengan kode native lewat **platform channel**. Menulis `MethodChannel` manual rawan typo nama method dan tipe argumen. **Pigeon** membuat kontrak di Dart lalu menghasilkan kode Dart, Kotlin, dan Swift yang bertipe.'),
      code('Terminal', `flutter pub add --dev pigeon
mkdir pigeons`, 'bash'),
      code('pigeons/device_api.dart — kontrak', `import 'package:pigeon/pigeon.dart';

@ConfigurePigeon(PigeonOptions(
  dartOut: 'lib/src/device_api.g.dart',
  kotlinOut: 'android/app/src/main/kotlin/com/example/kas/DeviceApi.g.kt',
  kotlinOptions: KotlinOptions(package: 'com.example.kas'),
  swiftOut: 'ios/Runner/DeviceApi.g.swift',
))
class BatteryInfo {
  BatteryInfo({required this.level, required this.charging});
  int level;
  bool charging;
}

@HostApi()
abstract class DeviceApi {
  @async
  BatteryInfo getBattery();
}`, 'dart'),
      code('Terminal — generate', `dart run pigeon --input pigeons/device_api.dart`, 'bash'),
      code('Android — MainActivity.kt', `package com.example.kas

import android.content.Context
import android.os.BatteryManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine

class DeviceApiImpl(private val context: Context) : DeviceApi {
    override fun getBattery(callback: (Result<BatteryInfo>) -> Unit) {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY).toLong()
        callback(Result.success(BatteryInfo(level = level, charging = bm.isCharging)))
    }
}

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        DeviceApi.setUp(flutterEngine.dartExecutor.binaryMessenger, DeviceApiImpl(this))
    }
}`, 'text'),
      code('iOS — AppDelegate.swift (potongan)', `class DeviceApiImpl: DeviceApi {
  func getBattery(completion: @escaping (Result<BatteryInfo, Error>) -> Void) {
    UIDevice.current.isBatteryMonitoringEnabled = true
    let level = Int64(UIDevice.current.batteryLevel * 100)
    let charging = UIDevice.current.batteryState == .charging
    completion(.success(BatteryInfo(level: level, charging: charging)))
  }
}

// di application(_:didFinishLaunchingWithOptions:)
let controller = window?.rootViewController as! FlutterViewController
DeviceApiSetup.setUp(binaryMessenger: controller.binaryMessenger, api: DeviceApiImpl())`, 'text'),
      code('Dart — memanggil API', `import 'package:flutter/services.dart';
import 'src/device_api.g.dart';

final _api = DeviceApi();

Future<String> statusBaterai() async {
  try {
    final info = await _api.getBattery();
    return '\${info.level}%\${info.charging ? ' (mengisi)' : ''}';
  } on PlatformException catch (e) {
    return 'Tidak tersedia: \${e.message}';
  }
}`, 'dart'),
      callout('tip', 'Kapan membuat plugin', 'Jika integrasi native dipakai di beberapa aplikasi, jadikan package plugin (`flutter create --template=plugin`) dengan Pigeon di dalamnya. Untuk satu aplikasi, kode native di folder android/ios sudah cukup.'),
      ...practice('flutter-pigeon', ['Kontrak Pigeon ter-generate untuk Dart, Kotlin, dan Swift.', 'Level baterai tampil di Android emulator dan iOS simulator/perangkat.', 'Error native dikembalikan sebagai PlatformException dan ditampilkan dengan pesan ramah.', 'Tambahkan method kedua ke kontrak dan generate ulang tanpa menyentuh kode channel manual.']),
      references(['Platform channels', 'https://docs.flutter.dev/platform-integration/platform-channels'], ['Pigeon', 'https://pub.dev/packages/pigeon'], ['Developing plugins', 'https://docs.flutter.dev/packages-and-plugins/developing-packages']),
    ],
  },
  {
    id: 'flutter-accessibility',
    title: 'Aksesibilitas Flutter: Semantics, Teks Besar & Pengujian',
    summary: 'Screen reader (TalkBack/VoiceOver), label semantik, skala teks, kontras, tap target, dan tes guideline otomatis.',
    track: PRODUCTION, source: dartModernSource, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('Aplikasi yang aksesibel bisa dipakai pengguna screen reader, pengguna dengan ukuran teks besar, dan pengguna dengan gangguan penglihatan warna. Flutter membangun **semantics tree** dari widget; tugasmu memastikan setiap elemen interaktif punya label yang jelas dan layout tetap utuh saat teks diperbesar.'),
      code('Label semantik', `// IconButton tanpa label dibacakan "button" saja; tooltip memberi label
IconButton(
  icon: const Icon(Icons.delete),
  tooltip: 'Hapus transaksi',
  onPressed: hapus,
);

// Gabungkan beberapa widget menjadi satu pengumuman yang bermakna
MergeSemantics(
  child: ListTile(
    leading: const Icon(Icons.restaurant),
    title: const Text('Makan siang'),
    trailing: const Text('Rp50.000'),
    onTap: buka,
  ),
);

// Elemen dekoratif tidak perlu dibacakan
const ExcludeSemantics(child: Icon(Icons.auto_awesome));

// Widget kustom: deskripsikan peran dan nilai
Semantics(
  label: 'Progres anggaran bulan ini',
  value: '72 persen',
  child: CustomPaint(painter: AnggaranPainter(0.72)),
);`, 'dart'),
      table(['Aspek', 'Cek', 'Target'], [
        ['Screen reader', 'Aktifkan TalkBack/VoiceOver dan navigasi semua layar', 'Setiap kontrol punya label & peran yang jelas'],
        ['Ukuran teks', 'Perbesar font sistem hingga maksimum', 'Tidak ada teks terpotong atau overflow'],
        ['Kontras', 'Teks vs latar belakang', 'Minimal 4.5:1 untuk teks normal'],
        ['Tap target', 'Ukuran area sentuh', 'Minimal 48×48 dp (Android) / 44×44 pt (iOS)'],
        ['Warna', 'Status tidak hanya dibedakan warna', 'Tambahkan ikon atau teks (mis. "gagal")'],
      ]),
      code('test/accessibility_test.dart — cek guideline otomatis', `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kas/main.dart';

void main() {
  testWidgets('layar utama memenuhi guideline aksesibilitas', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(const KasApp());

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await expectLater(tester, meetsGuideline(textContrastGuideline));
    handle.dispose();
  });

  testWidgets('tetap rapi dengan teks 2x', (tester) async {
    await tester.pumpWidget(MediaQuery(
      data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
      child: const KasApp(),
    ));
    expect(tester.takeException(), isNull);   // overflow memicu exception di tes
  });
}`, 'dart'),
      callout('tip', 'Alat bantu', 'Aktifkan `showSemanticsDebugger: true` di MaterialApp untuk melihat apa yang dibacakan screen reader. Di Android, gunakan aplikasi Accessibility Scanner; di iOS, Accessibility Inspector pada Xcode.'),
      ...practice('flutter-a11y', ['Navigasi alur tambah transaksi hanya dengan TalkBack atau VoiceOver.', 'Semua IconButton punya tooltip atau label semantik.', 'Tes guideline aksesibilitas lulus di CI.', 'Layar utama tidak overflow pada skala teks 2x.']),
      references(['Accessibility (Flutter)', 'https://docs.flutter.dev/ui/accessibility'], ['Accessibility testing', 'https://docs.flutter.dev/ui/accessibility/accessibility-testing'], ['Semantics class', 'https://api.flutter.dev/flutter/widgets/Semantics-class.html']),
    ],
  },
  {
    id: 'dart-async-stream-isolate',
    title: 'Async Dart Mendalam: Future, Stream & Isolate',
    summary: 'Event loop dan microtask, Future paralel dengan record .wait, timeout dan error, Stream single vs broadcast, StreamController, async*, serta Isolate.run dan compute untuk kerja berat.',
    track: FOUNDATION, source: dartModernSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Dart menjalankan kode di satu thread per **isolate** dengan sebuah **event loop**. `async`/`await` tidak membuat thread baru: saat menunggu I/O, fungsi ditangguhkan dan event loop melayani pekerjaan lain (gambar frame, sentuhan, respons HTTP). Karena itu I/O tidak membuat UI macet, tetapi komputasi berat (parsing JSON besar, kompresi gambar) tetap memblokir frame dan harus dipindah ke isolate lain.'),
      paragraph('Modul [Dasar Dart](#flutter.dasar-dart) sudah memperkenalkan `Future` dan `async`/`await`. Di sini kita masuk ke hal yang sering menjadi sumber bug di aplikasi nyata: urutan eksekusi, menjalankan beberapa request bersamaan, error yang hilang, Stream yang di-listen dua kali, dan jank akibat kerja berat di main isolate.'),
      code('Event loop: sinkron → microtask → event', `import 'dart:async';

Future<void> main() async {
  print('1 sinkron');
  Future(() => print('4 event queue'));          // dijadwalkan sebagai event (timer 0)
  scheduleMicrotask(() => print('3 microtask'));  // microtask selalu didahulukan dari event
  print('2 sinkron');
  await Future<void>.delayed(Duration.zero);      // beri kesempatan antrean berjalan
  print('5 setelah await');
}
// Output: 1, 2, 3, 4, 5`, 'dart'),
      code('Future bersamaan, timeout, dan error', `import 'dart:async';

Future<String> ambilProfil() async {
  await Future<void>.delayed(const Duration(milliseconds: 300));
  return 'Ani';
}

Future<int> ambilSaldo() async {
  await Future<void>.delayed(const Duration(milliseconds: 500));
  return 1250000;
}

Future<void> muatDashboard() async {
  // Berurutan (±800 ms):  final p = await ambilProfil(); final s = await ambilSaldo();
  try {
    // Bersamaan (±500 ms) — Dart 3: .wait pada record berisi Future, hasil tetap bertipe
    final (profil, saldo) = await (ambilProfil(), ambilSaldo()).wait.timeout(const Duration(seconds: 5));
    print('$profil: $saldo');
  } on TimeoutException {
    print('server terlalu lama merespons');
  } on ParallelWaitError catch (e) {
    print('sebagian request gagal: \${e.errors}');   // e.values berisi hasil yang berhasil
  }

  // Daftar Future bertipe sama: Future.wait
  final hasil = await Future.wait([ambilSaldo(), ambilSaldo()]);
  print(hasil);

  // Sengaja tidak ditunggu (fire-and-forget): tandai eksplisit agar lint unawaited_futures diam
  unawaited(kirimAnalitik('dashboard_dibuka'));
}

Future<void> kirimAnalitik(String event) async {}`, 'dart'),
      code('Stream: async*, single vs broadcast, StreamController', `import 'dart:async';

Stream<int> hitungMundur(int dari) async* {
  for (var i = dari; i >= 0; i--) {
    await Future<void>.delayed(const Duration(seconds: 1));
    yield i;                                          // memancarkan satu nilai
  }
}

class KeranjangService {
  final _controller = StreamController<List<String>>.broadcast();   // boleh banyak listener
  final _items = <String>[];

  Stream<List<String>> get items => _controller.stream;

  void tambah(String item) {
    _items.add(item);
    _controller.add(List.unmodifiable(_items));
  }

  Future<void> dispose() => _controller.close();     // wajib ditutup agar listener selesai
}

Future<void> main() async {
  await for (final n in hitungMundur(2)) {
    print('mundur $n');
  }

  final tunggal = hitungMundur(1);                    // single-subscription
  tunggal.listen(print);
  // tunggal.listen(print);  // StateError: Stream has already been listened to.

  final service = KeranjangService();
  final subA = service.items.listen((xs) => print('A: $xs'));
  final subB = service.items.map((xs) => xs.length).distinct().listen((n) => print('B: $n item'));
  service.tambah('kopi');
  service.tambah('roti');
  await Future<void>.delayed(Duration.zero);          // event broadcast dikirim secara asinkron

  await subA.cancel();                                // di widget: batalkan di dispose()
  await subB.cancel();
  await service.dispose();
}`, 'dart'),
      code('Isolate.run dan compute untuk kerja berat', `import 'dart:convert';
import 'dart:isolate';

import 'package:flutter/foundation.dart';

class Transaksi {
  Transaksi(this.judul, this.jumlah);
  factory Transaksi.fromJson(Map<String, dynamic> j) => Transaksi(j['judul'] as String, j['jumlah'] as int);
  final String judul;
  final int jumlah;
}

// Fungsi top-level/static: mudah dikirim ke isolate lain (tidak menangkap 'this' atau objek besar)
List<Transaksi> parseTransaksi(String body) {
  final list = jsonDecode(body) as List<dynamic>;
  return list.map((e) => Transaksi.fromJson(e as Map<String, dynamic>)).toList();
}

// Dart: menjalankan fungsi di isolate baru, hasilnya dikembalikan lalu isolate ditutup
Future<List<Transaksi>> parseDiIsolate(String body) => Isolate.run(() => parseTransaksi(body));

// Flutter: compute juga berjalan di web (di sana dieksekusi di thread yang sama karena web tidak punya isolate)
Future<List<Transaksi>> parseDenganCompute(String body) => compute(parseTransaksi, body);

// Untuk pekerja berumur panjang (mis. memproses banyak gambar berurutan) gunakan Isolate.spawn
// dengan ReceivePort/SendPort agar biaya membuat isolate tidak dibayar berulang kali.`, 'dart'),
      table(['Alat', 'Nilai', 'Listener', 'Pakai untuk'], [
        ['`Future<T>`', 'Satu nilai (atau error)', '—', 'Request HTTP, baca file, query database'],
        ['`Stream<T>` single-subscription', 'Banyak nilai berurutan', 'Tepat satu', 'Isi file, respons streaming, `async*`'],
        ['`Stream<T>` broadcast', 'Banyak nilai, tanpa buffer untuk yang terlambat', 'Banyak', 'Event aplikasi, status koneksi, perubahan keranjang'],
        ['`Isolate.run` / `compute`', 'Satu hasil dari isolate lain', '—', 'Parsing JSON besar, enkripsi, olah gambar sekali jalan'],
        ['`Isolate.spawn` + port', 'Pesan dua arah', '—', 'Pekerja latar berumur panjang'],
      ]),
      callout('warn', 'Error yang hilang', 'Future yang tidak di-`await` dan gagal akan menjadi *unhandled error*; di Flutter ditangkap `PlatformDispatcher.instance.onError` (pasang pelaporan crash di sana), tetapi logika pemanggil tidak pernah tahu. Aktifkan lint `unawaited_futures` dan `discarded_futures`, dan gunakan `unawaited()` hanya untuk yang memang disengaja. Selalu batalkan `StreamSubscription` di `dispose()` agar tidak ada `setState` setelah widget dibuang.'),
      callout('tip', 'Data antar isolate disalin', 'Isolate tidak berbagi memori: argumen dan hasil disalin (kecuali objek immutable tertentu dan `TransferableTypedData`). Mengirim objek sangat besar bisa memakan waktu sendiri, jadi kirim data mentah (String/bytes) lalu parse di isolate. Profil dulu dengan DevTools (tab Performance) sebelum memindahkan kerja ke isolate; detail di [Optimasi Performa](#flutter.optimasi-performa).'),
      ...quiz([
        ['DART-02', 'Apa beda `await a(); await b();` dengan `await (a(), b()).wait`?', 'Yang pertama berurutan: `b()` baru dimulai setelah `a()` selesai, sehingga total waktunya jumlah keduanya. Yang kedua memulai keduanya sekaligus dan menunggu sampai semuanya selesai, sehingga total waktunya kira-kira yang paling lama. Hasil `.wait` pada record tetap bertipe, dan bila ada yang gagal dilempar `ParallelWaitError`.'],
        ['DART-03', 'Mengapa listen dua kali ke stream dari `async*` melempar `StateError`, dan bagaimana solusinya?', 'Stream dari `async*` (dan `StreamController` biasa) adalah single-subscription: hanya boleh satu listener karena nilai diproduksi khusus untuk listener itu. Gunakan `StreamController.broadcast()`, ubah dengan `asBroadcastStream()`, atau buat stream baru untuk setiap listener.'],
        ['DART-04', 'Mengapa `jsonDecode` respons 5 MB membuat animasi patah walau dipanggil di fungsi `async`?', '`async` hanya membantu saat menunggu I/O; `jsonDecode` adalah komputasi sinkron yang berjalan di main isolate dan memblokir event loop, sehingga frame tidak sempat digambar (target 16 ms per frame di 60 Hz). Pindahkan ke `Isolate.run` atau `compute`.'],
      ]),
      ...practice('dart-async', [
        'Tulis ulang pemuatan dashboard yang berurutan menjadi bersamaan dengan record `.wait`, ukur waktunya dengan `Stopwatch`, dan tangani timeout.',
        'Buat `KeranjangService` dengan broadcast `StreamController`, tampilkan jumlah item dengan `StreamBuilder`, dan batalkan subscription di `dispose()`.',
        'Parse JSON 10.000 transaksi di main isolate lalu dengan `Isolate.run`; bandingkan jank di DevTools Performance.',
        'Aktifkan lint `unawaited_futures` di `analysis_options.yaml` dan perbaiki semua temuan.',
      ]),
      references(
        ['Dart: Asynchronous programming (async, await)', 'https://dart.dev/libraries/async/async-await'],
        ['Dart: Using streams', 'https://dart.dev/libraries/async/using-streams'],
        ['Dart: Creating streams', 'https://dart.dev/libraries/async/creating-streams'],
        ['Dart: Concurrency & isolates', 'https://dart.dev/language/concurrency'],
        ['Flutter: Concurrency and isolates', 'https://docs.flutter.dev/perf/isolates'],
      ),
    ],
  },
  {
    id: 'flutter-go-router-lanjutan',
    title: 'Navigasi Lanjutan dengan go_router: Shell Route, Deep Link & Guard',
    summary: 'StatefulShellRoute untuk bottom navigation dengan stack per tab, redirect guard autentikasi dengan refreshListenable, query parameter, halaman 404, serta App Links/Universal Links.',
    track: BUILD, source: dartModernSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Dasar go_router (rute bersarang, `context.go` vs `context.push`, redirect sederhana) sudah dibahas di [Membangun UI Nyata](#flutter.membangun-ui-nyata). Aplikasi produksi biasanya butuh lebih: **bottom navigation** yang mengingat posisi tiap tab, **guard** yang bereaksi otomatis saat pengguna login/logout, dan **deep link** dari email atau notifikasi yang membuka layar tertentu, lalu kembali ke layar asal setelah login.'),
      paragraph('Kunci go_router adalah URL sebagai sumber kebenaran navigasi: setiap layar punya alamat, sehingga deep link, tombol back di web, dan state restoration bekerja dengan sendirinya. Karena itu data yang menentukan layar (ID, filter) sebaiknya ditaruh di path atau query parameter, bukan di objek `extra`.'),
      code('Router: shell route, guard, query parameter, 404', `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AuthNotifier extends ChangeNotifier {
  bool _masuk = false;
  bool get masuk => _masuk;
  void login() { _masuk = true; notifyListeners(); }
  void logout() { _masuk = false; notifyListeners(); }
}

final auth = AuthNotifier();

final router = GoRouter(
  initialLocation: '/beranda',
  refreshListenable: auth,                      // redirect dievaluasi ulang setiap status login berubah
  redirect: (context, state) {
    final keLogin = state.matchedLocation == '/login';
    if (!auth.masuk) {
      return keLogin ? null : '/login?from=\${Uri.encodeComponent(state.uri.toString())}';
    }
    if (keLogin) {
      final from = state.uri.queryParameters['from'];
      return (from != null && from.startsWith('/')) ? from : '/beranda';   // hanya rute internal
    }
    return null;                                 // null = lanjutkan tanpa dialihkan
  },
  errorBuilder: (context, state) => HalamanTidakDitemukan(uri: state.uri),
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const HalamanLogin()),
    StatefulShellRoute.indexedStack(
      builder: (context, state, shell) => ScaffoldDenganNav(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/beranda',
            builder: (context, state) => const HalamanBeranda(),
            routes: [
              GoRoute(
                path: 'transaksi/:id',               // → /beranda/transaksi/42
                builder: (context, state) {
                  final id = int.tryParse(state.pathParameters['id'] ?? '');
                  return id == null ? HalamanTidakDitemukan(uri: state.uri) : HalamanDetail(id: id);
                },
              ),
            ],
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/laporan',                      // → /laporan?bulan=2026-11
            builder: (context, state) => HalamanLaporan(bulan: state.uri.queryParameters['bulan']),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profil', builder: (context, state) => const HalamanProfil()),
        ]),
      ],
    ),
  ],
);`, 'dart'),
      code('Scaffold dengan NavigationBar dan stack per tab', `class ScaffoldDenganNav extends StatelessWidget {
  const ScaffoldDenganNav({super.key, required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,                                   // tiap tab punya Navigator sendiri; state & scroll terjaga
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (i) => shell.goBranch(
          i,
          initialLocation: i == shell.currentIndex,  // ketuk tab aktif = kembali ke akar tab
        ),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Beranda'),
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Laporan'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
    );
  }
}

// Dari mana saja:
// context.go('/beranda/transaksi/42');        // pindah tab Beranda + buka detail
// context.go('/laporan?bulan=2026-11');
// auth.logout();                              // redirect otomatis ke /login berkat refreshListenable`, 'dart'),
      code('Android App Links — AndroidManifest.xml (di dalam <activity> MainActivity)', `<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="kas.contoh.id" />
</intent-filter>`, 'xml'),
      code('https://kas.contoh.id/.well-known/assetlinks.json', `[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "id.contoh.kas",
    "sha256_cert_fingerprints": ["SHA-256 sertifikat penandatangan (dari Play Console → App signing)"]
  }
}]`, 'json'),
      code('iOS Universal Links dan cara menguji', `# iOS: Xcode → Runner → Signing & Capabilities → + Associated Domains → applinks:kas.contoh.id
# lalu sajikan https://kas.contoh.id/.well-known/apple-app-site-association (JSON, tanpa ekstensi):
#   {"applinks": {"details": [{"appIDs": ["TEAMID.id.contoh.kas"], "components": [{"/": "/beranda/*"}]}]}}

# Uji di emulator/simulator tanpa mengirim email sungguhan
adb shell am start -a android.intent.action.VIEW \\
  -c android.intent.category.BROWSABLE \\
  -d "https://kas.contoh.id/beranda/transaksi/42" id.contoh.kas
xcrun simctl openurl booted "https://kas.contoh.id/beranda/transaksi/42"

# Cek status verifikasi domain Android
adb shell pm get-app-links id.contoh.kas`, 'bash'),
      table(['Kebutuhan', 'go_router', 'Catatan'], [
        ['Bottom nav, tiap tab ingat stack-nya', '`StatefulShellRoute.indexedStack`', 'State tab tetap hidup (IndexedStack)'],
        ['Layout bersama tanpa state per tab', '`ShellRoute`', 'Mis. sidebar tetap di web/desktop'],
        ['Guard login', '`redirect` + `refreshListenable`', 'Kembalikan `null` bila tidak perlu dialihkan'],
        ['ID / filter layar', 'Path `:id` dan query `?bulan=`', 'Ikut deep link dan refresh di web'],
        ['Objek sementara antar layar', '`extra`', 'Hilang saat deep link/refresh web; jangan untuk data wajib'],
        ['Rute bertipe', 'Paket `go_router_builder`', 'Generate class rute agar path & parameter dicek compiler'],
      ]),
      callout('info', 'Deep link bawaan Flutter', 'Sejak Flutter 3.27, penanganan deep link bawaan aktif secara default sehingga URL yang membuka aplikasi langsung diteruskan ke router. Bila memakai plugin pihak ketiga (mis. `app_links`) untuk menangani tautan sendiri, nonaktifkan dengan metadata `flutter_deeplinking_enabled` bernilai `false` (Android) / `FlutterDeepLinkingEnabled` (iOS Info.plist) sesuai dokumentasi.'),
      callout('warn', 'Redirect yang aman', 'Parameter `from` berasal dari URL yang bisa dibuat siapa pun; hanya terima lokasi internal (diawali `/`) agar tidak ada open redirect. Hindari redirect berantai yang saling menunjuk (go_router membatasi jumlah redirect dan melempar error), dan jangan memanggil API di dalam `redirect`: baca status yang sudah tersedia di memori.'),
      ...quiz([
        ['DART-05', 'Mengapa `refreshListenable` diperlukan pada guard login?', 'Fungsi `redirect` hanya dievaluasi saat navigasi terjadi. Tanpa `refreshListenable`, ketika token kedaluwarsa atau pengguna logout di layar profil, router tidak tahu dan pengguna tetap di halaman terproteksi. Dengan Listenable (mis. `ChangeNotifier` status auth), setiap perubahan memicu evaluasi ulang redirect.'],
        ['DART-06', 'Apa beda `StatefulShellRoute.indexedStack` dan `ShellRoute`?', '`StatefulShellRoute` memberi setiap cabang (tab) Navigator dan state sendiri yang tetap hidup, sehingga berpindah tab tidak mereset scroll atau stack detail. `ShellRoute` hanya membungkus rute anak dengan layout yang sama tanpa menyimpan stack per tab.'],
        ['DART-07', 'Detail transaksi dibuka dengan `context.push(\'/detail\', extra: transaksi)`. Apa masalahnya?', 'Data hanya ada di memori: deep link, refresh di web, atau state restoration tidak membawa `extra`, sehingga layar menerima null. Lebih baik memakai `/beranda/transaksi/:id` lalu memuat data berdasarkan ID dari repository/cache.'],
      ]),
      ...practice('flutter-gorouter', [
        'Bangun bottom navigation tiga tab dengan `StatefulShellRoute.indexedStack`; buka detail di tab Beranda, pindah tab, kembali, dan pastikan detail masih terbuka.',
        'Implementasikan guard dengan `refreshListenable`: logout dari tab Profil langsung membawa ke `/login`, dan login mengembalikan ke URL `from`.',
        'Konfigurasi App Links untuk domain uji (atau custom scheme `kas://` untuk latihan) dan buka `/beranda/transaksi/42` dengan `adb`.',
        'Tambahkan widget test yang memompa `MaterialApp.router` dan memverifikasi redirect ke `/login` saat belum masuk.',
      ]),
      references(
        ['go_router (pub.dev)', 'https://pub.dev/packages/go_router'],
        ['go_router: StatefulShellRoute', 'https://pub.dev/documentation/go_router/latest/go_router/StatefulShellRoute-class.html'],
        ['Flutter: Deep linking', 'https://docs.flutter.dev/ui/navigation/deep-linking'],
        ['Flutter: Set up app links for Android', 'https://docs.flutter.dev/cookbook/navigation/set-up-app-links'],
        ['Flutter: Set up universal links for iOS', 'https://docs.flutter.dev/cookbook/navigation/set-up-universal-links'],
      ),
    ],
  },
  {
    id: 'flutter-firebase',
    title: 'Firebase untuk Flutter: Setup, Auth, Firestore & Push Notification',
    summary: 'FlutterFire CLI, Firebase Authentication dengan authStateChanges, Cloud Firestore dengan converter dan security rules, notifikasi FCM (foreground, background, dibuka dari notifikasi), dan Emulator Suite.',
    track: BUILD, source: dartModernSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Firebase adalah *backend-as-a-service* dari Google: autentikasi, database realtime, penyimpanan file, push notification, crash reporting, dan analytics tanpa menulis server sendiri. Untuk aplikasi kecil–menengah ini memangkas waktu rilis secara drastis. Konsekuensinya: aturan akses ditulis sebagai **security rules** (bukan kode server), model data harus mengikuti batasan Firestore, dan biaya dihitung per operasi baca/tulis.'),
      paragraph('Paket Flutter resminya disebut **FlutterFire**. Konfigurasi dilakukan oleh FlutterFire CLI yang mendaftarkan aplikasi Android/iOS/web ke proyek Firebase dan menghasilkan `lib/firebase_options.dart`. Buat proyek Firebase terpisah per lingkungan (dev, prod) dan hubungkan dengan flavor seperti di modul [Flavors & CI/CD](#flutter.flutter-flavors-cicd).'),
      code('Setup dengan FlutterFire CLI', `npm install -g firebase-tools                 # Firebase CLI
firebase login
dart pub global activate flutterfire_cli
flutterfire configure --project=kas-dev      # membuat lib/firebase_options.dart, mendaftarkan app Android/iOS

flutter pub add firebase_core firebase_auth cloud_firestore firebase_messaging`, 'bash'),
      code('Inisialisasi dan autentikasi', `import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(pesanLatarBelakang);   // harus fungsi top-level
  runApp(const KasApp());
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),   // emit saat login, logout, dan saat app start
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        return snapshot.data == null ? const HalamanLogin() : const HalamanBeranda();
      },
    );
  }
}

/// Mengembalikan pesan error ramah, atau null bila berhasil.
Future<String?> masuk(String email, String sandi) async {
  try {
    await FirebaseAuth.instance.signInWithEmailAndPassword(email: email.trim(), password: sandi);
    return null;
  } on FirebaseAuthException catch (e) {
    return switch (e.code) {
      // Proyek dengan email enumeration protection mengembalikan 'invalid-credential'
      'invalid-credential' || 'wrong-password' || 'user-not-found' => 'Email atau kata sandi salah',
      'too-many-requests' => 'Terlalu banyak percobaan, coba lagi nanti',
      'network-request-failed' => 'Tidak ada koneksi internet',
      _ => 'Gagal masuk (\${e.code})',
    };
  }
}`, 'dart'),
      code('Cloud Firestore: model, converter, query realtime', `import 'package:cloud_firestore/cloud_firestore.dart';

class Transaksi {
  Transaksi({this.id, required this.judul, required this.jumlah, this.dibuat});
  final String? id;
  final String judul;
  final int jumlah;
  final DateTime? dibuat;

  factory Transaksi.dariDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return Transaksi(
      id: doc.id,
      judul: d['judul'] as String,
      jumlah: d['jumlah'] as int,
      dibuat: (d['dibuat'] as Timestamp?)?.toDate(),   // null sesaat sebelum server mengisi waktu
    );
  }

  Map<String, dynamic> keMap() => {
        'judul': judul,
        'jumlah': jumlah,
        'dibuat': FieldValue.serverTimestamp(),        // waktu server, bukan jam perangkat
      };
}

class TransaksiRepo {
  TransaksiRepo(this.uid);
  final String uid;

  CollectionReference<Transaksi> get _koleksi => FirebaseFirestore.instance
      .collection('users').doc(uid).collection('transaksi')
      .withConverter<Transaksi>(
        fromFirestore: (doc, _) => Transaksi.dariDoc(doc),
        toFirestore: (t, _) => t.keMap(),
      );

  /// Realtime + cache offline: emit dari cache dulu, lalu setiap ada perubahan.
  Stream<List<Transaksi>> amati() => _koleksi
      .orderBy('dibuat', descending: true)
      .limit(50)                                       // batasi: setiap dokumen dihitung sebagai satu read
      .snapshots()
      .map((snap) => snap.docs.map((d) => d.data()).toList());

  Future<void> tambah(String judul, int jumlah) => _koleksi.add(Transaksi(judul: judul, jumlah: jumlah));

  Future<void> hapus(String id) => _koleksi.doc(id).delete();
}`, 'dart'),
      code('firestore.rules — hanya pemilik yang boleh membaca/menulis', `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/transaksi/{id} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.judul is string
        && request.resource.data.judul.size() <= 100
        && request.resource.data.jumlah is int;
    }
  }
}
// Deploy: firebase deploy --only firestore:rules`, 'text'),
      code('Push notification dengan FCM', `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import 'firebase_options.dart';

@pragma('vm:entry-point')                              // agar tidak dibuang tree shaking (dipanggil dari native)
Future<void> pesanLatarBelakang(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('pesan latar belakang: \${message.messageId}');
}

Future<void> siapkanNotifikasi(String uid, void Function(String transaksiId) buka) async {
  final fcm = FirebaseMessaging.instance;
  final izin = await fcm.requestPermission();          // dialog izin di iOS dan Android 13+
  if (izin.authorizationStatus == AuthorizationStatus.denied) return;

  await fcm.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true);   // iOS

  Future<void> simpanToken(String? token) async {
    if (token == null) return;
    await FirebaseFirestore.instance.collection('users').doc(uid)
        .set({'fcmTokens': FieldValue.arrayUnion([token])}, SetOptions(merge: true));
  }

  await simpanToken(await fcm.getToken());             // server mengirim notifikasi ke token ini
  fcm.onTokenRefresh.listen(simpanToken);

  FirebaseMessaging.onMessage.listen((m) {             // app sedang terbuka
    debugPrint('foreground: \${m.notification?.title}');   // Android tidak menampilkan banner otomatis
  });

  void tangani(RemoteMessage m) {
    final id = m.data['transaksiId'];
    if (id is String) buka(id);                        // mis. router.go('/beranda/transaksi/$id')
  }

  FirebaseMessaging.onMessageOpenedApp.listen(tangani);   // app di background, notifikasi diketuk
  final awal = await fcm.getInitialMessage();             // app tertutup, dibuka dari notifikasi
  if (awal != null) tangani(awal);
}`, 'dart'),
      table(['Layanan', 'Kegunaan', 'Catatan'], [
        ['Authentication', 'Login email, Google, Apple, telepon, anonim', 'Apple Sign-In wajib bila app iOS menawarkan login sosial pihak ketiga (aturan App Store)'],
        ['Cloud Firestore', 'Database dokumen realtime dengan cache offline', 'Biaya per read/write/delete; rancang query dan index sejak awal'],
        ['Cloud Messaging (FCM)', 'Push notification Android, iOS, web', 'iOS butuh APNs key di Firebase Console + capability Push Notifications'],
        ['Cloud Storage', 'Upload gambar/file pengguna', 'Juga dijaga security rules'],
        ['Crashlytics', 'Laporan crash dengan stack trace', 'Pasang di `FlutterError.onError` dan `PlatformDispatcher.instance.onError`'],
        ['Cloud Functions', 'Kode server terpicu event (mis. kirim FCM saat dokumen dibuat)', 'Logika yang tidak boleh dipercayakan ke klien'],
      ]),
      callout('warn', 'Keamanan ada di rules, bukan di aplikasi', 'Siapa pun bisa memanggil Firestore langsung dengan konfigurasi dari aplikasi Anda (file `firebase_options.dart` tidak rahasia). Rules mode test (`allow read, write: if true` atau dengan batas tanggal) harus diganti sebelum rilis. Validasi bentuk data di rules, dan jalankan logika sensitif (saldo, poin, pembayaran) di Cloud Functions atau server, bukan di klien.'),
      callout('tip', 'Kembangkan dengan Emulator Suite', 'Jalankan `firebase emulators:start` lalu arahkan app ke emulator saat debug: `FirebaseAuth.instance.useAuthEmulator(\'localhost\', 9099)` dan `FirebaseFirestore.instance.useFirestoreEmulator(\'localhost\', 8080)` (dari emulator Android gunakan host `10.0.2.2`). Data uji tidak mengotori proyek nyata, rules bisa diuji otomatis, dan tidak ada biaya. Di iOS, `getToken()` FCM baru tersedia setelah token APNs didapat; uji push di perangkat fisik.'),
      ...quiz([
        ['DART-08', 'Mengapa `authStateChanges()` lebih tepat untuk menentukan layar awal daripada mengecek `currentUser` sekali di `main()`?', 'Saat app baru start, Firebase Auth memulihkan sesi secara asinkron, sehingga `currentUser` bisa masih null sesaat. `authStateChanges()` memancarkan status setelah pemulihan selesai dan setiap kali pengguna login/logout, sehingga UI selalu sinkron tanpa logika tambahan.'],
        ['DART-09', 'Aplikasi sudah menyembunyikan tombol hapus untuk transaksi milik orang lain. Apakah data sudah aman?', 'Belum. Klien bisa dimodifikasi atau memanggil API Firestore langsung. Yang menegakkan akses adalah security rules di server, misalnya `request.auth.uid == uid` pada path `users/{uid}/transaksi`. UI hanya kenyamanan, bukan keamanan.'],
        ['DART-10', 'Notifikasi FCM bisa diterima dalam tiga keadaan app. Sebutkan API untuk masing-masing.', 'App terbuka (foreground): `FirebaseMessaging.onMessage` (di Android tampilkan sendiri, mis. dengan flutter_local_notifications). App di background lalu notifikasi diketuk: `onMessageOpenedApp`. App tertutup lalu dibuka dari notifikasi: `getInitialMessage()`. Pemrosesan data tanpa interaksi saat background memakai `onBackgroundMessage` dengan fungsi top-level.'],
      ]),
      ...practice('flutter-fire', [
        'Hubungkan aplikasi ke proyek Firebase dev dengan `flutterfire configure`; login/daftar email berjalan dan `AuthGate` berpindah layar otomatis.',
        'Simpan transaksi di `users/{uid}/transaksi` dengan converter; daftar diperbarui realtime di dua perangkat/emulator sekaligus.',
        'Tulis security rules, lalu buktikan dengan Emulator Suite bahwa pengguna B tidak bisa membaca transaksi pengguna A.',
        'Kirim notifikasi uji dari Firebase Console berisi data `transaksiId`; mengetuknya membuka detail transaksi lewat go_router.',
      ]),
      references(
        ['Firebase: Add Firebase to your Flutter app', 'https://firebase.google.com/docs/flutter/setup'],
        ['Firebase Authentication (Flutter)', 'https://firebase.google.com/docs/auth/flutter/start'],
        ['Cloud Firestore: Get started', 'https://firebase.google.com/docs/firestore/quickstart'],
        ['Firestore Security Rules', 'https://firebase.google.com/docs/firestore/security/get-started'],
        ['FCM: Flutter client', 'https://firebase.google.com/docs/cloud-messaging/flutter/client'],
        ['Firebase Local Emulator Suite', 'https://firebase.google.com/docs/emulator-suite'],
      ),
    ],
  },
  {
    id: 'flutter-l10n-intl',
    title: 'Lokalisasi & Internasionalisasi: ARB, gen-l10n & Format id_ID',
    summary: 'flutter_localizations, l10n.yaml, file ARB dengan placeholder, plural, select, format mata uang/tanggal, serta intl untuk format angka dan tanggal Indonesia.',
    track: PRODUCTION, source: dartModernSource, duration: '90 menit', level: 'Easy',
    blocks: [
      paragraph('**Internasionalisasi (i18n)** berarti menyiapkan aplikasi agar teks, angka, tanggal, dan arah tulisan bisa berubah sesuai bahasa; **lokalisasi (l10n)** adalah mengisi terjemahan untuk bahasa tertentu. Walau aplikasi hanya berbahasa Indonesia, i18n tetap berguna: semua teks terkumpul di satu file, format Rupiah dan tanggal konsisten, dan menambah bahasa Inggris kelak cukup menambah satu file.'),
      paragraph('Modul [Menuju Produksi](#flutter.menuju-produksi) sudah menunjukkan pemasangan dasar. Di sini kita lengkapi: konfigurasi `l10n.yaml`, placeholder bertipe, plural dan select, format angka/tanggal langsung dari ARB, serta paket `intl` untuk format di luar widget.'),
      code('pubspec.yaml dan l10n.yaml', `# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: any               # versi diselaraskan oleh flutter_localizations

flutter:
  generate: true          # jalankan gen-l10n otomatis saat flutter run/build

# l10n.yaml (di root proyek)
arb-dir: lib/l10n
template-arb-file: app_id.arb           # bahasa sumber: semua kunci wajib ada di sini
output-localization-file: app_localizations.dart
nullable-getter: false                  # AppLocalizations.of(context) tanpa tanda "!"`, 'yaml'),
      code('lib/l10n/app_id.arb', `{
  "@@locale": "id",
  "judulAplikasi": "Kas Harian",
  "sapaan": "Halo, {nama}!",
  "@sapaan": {
    "description": "Sapaan di atas beranda",
    "placeholders": { "nama": { "type": "String" } }
  },
  "jumlahTransaksi": "{jumlah, plural, =0{Belum ada transaksi} other{{jumlah} transaksi}}",
  "@jumlahTransaksi": {
    "placeholders": { "jumlah": { "type": "int" } }
  },
  "saldo": "Saldo: {nilai}",
  "@saldo": {
    "placeholders": {
      "nilai": {
        "type": "double",
        "format": "currency",
        "optionalParameters": { "symbol": "Rp", "decimalDigits": 0 }
      }
    }
  },
  "diperbarui": "Diperbarui {tanggal}",
  "@diperbarui": {
    "placeholders": { "tanggal": { "type": "DateTime", "format": "yMMMMd" } }
  },
  "jenisTransaksi": "{jenis, select, masuk{Pemasukan} keluar{Pengeluaran} other{Lainnya}}",
  "@jenisTransaksi": {
    "placeholders": { "jenis": { "type": "String" } }
  }
}`, 'json'),
      code('lib/l10n/app_en.arb (cukup teksnya; metadata diambil dari template)', `{
  "@@locale": "en",
  "judulAplikasi": "Daily Cash",
  "sapaan": "Hi, {nama}!",
  "jumlahTransaksi": "{jumlah, plural, =0{No transactions yet} =1{1 transaction} other{{jumlah} transactions}}",
  "saldo": "Balance: {nilai}",
  "diperbarui": "Updated {tanggal}",
  "jenisTransaksi": "{jenis, select, masuk{Income} keluar{Expense} other{Other}}"
}`, 'json'),
      code('Pemasangan di MaterialApp dan pemakaian', `import 'package:flutter/material.dart';
import 'package:kas/l10n/app_localizations.dart';   // dihasilkan gen-l10n di folder arb-dir

class KasApp extends StatelessWidget {
  const KasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateTitle: (context) => AppLocalizations.of(context).judulAplikasi,
      localizationsDelegates: AppLocalizations.localizationsDelegates,   // termasuk Global*Localizations
      supportedLocales: AppLocalizations.supportedLocales,               // [en, id]
      // locale: const Locale('id'),   // paksa bahasa; null = ikuti pengaturan perangkat
      home: const RingkasanSaldo(saldo: 1500000, jumlah: 3),
    );
  }
}

class RingkasanSaldo extends StatelessWidget {
  const RingkasanSaldo({super.key, required this.saldo, required this.jumlah});
  final double saldo;
  final int jumlah;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: Column(children: [
        Text(l10n.sapaan('Ani')),                       // Halo, Ani!
        Text(l10n.jumlahTransaksi(jumlah)),             // 3 transaksi
        Text(l10n.saldo(saldo)),                        // Saldo: Rp1.500.000
        Text(l10n.diperbarui(DateTime(2026, 11, 2))),   // Diperbarui 2 November 2026
        Text(l10n.jenisTransaksi('keluar')),            // Pengeluaran
      ]),
    );
  }
}`, 'dart'),
      code('Paket intl langsung: angka, Rupiah, tanggal, parsing input', `import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

Future<void> main() async {
  // Di Dart murni / unit test data tanggal harus dimuat dulu. Di app Flutter, delegate
  // lokalisasi memuatnya untuk locale aktif; locale lain tetap perlu initializeDateFormatting.
  await initializeDateFormatting('id_ID');

  final rupiah = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0);
  print(rupiah.format(1500000));                                     // Rp1.500.000
  print(NumberFormat.decimalPattern('id_ID').format(1234567.89));    // 1.234.567,89
  print(NumberFormat.compact(locale: 'id_ID').format(1500000));      // bentuk ringkas untuk grafik
  print(NumberFormat.percentPattern('id_ID').format(0.125));         // persen sesuai locale

  final tgl = DateTime(2026, 11, 2, 14, 5);
  print(DateFormat('EEEE, d MMMM y', 'id_ID').format(tgl));          // Senin, 2 November 2026
  print(DateFormat.yMd('id_ID').format(tgl));                        // format tanggal pendek locale id
  print(DateFormat.Hm('id_ID').format(tgl));                         // 14.05 (pemisah jam Indonesia)

  // Input pengguna "1.250.000" → angka; jangan memakai int.parse yang gagal karena titik
  final nilai = NumberFormat.decimalPattern('id_ID').parse('1.250.000');
  print(nilai);                                                      // 1250000
}`, 'dart'),
      table(['Kebutuhan', 'Cara', 'Contoh'], [
        ['Teks statis', 'Kunci ARB', '`l10n.judulAplikasi`'],
        ['Teks dengan nilai', 'Placeholder bertipe', '`"Halo, {nama}!"`'],
        ['Jumlah benda', '`plural`', 'Bahasa Indonesia cukup `=0` dan `other`; Inggris butuh `=1`'],
        ['Pilihan teks per kategori', '`select`', '`{jenis, select, masuk{...} other{...}}`'],
        ['Rupiah / tanggal di teks', 'Placeholder `double`/`DateTime` + `format`', '`"format": "currency"`, `"yMMMMd"`'],
        ['Format di luar widget', 'Paket `intl`', '`NumberFormat.currency(locale: \'id_ID\')`'],
        ['Tata letak kanan-ke-kiri', 'Widget directional', '`EdgeInsetsDirectional`, `AlignmentDirectional`'],
      ]),
      callout('tip', 'Kebiasaan yang menyelamatkan', 'Jangan menyusun kalimat dengan penggabungan string (`\'Saldo \' + nilai`) karena urutan kata berbeda antarbahasa; pakai placeholder. Simpan nominal uang sebagai integer (rupiah) dan format hanya saat ditampilkan. Untuk iOS, tambahkan daftar bahasa ke `CFBundleLocalizations` di `ios/Runner/Info.plist` agar App Store dan sistem mengenali bahasa yang didukung.'),
      callout('info', 'Lokasi file hasil generate', 'Versi Flutter terbaru menghasilkan `app_localizations.dart` di dalam folder sumber (`arb-dir` atau `output-dir`) dan di-import seperti file biasa. Paket sintetis `package:flutter_gen/gen_l10n/...` yang ada di tutorial lama sudah deprecated; bila proyek lama masih memakainya, pindahkan import sesuai pesan migrasi dari `flutter gen-l10n`.'),
      ...quiz([
        ['DART-11', 'Mengapa pesan plural bahasa Indonesia cukup memakai `=0` dan `other`, sedangkan bahasa Inggris butuh `=1`?', 'Aturan plural CLDR bahasa Indonesia hanya punya kategori `other`: kata benda tidak berubah bentuk ("1 transaksi", "3 transaksi"). `=0` dipakai karena ingin teks khusus untuk nol. Bahasa Inggris membedakan bentuk tunggal ("1 transaction") dan jamak ("3 transactions"), sehingga kasus satu perlu ditulis.'],
        ['DART-12', 'Mengapa `int.parse(\'1.250.000\')` gagal dan apa penggantinya?', '`int.parse` hanya menerima digit tanpa pemisah ribuan, sedangkan format Indonesia memakai titik sebagai pemisah ribuan dan koma untuk desimal. Gunakan `NumberFormat.decimalPattern(\'id_ID\').parse(...)` agar pemisah dibaca sesuai locale.'],
      ]),
      ...practice('flutter-l10n', [
        'Pindahkan semua teks di satu layar ke `app_id.arb`; tidak ada string literal tersisa di widget layar itu.',
        'Tambahkan `app_en.arb`, ubah bahasa perangkat ke English, dan pastikan teks, Rupiah, serta tanggal ikut berubah.',
        'Buat helper `formatRupiah(int)` berbasis `NumberFormat.currency` dan unit test-nya untuk 0, 1.500, dan 1.500.000.',
        'Tulis widget test yang memompa `MaterialApp` dengan `locale: Locale(\'en\')` dan memverifikasi teks plural.',
      ]),
      references(
        ['Flutter: Internationalizing Flutter apps', 'https://docs.flutter.dev/ui/internationalization'],
        ['intl (pub.dev)', 'https://pub.dev/packages/intl'],
        ['NumberFormat class', 'https://pub.dev/documentation/intl/latest/intl/NumberFormat-class.html'],
        ['DateFormat class', 'https://pub.dev/documentation/intl/latest/intl/DateFormat-class.html'],
        ['ICU message format (plural & select)', 'https://unicode-org.github.io/icu/userguide/format_parse/messages/'],
      ),
    ],
  },
  {
    id: 'flutter-flavors-cicd',
    title: 'Flavors & CI/CD: dev/staging/prod, Signing, GitHub Actions, Codemagic & Fastlane',
    summary: 'Product flavor Android dan scheme iOS, --dart-define-from-file, keystore dan code signing, workflow rilis otomatis di GitHub Actions, codemagic.yaml, serta lane Fastlane ke Play Store.',
    track: PRODUCTION, source: dartModernSource, duration: '3–4 jam', level: 'Hard',
    blocks: [
      paragraph('Aplikasi nyata berjalan di beberapa lingkungan: **dev** (server lokal/dev, logging lengkap), **staging** (data mirip produksi untuk QA), dan **prod**. Dengan **flavor**, ketiganya bisa terpasang berdampingan di satu ponsel (application ID berbeda, nama dan ikon berbeda) dan masing-masing membawa konfigurasinya sendiri. Di atasnya, **CI/CD** memastikan setiap rilis dibangun dari kode yang sama dengan cara yang sama: test, build bertanda tangan, lalu unggah ke Play Console/TestFlight tanpa langkah manual di laptop siapa pun.'),
      paragraph('Modul [Menuju Produksi](#flutter.menuju-produksi) sudah membahas `--dart-define` dan workflow CI yang menjalankan analyze/test. Modul ini melanjutkan ke rilis: flavor, penandatanganan, dan distribusi otomatis. Untuk strategi rollout bertahap dan feature flag lihat [Fase 4: Arsitektur Skala Besar & Delivery](#flutter.fase-4-arsitektur-skala-besar-delivery).'),
      code('android/app/build.gradle.kts — product flavors', `android {
    // ...
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"          // id.contoh.kas.dev → bisa terpasang bersama prod
            versionNameSuffix = "-dev"
            resValue("string", "app_name", "Kas Dev")
        }
        create("staging") {
            dimension = "env"
            applicationIdSuffix = ".staging"
            resValue("string", "app_name", "Kas Staging")
        }
        create("prod") {
            dimension = "env"
            resValue("string", "app_name", "Kas")
        }
    }
}
// AndroidManifest.xml: android:label="@string/app_name"
// Ikon per flavor: android/app/src/dev/res/mipmap-*/ic_launcher.png (menimpa src/main)
// iOS: buat scheme dev/staging/prod dan build configuration Debug-dev, Release-dev, dst. di Xcode
//      (nama scheme = nama flavor); detailnya di dokumentasi "Flavors (iOS)".`, 'kotlin'),
      code('Konfigurasi per lingkungan dengan --dart-define-from-file', `// config/dev.json   → {"ENV": "dev",  "API_URL": "https://api-dev.kas.contoh.id"}
// config/prod.json  → {"ENV": "prod", "API_URL": "https://api.kas.contoh.id"}
//
// flutter run --flavor dev --dart-define-from-file=config/dev.json
// flutter build appbundle --release --flavor prod --dart-define-from-file=config/prod.json

import 'package:flutter/services.dart';

enum Env { dev, staging, prod }

class AppConfig {
  const AppConfig._();

  static const apiUrl = String.fromEnvironment('API_URL');          // dibaca saat kompilasi
  static final env = Env.values.byName(const String.fromEnvironment('ENV', defaultValue: 'dev'));

  static void validasi() {
    assert(apiUrl.isNotEmpty, 'API_URL kosong: jalankan dengan --dart-define-from-file');
    // appFlavor berisi nilai --flavor; pastikan konfigurasi tidak tertukar (mis. flavor prod + API dev)
    if (appFlavor != null && appFlavor != env.name) {
      throw StateError('flavor $appFlavor tidak cocok dengan ENV \${env.name}');
    }
  }
}`, 'dart'),
      code('Penandatanganan Android — android/app/build.gradle.kts', `import java.io.FileInputStream
import java.util.Properties

// android/key.properties (JANGAN di-commit):
//   storePassword=...  keyPassword=...  keyAlias=upload  storeFile=upload-keystore.jks
// Buat keystore sekali: keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
val keystoreProperties = Properties().apply {
    val file = rootProject.file("key.properties")
    if (file.exists()) load(FileInputStream(file))
}

android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = (keystoreProperties["storeFile"] as String?)?.let { file(it) }
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}`, 'kotlin'),
      code('.github/workflows/release-android.yml', `name: Release Android

on:
  push:
    tags: ['v*']                 # rilis saat tag v1.2.3 di-push

jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }
      - uses: subosito/flutter-action@v2
        with: { channel: stable, cache: true }

      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test

      - name: Siapkan keystore dari secrets
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 --decode > android/app/upload-keystore.jks
          cat > android/key.properties <<EOF
          storePassword=$KEYSTORE_PASSWORD
          keyPassword=$KEY_PASSWORD
          keyAlias=upload
          storeFile=upload-keystore.jks
          EOF

      - name: Build AAB prod
        run: >
          flutter build appbundle --release --flavor prod
          --dart-define-from-file=config/prod.json
          --build-number=\${{ github.run_number }}

      - uses: actions/upload-artifact@v4
        with:
          name: aab-prod
          path: build/app/outputs/bundle/prodRelease/*.aab
      # Langkah berikut: unggah ke Play Console (track internal) dengan Fastlane supply
      # atau action komunitas, memakai service account JSON dari secrets.`, 'yaml'),
      code('android/fastlane/Fastfile — unggah ke Play Console', `default_platform(:android)

platform :android do
  desc "Build AAB prod dan unggah ke track internal"
  lane :internal do
    # sh berjalan di folder android/fastlane → ../.. = root proyek Flutter
    sh("cd ../.. && flutter build appbundle --release --flavor prod --dart-define-from-file=config/prod.json")
    upload_to_play_store(
      track: "internal",
      aab: "../build/app/outputs/bundle/prodRelease/app-prod-release.aab",
      json_key: ENV["PLAY_JSON_KEY_PATH"],         # service account Google Play
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end
end

# iOS (ios/fastlane/Fastfile): match(type: "appstore") untuk sertifikat & profil bersama tim,
# lalu flutter build ipa --release --flavor prod --export-options-plist=ios/ExportOptions.plist
# dan upload_to_testflight memakai App Store Connect API key.`, 'text'),
      code('codemagic.yaml — alternatif CI khusus mobile', `workflows:
  android-prod:
    name: Android prod ke Play internal
    instance_type: mac_mini_m2
    environment:
      flutter: stable
      android_signing:
        - kas_upload_keystore          # keystore diunggah di UI Codemagic, bukan di repo
      groups:
        - google_play                  # berisi GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
    triggering:
      events: [tag]
    scripts:
      - name: Test
        script: flutter test
      - name: Build AAB
        script: |
          flutter build appbundle --release --flavor prod \\
            --dart-define-from-file=config/prod.json \\
            --build-number=$BUILD_NUMBER
    artifacts:
      - build/**/outputs/**/*.aab
    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal`, 'yaml'),
      table(['Aspek', 'Android', 'iOS'], [
        ['Varian lingkungan', '`productFlavors` di Gradle', 'Scheme + build configuration di Xcode'],
        ['Identitas app', '`applicationIdSuffix`', 'Bundle identifier per configuration'],
        ['Tanda tangan', 'Upload keystore + Play App Signing', 'Sertifikat distribusi + provisioning profile (Fastlane match)'],
        ['Kredensial CI', 'Keystore base64 + service account JSON', 'App Store Connect API key + repo match terenkripsi'],
        ['Distribusi uji', 'Play Console track internal/closed', 'TestFlight'],
        ['Runner CI', 'Linux cukup', 'Wajib macOS (GitHub macOS runner, Codemagic, Bitrise)'],
      ]),
      callout('warn', 'Rahasia bukan di --dart-define', 'Nilai `--dart-define` dan `--dart-define-from-file` tertanam di binary dan bisa diekstrak siapa pun yang mengunduh aplikasi. Gunakan hanya untuk konfigurasi publik (URL API, nama lingkungan, DSN pelaporan crash). Secret sungguhan (kunci pembayaran, kredensial pihak ketiga) tetap di server. Masukkan `key.properties`, `*.jks`, dan service account JSON ke `.gitignore`, dan aktifkan Play App Signing agar upload key yang hilang bisa di-reset.'),
      callout('tip', 'Nomor build otomatis', 'Play Console dan App Store menolak `versionCode`/build number yang sama. Biarkan CI mengisinya (`--build-number=${{ github.run_number }}` atau `$BUILD_NUMBER` di Codemagic), sedangkan `version` di pubspec (mis. `1.4.0`) diubah manual sesuai semantic versioning saat rilis.'),
      ...quiz([
        ['DART-13', 'Mengapa flavor memakai `applicationIdSuffix` berbeda, bukan cukup URL API yang berbeda?', 'Dengan application ID berbeda, dev, staging, dan prod adalah aplikasi terpisah bagi sistem operasi: bisa terpasang bersamaan, data lokalnya tidak tercampur, dan masing-masing bisa didaftarkan ke proyek Firebase sendiri. Hanya mengganti URL berarti build dev menimpa aplikasi prod di perangkat penguji.'],
        ['DART-14', 'Apa risiko menaruh kunci API pembayaran di `config/prod.json` yang dipakai `--dart-define-from-file`?', 'Nilainya dikompilasi ke dalam binary dan bisa diekstrak dari APK/IPA dengan alat reverse engineering. Kunci rahasia harus tinggal di server; aplikasi meminta server melakukan operasi sensitif atas namanya.'],
        ['DART-15', 'Mengapa keystore disimpan sebagai secret base64 di CI dan bukan di-commit ke repo?', 'Siapa pun yang memegang keystore dan password-nya bisa menandatangani pembaruan atas nama aplikasi Anda. Secret CI terenkripsi dan tidak tampil di log; file baru dibentuk saat job berjalan. Dengan Play App Signing, kunci yang di-CI hanyalah upload key, sehingga bila bocor masih bisa diganti lewat Play Console.'],
      ]),
      ...practice('flutter-flavors', [
        'Tambahkan flavor dev/staging/prod di Android (dan scheme di iOS bila punya Mac); ketiganya terpasang bersamaan dengan nama berbeda.',
        'Pindahkan konfigurasi ke `config/*.json` dan panggil `AppConfig.validasi()` di `main()`; build prod dengan config dev harus gagal.',
        'Buat upload keystore, konfigurasi signing dari `key.properties`, dan pastikan file rahasia ada di `.gitignore`.',
        'Buat workflow GitHub Actions (atau codemagic.yaml) yang berjalan saat tag `v*`, menjalankan test, dan menghasilkan AAB bertanda tangan sebagai artifact.',
      ]),
      references(
        ['Flutter: Configure flavors (Android)', 'https://docs.flutter.dev/deployment/flavors'],
        ['Flutter: Configure flavors (iOS & macOS)', 'https://docs.flutter.dev/deployment/flavors-ios'],
        ['Flutter: Build and release an Android app', 'https://docs.flutter.dev/deployment/android'],
        ['Flutter: Continuous delivery with Flutter', 'https://docs.flutter.dev/deployment/cd'],
        ['Codemagic: Building a Flutter app', 'https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/'],
        ['fastlane docs', 'https://docs.fastlane.tools/'],
      ),
    ],
  },
];
