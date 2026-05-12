export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

export function formatTanggalWaktu(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function cekSetorBulanIni(riwayat: { tanggal: Date }[]): boolean {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return riwayat.some(r => new Date(r.tanggal) >= startOfMonth)
}

export function hitungSisaSetoran(jumlahSetoran: number, jumlahDisetor: number, nominalPerSetor: number): number {
  return (jumlahSetoran - jumlahDisetor) * nominalPerSetor
}

export function hitungProgress(jumlahDisetor: number, jumlahSetoran: number): number {
  return Math.round((jumlahDisetor / jumlahSetoran) * 100)
}
