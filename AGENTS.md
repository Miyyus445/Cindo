<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Aturan Kerja Cindo (wajib untuk AI agent)

- Bahasa Indonesia, laporan ringkas dan jujur: sebut yang gagal atau tidak sempat dites.
- Shell = PowerShell 5.1: pakai `;` (bukan `&&`), jangan pakai `head`, `cat`, `ls -la`.
- Tes API: `bun run test` di apps/api (vitest), BUKAN `bun test`. Pertahankan tes lama, hanya tambah tes.
- apps/api memakai ESM: import lokal pakai ekstensi `.js`, ikuti pola file yang ada.
- apps/web: baca apps/web/AGENTS.md dan dokumentasi Next.js terpasang sebelum memakai API Next yang tidak pasti.
- JANGAN membaca, menampilkan, atau menyalin isi `.env`; jangan membuat file `.env` baru. Secret (password, API key, JWT_SECRET, token) tidak boleh muncul di log, error, respons, atau kode.
- JANGAN git add, commit, atau push. JANGAN menghapus atau mengubah apa pun di luar folder project.
- JANGAN menjalankan server (`bun run dev`) dan jangan mematikan proses. Pengguna yang tes manual.
- Tetap di scope tiket; file di luar scope jangan disentuh.
- Selesai: `bun run lint` + `bun run build` (apps/web) atau `bun run test` + `bun run build` (apps/api), lalu `git status --short`.
- Kalau ada error: maksimal 2 percobaan perbaikan, lalu BERHENTI dan tampilkan pesan error lengkap (tanpa secret).