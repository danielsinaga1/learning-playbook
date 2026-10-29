import type { Module } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const FOUNDATION = 'Fondasi';
const BUILD = 'Membangun Aplikasi';
const PRODUCTION = 'Menuju Produksi';

export const dartModernSource = 'Flutter & Dart: materi tambahan dari dokumentasi resmi dart.dev dan docs.flutter.dev (29 Oktober 2026)';

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
];
