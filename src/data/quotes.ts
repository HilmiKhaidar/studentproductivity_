export interface Quote {
  text: string;
  author: string;
  category: 'study' | 'productivity' | 'success';
}

export const motivationalQuotes: Quote[] = [
  // Study Quotes
  {
    text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.",
    author: "Nelson Mandela",
    category: "study"
  },
  {
    text: "Belajar tanpa berpikir itu sia-sia, berpikir tanpa belajar itu berbahaya.",
    author: "Confucius",
    category: "study"
  },
  {
    text: "Investasi terbaik adalah investasi pada diri sendiri melalui pendidikan.",
    author: "Benjamin Franklin",
    category: "study"
  },
  {
    text: "Semakin banyak kamu membaca, semakin banyak hal yang akan kamu ketahui.",
    author: "Dr. Seuss",
    category: "study"
  },
  {
    text: "Belajar adalah harta yang akan mengikuti pemiliknya ke mana-mana.",
    author: "Pepatah Tionghoa",
    category: "study"
  },
  
  // Productivity Quotes
  {
    text: "Fokus pada produktif, bukan sibuk. Sibuk belum tentu produktif.",
    author: "Tim Ferriss",
    category: "productivity"
  },
  {
    text: "Cara terbaik untuk memulai adalah berhenti bicara dan mulai melakukan.",
    author: "Walt Disney",
    category: "productivity"
  },
  {
    text: "Produktivitas bukan tentang melakukan lebih banyak, tapi melakukan hal yang tepat.",
    author: "Unknown",
    category: "productivity"
  },
  {
    text: "Jangan tunggu waktu yang tepat, ciptakan waktu yang tepat.",
    author: "Unknown",
    category: "productivity"
  },
  {
    text: "Disiplin adalah jembatan antara tujuan dan pencapaian.",
    author: "Jim Rohn",
    category: "productivity"
  },
  
  // Success Quotes
  {
    text: "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.",
    author: "Colin Powell",
    category: "success"
  },
  {
    text: "Jangan takut gagal, takutlah untuk tidak mencoba.",
    author: "Unknown",
    category: "success"
  },
  {
    text: "Kesuksesan bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci kesuksesan.",
    author: "Albert Schweitzer",
    category: "success"
  },
  {
    text: "Mimpi besar, mulai kecil, tapi yang terpenting adalah memulai.",
    author: "Unknown",
    category: "success"
  },
  {
    text: "Kesuksesan adalah perjalanan, bukan tujuan akhir.",
    author: "Arthur Ashe",
    category: "success"
  },
  {
    text: "Kegagalan adalah kesempatan untuk memulai lagi dengan lebih cerdas.",
    author: "Henry Ford",
    category: "success"
  },
  {
    text: "Percaya pada diri sendiri dan semua yang kamu miliki.",
    author: "Unknown",
    category: "success"
  },
  {
    text: "Kesuksesan datang kepada mereka yang gigih dan tidak pernah menyerah.",
    author: "Unknown",
    category: "success"
  }
];

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

export const getQuoteByCategory = (category: 'study' | 'productivity' | 'success'): Quote => {
  const filtered = motivationalQuotes.filter(q => q.category === category);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

export const getDailyQuote = (): Quote => {
  // Get quote based on day of year (same quote for same day)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
};
