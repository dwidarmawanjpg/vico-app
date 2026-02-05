import type { StepNumber } from './batch';

export interface StepInstruction {
  title: string;
  goal: string;
  parameters?: string[];
  steps: string[];
  timerNote?: string;
}

export const STEP_INSTRUCTIONS: Record<StepNumber, StepInstruction> = {
  1: {
    title: 'Persiapan Bahan',
    goal: 'Menyiapkan parutan kelapa yang bersih dan siap diproses.',
    steps: [
      'Cuci daging kelapa hingga bersih.',
      'Parut kelapa sampai merata.',
      'Timbang parutan (gram/kg) sesuai yang tersedia.',
    ],
  },
  2: {
    title: 'Ekstraksi Santan',
    goal: 'Menghasilkan santan secara konsisten.',
    parameters: [
      'Air: 1:1 → sesuai hasil konversi (mis. 4 kg parut = 4 liter air)',
      'Suhu air: 35–40°C',
      'Pemerasan: maks 5 menit',
    ],
    steps: [
      'Siapkan air hangat kuku (35–40°C).',
      'Campurkan air ke parutan sesuai hasil konversi (1:1).',
      'Tekan Start Timer 5 menit, lalu mulai memeras.',
      'Peras hingga santan terkumpul.',
      'Saring santan ke wadah pemisahan.',
    ],
    timerNote: '05:00 (boleh diubah jika perlu)',
  },
  3: {
    title: 'Pemisahan Krim',
    goal: 'Mendapatkan krim/santan murni (bagian atas).',
    parameters: ['Pemisahan: maks 2 jam'],
    steps: [
      'Setelah santan terkumpul, tutup wadah rapat.',
      'Letakkan di tempat aman, diamkan tanpa terguncang.',
      'Tekan Start Timer 2 jam.',
      'Saat lapisan terlihat, ambil bagian atas (krim/santan murni).',
      'Pindahkan krim ke wadah fermentasi.',
    ],
    timerNote: '02:00:00 (boleh diubah jika perlu)',
  },
  4: {
    title: 'Pengadukan Krim',
    goal: 'Membuat krim tercampur merata sebelum fermentasi.',
    parameters: ['Pengadukan: 30 menit'],
    steps: [
      'Tekan Start Timer 30 menit.',
      'Aduk merata dengan pola:',
      '   • putar ke kiri 2–3 menit',
      '   • lalu putar ke kanan 2–3 menit',
      '   • ulangi sampai total 30 menit',
    ],
    timerNote: '00:30:00 (boleh diubah jika perlu)',
  },
  5: {
    title: 'Fermentasi',
    goal: 'Membentuk lapisan minyak di bagian atas.',
    parameters: ['Fermentasi: 24 jam', 'Suhu fermentasi: 30–40°C'],
    steps: [
      'Setelah pengadukan selesai, tutup wadah rapat.',
      'Letakkan wadah di tempat aman, jangan sering dipindah/diguncang.',
      'Tekan Start Timer 24 jam.',
      'Setelah selesai, cek lapisan minyak terbentuk di bagian atas.',
    ],
    timerNote: '24:00:00 (boleh diubah jika perlu)',
  },
  6: {
    title: 'Ambil Minyak & Saring',
    goal: 'Mengambil minyak tanpa membawa air.',
    steps: [
      'Ambil minyak hanya dari lapisan paling atas.',
      'Hindari batas minyak–air (jangan mengambil dekat garis pemisah).',
      'Saring minyak hingga lebih bersih/jernih.',
    ],
  },
};
