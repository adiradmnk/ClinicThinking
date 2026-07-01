export type DTIItem = {
  number: number
  subscale: 'FT' | 'SK'
  left: string // pole score 1
  right: string // pole score 6
}

export const DTI_ITEMS: DTIItem[] = ([
  // SK items
  { number: 1,  subscale: 'SK', left: 'Sederhana',          right: 'Kompleks' },
  { number: 7,  subscale: 'SK', left: 'Terfragmentasi',     right: 'Terintegrasi' },
  { number: 8,  subscale: 'SK', left: 'Fakta terisolasi',   right: 'Saling terhubung' },
  { number: 9,  subscale: 'SK', left: 'Perifer',            right: 'Sentral' },
  { number: 10, subscale: 'SK', left: 'Terisolasi',         right: 'Saling terkait' },
  { number: 12, subscale: 'SK', left: 'Tidak terorganisir', right: 'Terorganisir' },
  { number: 13, subscale: 'SK', left: 'Sempit',             right: 'Luas' },
  { number: 14, subscale: 'SK', left: 'Minimal',            right: 'Ekstensif' },
  { number: 17, subscale: 'SK', left: 'Individual',         right: 'Berkelompok' },
  { number: 18, subscale: 'SK', left: 'Tidak terkait',      right: 'Saling terkait' },
  { number: 19, subscale: 'SK', left: 'Kurang terorganisir', right: 'Terorganisir baik' },
  { number: 20, subscale: 'SK', left: 'Atipikal',           right: 'Tipikal' },
  { number: 21, subscale: 'SK', left: 'Sedikit',            right: 'Banyak' },
  { number: 22, subscale: 'SK', left: 'Tidak sistematis',   right: 'Sistematis' },
  { number: 25, subscale: 'SK', left: 'Tidak selektif',     right: 'Selektif' },
  { number: 29, subscale: 'SK', left: 'Konkret',            right: 'Abstrak' },
  { number: 31, subscale: 'SK', left: 'Terbatas',           right: 'Tidak terbatas' },
  { number: 33, subscale: 'SK', left: 'Terbagi-bagi',       right: 'Terintegrasi' },
  { number: 37, subscale: 'SK', left: 'Tidak jelas',        right: 'Jelas' },
  { number: 39, subscale: 'SK', left: 'Superfisial',        right: 'Mendalam' },

  // FT items
  { number: 2,  subscale: 'FT', left: 'Pasti',              right: 'Tidak pasti' },
  { number: 3,  subscale: 'FT', left: 'Kaku',               right: 'Fleksibel' },
  { number: 4,  subscale: 'FT', left: 'Satu dimensi',       right: 'Multi dimensi' },
  { number: 5,  subscale: 'FT', left: 'Lambat',             right: 'Cepat' },
  { number: 6,  subscale: 'FT', left: 'Sedikit',            right: 'Banyak' },
  { number: 11, subscale: 'FT', left: 'Tetap',              right: 'Berubah-ubah' },
  { number: 15, subscale: 'FT', left: 'Tetap',              right: 'Dapat disesuaikan' },
  { number: 16, subscale: 'FT', left: 'Konvergen',          right: 'Divergen' },
  { number: 23, subscale: 'FT', left: 'Tertutup',           right: 'Terbuka' },
  { number: 24, subscale: 'FT', left: 'Sedikit',            right: 'Banyak' },
  { number: 26, subscale: 'FT', left: 'Linear',             right: 'Siklis' },
  { number: 27, subscale: 'FT', left: 'Terburu-buru',       right: 'Toleran' },
  { number: 28, subscale: 'FT', left: 'Pasif',              right: 'Aktif' },
  { number: 30, subscale: 'FT', left: 'Rendah',             right: 'Tinggi' },
  { number: 32, subscale: 'FT', left: 'Jarang',             right: 'Sering' },
  { number: 34, subscale: 'FT', left: 'Pasif',              right: 'Aktif' },
  { number: 35, subscale: 'FT', left: 'Rendah',             right: 'Tinggi' },
  { number: 36, subscale: 'FT', left: 'Reaktif',            right: 'Proaktif' },
  { number: 38, subscale: 'FT', left: 'Rendah',             right: 'Tinggi' },
  { number: 40, subscale: 'FT', left: 'Rendah',             right: 'Tinggi' },
  { number: 41, subscale: 'FT', left: 'Kaku',               right: 'Adaptif' },
] as DTIItem[]).sort((a, b) => a.number - b.number)
