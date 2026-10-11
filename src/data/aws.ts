import type { Curriculum } from '../types';

export const aws: Curriculum = {
  id: 'aws',
  title: 'AWS untuk Java Developer',
  short: 'AWS Roadmap',
  monogram: 'AWS',
  hue: 'amber',
  description:
    'Urutan belajar AWS dari fondasi sampai production-ready, plus langkah deploy aplikasi Spring Boot memakai Free Tier.',
  intro: [
    {
      type: 'callout',
      tone: 'success',
      title: 'AWS Free Tier',
      text: 'Daftar di [aws.amazon.com/free](https://aws.amazon.com/free) dengan email baru. Kamu dapat akses EC2, RDS, S3, Lambda, dan banyak service lain tanpa biaya, cukup untuk belajar dan deploy project nyata.',
    },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Cek skema Free Tier terbaru',
      text: 'Sejak 15 Juli 2025, akun AWS baru mendapat **Free Plan berbasis kredit** (hingga USD 200, berlaku 6 bulan), bukan lagi skema 12 bulan. Akun lama tetap memakai skema 12 bulan. Tipe instance gratis juga bisa `t2.micro` atau `t3.micro` tergantung region. Selalu cek halaman Free Tier sebelum membuat resource.',
    },
  ],
  modules: [
    {
      id: 'fondasi',
      code: '01',
      title: 'Fondasi AWS',
      summary: 'Pahami konsep dasar sebelum coding: identitas, jaringan, dan tooling.',
      duration: '~2 minggu',
      blocks: [
        {
          type: 'p',
          text: 'Fase pertama membangun pemahaman tentang **siapa boleh melakukan apa** (IAM), **di mana resource hidup** (VPC), dan **cara mengoperasikannya** (Console & CLI).',
        },
        {
          type: 'skills',
          items: [
            { name: 'IAM', desc: 'User, Role, Policy, Permission' },
            { name: 'VPC & Networking', desc: 'Subnet, Security Group, Route Table' },
            { name: 'AWS CLI', desc: 'Setup & basic commands' },
            { name: 'AWS Console', desc: 'Navigasi & region awareness' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Kamu sudah punya',
          text: 'Pengalaman Java & Spring Boot 8 tahun. Fondasi coding kamu sudah jauh melampaui kebanyakan pemula AWS, jadi fokus ke konsep cloud-nya saja.',
        },
        {
          type: 'h',
          text: 'Latihan cepat',
        },
        {
          type: 'code',
          lang: 'bash',
          title: 'Setup AWS CLI',
          code: `# Konfigurasi kredensial & region default
aws configure
# AWS Access Key ID:     ****************
# Default region name:   ap-southeast-1

# Cek identitas yang sedang dipakai
aws sts get-caller-identity

# Lihat daftar bucket S3
aws s3 ls`,
        },
      ],
    },
    {
      id: 'core-services',
      code: '02',
      title: 'Core Services untuk Java',
      summary: 'Service yang paling sering dipakai di Java backend.',
      duration: '~3 minggu',
      blocks: [
        {
          type: 'skills',
          items: [
            { name: 'EC2', desc: 'Deploy Spring Boot app di VM' },
            { name: 'S3', desc: 'File storage, JAR upload' },
            { name: 'RDS', desc: 'MySQL/PostgreSQL managed' },
            { name: 'API Gateway', desc: 'Expose REST API ke publik' },
            { name: 'Lambda', desc: 'Serverless function Java' },
            { name: 'Elastic Beanstalk', desc: 'Deploy Spring Boot paling mudah' },
          ],
        },
      ],
    },
    {
      id: 'devops',
      code: '03',
      title: 'DevOps & Monitoring',
      summary: 'Skill production-ready: observability, CI/CD, container, IaC.',
      duration: '~3 minggu',
      blocks: [
        {
          type: 'skills',
          items: [
            { name: 'CloudWatch', desc: 'Logs, metrics, alerts' },
            { name: 'CodePipeline', desc: 'CI/CD otomatis' },
            { name: 'ECR + ECS', desc: 'Docker container deploy' },
            { name: 'SQS / SNS', desc: 'Message queue & notification' },
            { name: 'Secrets Manager', desc: 'Manage DB password, API key' },
            { name: 'CloudFormation', desc: 'Infrastructure as Code' },
          ],
        },
      ],
    },
    {
      id: 'prioritas',
      code: '04',
      title: 'Prioritas Belajar untuk Posisi Ini',
      summary: 'Urutan prioritas service berdasarkan job desc ATech Solution.',
      blocks: [
        {
          type: 'table',
          head: ['AWS Service', 'Relevansi', 'Prioritas'],
          rows: [
            ['EC2 / Elastic Beanstalk', 'Deploy Spring Boot app', { badge: 'high', text: 'Tinggi' }],
            ['IAM', 'Security & access control', { badge: 'high', text: 'Tinggi' }],
            ['RDS', 'Managed database', { badge: 'high', text: 'Tinggi' }],
            ['S3', 'File storage', { badge: 'high', text: 'Tinggi' }],
            ['DynamoDB', 'NoSQL, disebut di job desc', { badge: 'mid', text: 'Sedang' }],
            ['CloudWatch', 'Monitoring & logging', { badge: 'mid', text: 'Sedang' }],
            ['Lambda + API Gateway', 'Serverless microservice', { badge: 'mid', text: 'Sedang' }],
            ['ECS / K8s (EKS)', 'Container orchestration', { badge: 'low', text: 'Bonus' }],
          ],
        },
      ],
    },
    {
      id: 'deploy',
      code: '05',
      title: 'Deploy Spring Boot ke AWS (Gratis)',
      summary: 'Step-by-step memakai Elastic Beanstalk, cara paling mudah.',
      duration: '1–2 hari',
      blocks: [
        {
          type: 'tags',
          items: [
            { label: 'Free Tier', tone: 'low' },
            { label: 'Elastic Beanstalk' },
            { label: 'Spring Boot' },
            { label: 'EC2 t2.micro / t3.micro' },
            { label: 'RDS Free' },
          ],
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Daftar AWS Free Tier',
              text: 'Buka **aws.amazon.com/free** lalu daftar akun baru. Butuh kartu kredit/debit untuk verifikasi (tidak akan dicharge selama dalam batas Free Tier). Pilih region **ap-southeast-1 (Singapore)**, paling dekat dengan Indonesia.',
            },
            {
              title: 'Build Spring Boot JAR',
              text: 'Pastikan aplikasi Spring Boot kamu bisa di-build jadi executable JAR.',
              blocks: [
                {
                  type: 'code',
                  lang: 'bash',
                  code: `# Build JAR dengan Maven
mvn clean package -DskipTests

# Atau dengan Gradle
./gradlew bootJar

# Hasil ada di folder target/
target/myapp-0.0.1-SNAPSHOT.jar`,
                },
              ],
            },
            {
              title: 'Deploy via Elastic Beanstalk Console',
              text: 'Cara termudah tanpa perlu setup server manual.',
              blocks: [
                {
                  type: 'list',
                  ordered: true,
                  items: [
                    'Buka AWS Console, cari **Elastic Beanstalk**',
                    'Klik **Create Application**',
                    'Platform: Java (Corretto 17 atau 21)',
                    'Upload JAR file dari langkah 2',
                    'Instance type: `t2.micro` / `t3.micro` (Free Tier)',
                    'Klik **Create Environment**, tunggu ~5 menit',
                    'Kamu dapat URL publik otomatis',
                  ],
                },
              ],
            },
            {
              title: 'Tambah Database (RDS Free Tier)',
              text: 'Kalau app kamu butuh database MySQL/PostgreSQL, gunakan RDS Free Tier.',
              blocks: [
                {
                  type: 'code',
                  lang: 'properties',
                  title: 'RDS + application.properties',
                  code: `# Di AWS Console → RDS → Create Database
Engine=MySQL 8.0
Template=Free tier
Instance=db.t3.micro
Storage=20 GB (gratis)

# application.properties
spring.datasource.url=jdbc:mysql://{RDS_ENDPOINT}:3306/mydb
spring.datasource.username=admin
spring.datasource.password=\${DB_PASSWORD}`,
                },
              ],
            },
            {
              title: 'Set Environment Variables',
              text: 'Jangan hardcode password di kode. Set lewat konfigurasi environment Elastic Beanstalk.',
              blocks: [
                {
                  type: 'code',
                  lang: 'properties',
                  code: `# Elastic Beanstalk → Configuration → Software
# Tambah environment properties:

SPRING_PROFILES_ACTIVE=prod
DB_PASSWORD=your_secure_password
SERVER_PORT=5000
# (Beanstalk forward port 80 → 5000 otomatis)`,
                },
              ],
            },
            {
              title: 'Monitor dengan CloudWatch',
              text: 'Lihat logs dan performa aplikasi langsung dari console.',
              blocks: [
                {
                  type: 'code',
                  lang: 'xml',
                  code: `<!-- Elastic Beanstalk → Logs → Request Logs -->
<!-- atau CloudWatch → Log Groups:
     /aws/elasticbeanstalk/{app-name}/var/log/... -->

<!-- Tambah di pom.xml untuk monitoring -->
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-cloudwatch2</artifactId>
</dependency>`,
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  title: 'Tips hemat Free Tier',
                  text: 'Matikan environment Elastic Beanstalk kalau tidak dipakai (bisa di-terminate lalu rebuild). RDS juga bisa di-stop sementara. Free Tier EC2 berlaku 750 jam/bulan, cukup untuk 1 instance jalan 24/7.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'alternatif',
      code: '06',
      title: 'Alternatif Deploy Gratis',
      summary: 'Pilihan lain selain Elastic Beanstalk.',
      blocks: [
        {
          type: 'skills',
          items: [
            { name: 'AWS Lambda', desc: 'Serverless, gratis 1 juta request/bulan. Cocok untuk REST API ringan.' },
            { name: 'EC2 micro', desc: 'Setup manual, lebih fleksibel. 750 jam/bulan gratis.' },
            { name: 'Railway / Render', desc: 'Bukan AWS, tapi gratis & lebih mudah untuk latihan awal.' },
            { name: 'ECS + Fargate', desc: 'Deploy Docker container, ada kuota gratis terbatas.' },
          ],
        },
      ],
    },
  ],
};
