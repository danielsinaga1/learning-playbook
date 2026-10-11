import type { Curriculum } from '../types';
import slideProgram from '../assets/hacktiv8-program.webp';
import slideOutline from '../assets/hacktiv8-outline.webp';

/** Disusun dari "Belajar Hacktiv8.docx" (dua slide outline program Applied AI Engineer). */
export const ai: Curriculum = {
  id: 'ai',
  title: 'Applied AI Engineer Roadmap',
  short: 'AI Engineer',
  monogram: 'AI',
  hue: 'lime',
  description:
    'Peta belajar 12 minggu menjadi AI Engineer: data infrastructure, AI engineering (LLM, RAG, agents), dan automation, berdasarkan outline program Applied AI Engineer Hacktiv8.',
  sources: ['Belajar Hacktiv8 (outline program Applied AI Engineer)'],
  tracks: [
    { title: 'Gambaran Program', summary: 'Jadwal, metode, dan prasyarat.' },
    { title: 'Tiga Fase', summary: 'Data infrastructure → AI engineering → automation.' },
  ],
  intro: [
    {
      type: 'callout',
      tone: 'info',
      title: 'Sumber',
      text: 'Isi kurikulum ini diambil dari dua slide outline program *Applied AI Engineer* Hacktiv8. Deskripsi singkat tiap tool ditambahkan sebagai panduan belajar mandiri.',
    },
  ],
  modules: [
    {
      id: 'program',
      code: '01',
      track: 'Gambaran Program',
      title: 'Ringkasan Program',
      summary: 'Jadwal 12 minggu, metode belajar, level, dan prasyarat program Applied AI Engineer.',
      source: 'Belajar Hacktiv8',
      blocks: [
        {
          type: 'p',
          text: 'Program ini melatih kemampuan menjadi AI Engineer lewat perjalanan belajar terstruktur, **dari fondasi pemrograman sampai AI Engineering dan Automation** dengan proyek nyata.',
        },
        {
          type: 'table',
          head: ['Aspek', 'Detail'],
          rows: [
            ['Durasi', '12 minggu · 60 sesi (5x seminggu)'],
            ['Jadwal', '19:00–22:00 WIB'],
            ['Metode', 'Remote (online) · 20% teori, 80% praktik · setup AI end-to-end'],
            ['Level', 'Intermediate sampai Advance'],
            ['Prasyarat', 'Latar belakang IT atau bidang terkait (pengalaman 1 tahun nilai plus); familiar dengan Python & SQL'],
            ['Batch pertama', '31 Agustus 2026'],
          ],
        },
        {
          type: 'steps',
          items: [
            { title: 'Phase 1 · Data Infrastructure', text: '4 minggu online · 15 jam/minggu' },
            { title: 'Phase 2 · AI Engineering', text: '4 minggu online · 15 jam/minggu' },
            { title: 'Phase 3 · Automation', text: '4 minggu online · 15 jam/minggu' },
          ],
        },
        {
          type: 'image',
          src: slideProgram,
          alt: 'Slide Hacktiv8: New Program! Applied AI Engineer — jadwal, metode belajar, minimum skill set, level, dan batch pertama',
          caption: 'Slide asli 1 dari *Belajar Hacktiv8*: ringkasan program. Klik untuk memperbesar.',
        },
        {
          type: 'image',
          src: slideOutline,
          alt: 'Slide Hacktiv8: Applied AI Engineer Outline Curriculum — Phase 1 Data Infrastructure, Phase 2 AI Engineering, Phase 3 Automation beserta logo tools',
          caption: 'Slide asli 2 dari *Belajar Hacktiv8*: outline kurikulum tiga fase dan tools yang dipakai.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Persiapan dari kurikulum lain',
          text: 'Prasyaratnya Python & SQL. Track **FastAPI** di kurikulum Python dan materi Docker di **Cloud & DevOps** langsung terpakai di fase 1 dan 3.',
        },
      ],
    },
    {
      id: 'data-infrastructure',
      code: '02',
      track: 'Tiga Fase',
      title: 'Phase 1 · Data Infrastructure',
      summary: 'Data infrastructure sebagai fondasi solusi data & AI: arsitektur sampai platform yang scalable untuk enterprise.',
      duration: '4 minggu',
      source: 'Belajar Hacktiv8',
      blocks: [
        {
          type: 'p',
          text: 'Pelajari bagaimana data infrastructure menjadi fondasi pengembangan solusi data dan AI, mulai dari perancangan arsitektur hingga pengelolaan platform yang scalable dan siap digunakan di lingkungan enterprise.',
        },
        {
          type: 'skills',
          items: [
            { name: 'Python & pandas', desc: 'Olah dan bersihkan data tabular' },
            { name: 'PostgreSQL', desc: 'Database relasional untuk data transaksional' },
            { name: 'MongoDB', desc: 'Database dokumen untuk data semi-terstruktur' },
            { name: 'Apache Spark', desc: 'Pemrosesan data skala besar secara terdistribusi' },
            { name: 'Databricks', desc: 'Platform lakehouse berbasis Spark' },
            { name: 'Apache Airflow', desc: 'Orkestrasi & penjadwalan pipeline data' },
            { name: 'FastAPI', desc: 'Menyajikan data/model sebagai API' },
            { name: 'Grafana & Tableau', desc: 'Monitoring dan visualisasi data' },
            { name: 'Docker', desc: 'Kemas service agar konsisten di semua lingkungan' },
            { name: 'AWS & Google Cloud', desc: 'Infrastruktur cloud untuk platform data' },
          ],
        },
      ],
    },
    {
      id: 'ai-engineering',
      code: '03',
      track: 'Tiga Fase',
      title: 'Phase 2 · AI Engineering',
      summary: 'Membangun aplikasi AI enterprise dengan LLM, RAG, dan AI Agents, plus deployment, evaluasi, dan AI governance.',
      duration: '4 minggu',
      source: 'Belajar Hacktiv8',
      blocks: [
        {
          type: 'p',
          text: 'Pelajari cara membangun aplikasi AI untuk kebutuhan enterprise dengan menguasai **Large Language Models (LLMs)**, **Retrieval-Augmented Generation (RAG)**, **AI Agents**, serta praktik terbaik dalam deployment, evaluasi, dan AI governance.',
        },
        {
          type: 'skills',
          items: [
            { name: 'OpenAI', desc: 'API model GPT untuk teks, embedding, dan tools' },
            { name: 'Gemini', desc: 'API model Google untuk teks & multimodal' },
            { name: 'Ollama', desc: 'Menjalankan LLM open-source secara lokal' },
            { name: 'Hugging Face', desc: 'Hub model, dataset, dan library transformers' },
            { name: 'LangChain', desc: 'Framework menyusun aplikasi LLM & RAG' },
            { name: 'LangSmith', desc: 'Tracing dan evaluasi aplikasi LLM' },
            { name: 'CrewAI', desc: 'Framework multi-agent' },
            { name: 'Pinecone', desc: 'Vector database untuk retrieval (RAG)' },
            { name: 'Redis', desc: 'Cache & vector store berlatensi rendah' },
            { name: 'DeepEval', desc: 'Pengujian/evaluasi output LLM' },
          ],
        },
      ],
    },
    {
      id: 'automation',
      code: '04',
      track: 'Tiga Fase',
      title: 'Phase 3 · Automation',
      summary: 'Workflow automation siap produksi: integrasi sistem, deployment, observability, dan orkestrasi proses berbasis AI dengan n8n.',
      duration: '4 minggu',
      source: 'Belajar Hacktiv8',
      blocks: [
        {
          type: 'p',
          text: 'Pelajari cara membangun workflow automation yang siap digunakan di lingkungan produksi melalui integrasi sistem, deployment, observability, serta orkestrasi proses berbasis AI menggunakan **n8n**.',
        },
        {
          type: 'skills',
          items: [
            { name: 'n8n', desc: 'Workflow automation dengan node AI' },
            { name: 'Model Context Protocol', desc: 'Standar menghubungkan LLM ke tools & data' },
            { name: 'Ollama, Gemini, OpenAI', desc: 'Model yang dipanggil dari workflow' },
            { name: 'Docker', desc: 'Menjalankan n8n dan service pendukung' },
            { name: 'PostgreSQL', desc: 'Penyimpanan data workflow & hasil eksekusi' },
            { name: 'VPS & cloud', desc: 'Hetzner, DigitalOcean, Biznet GioCloud, CloudHost, vpsdime' },
          ],
        },
      ],
    },
  ],
};
