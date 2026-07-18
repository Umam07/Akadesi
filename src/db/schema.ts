import { pgTable, uuid, varchar, real, integer, time, timestamp } from "drizzle-orm/pg-core";

export const mahasiswa = pgTable("mahasiswa", {
  id: uuid("id").primaryKey().defaultRandom(),
  nim: varchar("nim", { length: 20 }).notNull().unique(),
  nama: varchar("nama", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  ipk: real("ipk").notNull(),
  totalSksLulus: integer("total_sks_lulus").notNull(),
  semesterAktif: integer("semester_aktif").notNull(),
});

export const mataKuliah = pgTable("mata_kuliah", {
  id: uuid("id").primaryKey().defaultRandom(),
  kodeMk: varchar("kode_mk", { length: 20 }).notNull().unique(),
  namaMk: varchar("nama_mk", { length: 255 }).notNull(),
  sks: integer("sks").notNull(),
  semester: integer("semester").notNull(),
});

export const dosen = pgTable("dosen", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: varchar("nama", { length: 255 }).notNull(),
  nip: varchar("nip", { length: 50 }).notNull().unique(),
});

export const jadwal = pgTable("jadwal", {
  id: uuid("id").primaryKey().defaultRandom(),
  mataKuliahId: uuid("mata_kuliah_id").references(() => mataKuliah.id).notNull(),
  dosenId: uuid("dosen_id").references(() => dosen.id).notNull(),
  hari: varchar("hari", { length: 20 }).notNull(),
  jamMulai: time("jam_mulai").notNull(),
  jamSelesai: time("jam_selesai").notNull(),
  ruangan: varchar("ruangan", { length: 100 }).notNull(),
});

export const krsItem = pgTable("krs_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  mahasiswaId: uuid("mahasiswa_id").references(() => mahasiswa.id).notNull(),
  mataKuliahId: uuid("mata_kuliah_id").references(() => mataKuliah.id).notNull(),
  semesterAjaran: varchar("semester_ajaran", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('disetujui'),
});

export const khs = pgTable("khs", {
  id: uuid("id").primaryKey().defaultRandom(),
  mahasiswaId: uuid("mahasiswa_id").references(() => mahasiswa.id).notNull(),
  mataKuliahId: uuid("mata_kuliah_id").references(() => mataKuliah.id).notNull(),
  semesterAjaran: varchar("semester_ajaran", { length: 20 }).notNull(),
  nilaiHuruf: varchar("nilai_huruf", { length: 5 }).notNull(),
  bobot: real("bobot").notNull(),
});

export const pengumuman = pgTable("pengumuman", {
  id: uuid("id").primaryKey().defaultRandom(),
  judul: varchar("judul", { length: 255 }).notNull(),
  isi: varchar("isi", { length: 2000 }).notNull(),
  diterbitkanPada: timestamp("diterbitkan_pada").notNull().defaultNow(),
});

export const pengumumanDibaca = pgTable("pengumuman_dibaca", {
  mahasiswaId: uuid("mahasiswa_id").references(() => mahasiswa.id).notNull(),
  pengumumanId: uuid("pengumuman_id").references(() => pengumuman.id).notNull(),
  dibacaPada: timestamp("dibaca_pada").notNull().defaultNow(),
});
