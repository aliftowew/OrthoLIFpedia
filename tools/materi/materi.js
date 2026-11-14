/* Materi kuliah — presentasi yang dibangun ulang menjadi halaman interaktif (4 bahasa).
   Data: <script type="application/json" id="data-materi">. Rute: #/materi, #/materi/<deck>, #/materi/<deck>/<bagian>.
   Disambungkan ke aplikasi lewat dua titik: pengatur rute (window.__MATERI.halaman) dan menu samping (window.__MATERI.nav). */
(function () {
  "use strict";
  var data = null;
  function muat() {
    if (data) return data;
    try { data = JSON.parse(document.getElementById("data-materi").textContent); } catch (e) { data = { deck: [] }; }
    return data;
  }
  function bhs() { return window.__LANG__ || (window.__EN__ ? "en" : "id"); }
  var UI = {
    materi: { id: "Materi kuliah", en: "Lecture materials", zh: "讲座资料", uz: "Maʼruza materiallari" },
    semua: { id: "Semua materi", en: "All materials", zh: "全部资料", uz: "Barcha materiallar" },
    isi: { id: "Daftar isi", en: "Contents", zh: "目录", uz: "Mundarija" },
    bagian: { id: "bagian", en: "sections", zh: "个部分", uz: "boʻlim" },
    sebelum: { id: "Sebelumnya", en: "Previous", zh: "上一部分", uz: "Oldingi" },
    berikut: { id: "Berikutnya", en: "Next", zh: "下一部分", uz: "Keyingi" },
    keAtas: { id: "Ke atas", en: "Back to top", zh: "返回顶部", uz: "Yuqoriga" },
    tidakAda: { id: "Materi tidak ditemukan.", en: "Material not found.", zh: "未找到该资料。", uz: "Material topilmadi." },
    buka: { id: "Buka materi", en: "Open material", zh: "打开资料", uz: "Materialni ochish" },
    rujukan: { id: "Rujukan", en: "References", zh: "参考文献", uz: "Manbalar" },
    perbesar: { id: "Ketuk untuk memperbesar", en: "Tap to enlarge", zh: "点击放大", uz: "Kattalashtirish uchun bosing" },
    tutup: { id: "Tutup", en: "Close", zh: "关闭", uz: "Yopish" },
    asal: { id: "Disusun ulang dari presentasi", en: "Rebuilt from the slide deck", zh: "根据幻灯片改编", uz: "Taqdimot asosida qayta tuzilgan" }
  };
  function t(x) {
    if (x == null) return "";
    if (typeof x === "string") return x;
    var k = bhs();
    return x[k] || x.en || x.id || "";
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function teks(x) { // **tebal** dan baris baru
    return esc(t(x)).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  var IKON = {
    presentasi: '<path d="M2 3h20v13H2z"/><path d="M8 21l4-5 4 5"/>',
    lutut: '<path d="M9 2v7l-2 5 3 8"/><path d="M15 2v7l2 5-3 8"/><circle cx="12" cy="12" r="2"/>',
    lari: '<circle cx="14" cy="4" r="2"/><path d="M6 21l4-6 3 2 2-6 4 2"/><path d="M9 9l4-2 3 3"/>',
    periksa: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    kiri: '<path d="M15 18l-6-6 6-6"/>', kanan: '<path d="M9 18l6-6-6-6"/>', atas: '<path d="M18 15l-6-6-6 6"/>'
  };
  function ikon(n) {
    return '<span class="ikon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em">' + (IKON[n] || IKON.presentasi) + "</svg></span>";
  }
  function deckById(id) { return muat().deck.filter(function (d) { return d.id === id; })[0]; }

  /* ---------- blok ---------- */
  function gambar(id, ket, kelas) {
    var g = muat().gambar[id]; if (!g) return "";
    return '<figure class="mt-gambar ' + (kelas || "") + '"><button type="button" class="mt-perbesar" data-src="' + esc(g.file) + '" data-ket="' + esc(t(ket)) + '" title="' + esc(t(UI.perbesar)) + '">' +
      '<img src="' + esc(g.file) + '" alt="' + esc(t(ket) || id) + '" loading="lazy" width="' + g.w + '" height="' + g.h + '"></button>' +
      (ket ? "<figcaption>" + teks(ket) + "</figcaption>" : "") + "</figure>";
  }
  function blok(b) {
    switch (b.tipe) {
      case "paragraf": return '<p class="mt-par">' + teks(b.teks) + "</p>";
      case "poin": return '<div class="mt-poin">' + (b.judul ? "<h4>" + teks(b.judul) + "</h4>" : "") + "<ul>" + b.butir.map(function (x) { return "<li>" + teks(x) + "</li>"; }).join("") + "</ul></div>";
      case "kartu": return '<div class="mt-kartu kolom-' + (b.kolom || 3) + '">' + b.item.map(function (x) {
        return '<div class="mt-k">' + (x.gambar ? gambar(x.gambar, null, "kecil") : "") + (x.label ? '<div class="mt-label">' + teks(x.label) + "</div>" : "") + "<h4>" + teks(x.judul) + "</h4>" + (x.teks ? "<p>" + teks(x.teks) + "</p>" : "") + "</div>";
      }).join("") + "</div>";
      case "langkah": return '<ol class="mt-langkah">' + b.item.map(function (x, i) {
        return '<li><span class="mt-no">' + (i + 1) + '</span><div>' + (x.label ? '<div class="mt-label">' + teks(x.label) + "</div>" : "") + "<h4>" + teks(x.judul) + "</h4>" + (x.teks ? "<p>" + teks(x.teks) + "</p>" : "") + "</div></li>";
      }).join("") + "</ol>";
      case "angka": return '<div class="mt-angka">' + b.item.map(function (x) {
        return '<div class="mt-a"><div class="mt-nilai">' + esc(x.nilai) + '</div><div class="mt-a-label">' + teks(x.label) + "</div>" + (x.teks ? "<p>" + teks(x.teks) + "</p>" : "") + "</div>";
      }).join("") + "</div>";
      case "tabel": return '<div class="mt-tabel-wadah"><table class="mt-tabel">' + (b.kepala && b.kepala.length ? "<thead><tr>" + b.kepala.map(function (x) { return "<th>" + teks(x) + "</th>"; }).join("") + "</tr></thead>" : "") +
        "<tbody>" + (b.baris || []).map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + teks(x) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
      case "catatan": return '<div class="mt-catatan ' + (b.gaya || "info") + '">' + (b.judul ? "<h4>" + teks(b.judul) + "</h4>" : "") + "<p>" + teks(b.teks) + "</p></div>";
      case "gambar": return gambar(b.id, b.keterangan, "");
      case "galeri": return '<div class="mt-galeri">' + b.item.map(function (x) { return gambar(x.id, x.keterangan, "kecil"); }).join("") + "</div>";
      case "rujukan": return '<ol class="mt-rujukan">' + b.item.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>";
    }
    return "";
  }

  /* ---------- halaman ---------- */
  function daftar() {
    var D = muat();
    var e = el('<div class="artikel mt-daftar"><header class="kepala-bab"><div class="kicker">' + esc(t(UI.materi)) + "</div><h1>" + esc(t(UI.semua)) + "</h1></header>" +
      '<div class="mt-deck-grid">' + D.deck.map(function (d) {
        return '<a class="mt-deck" href="#/materi/' + d.id + '"><div class="mt-deck-ikon ' + (d.warna || "") + '">' + ikon(d.ikon) + "</div><div>" +
          '<div class="mt-label">' + esc(t(d.kicker)) + "</div><h3>" + esc(t(d.judul)) + "</h3><p>" + esc(t(d.ringkas)) + '</p><div class="mt-meta">' + d.bagian.length + " " + esc(t(UI.bagian)) + (d.penyusun ? " · " + esc(d.penyusun) : "") + "</div></div></a>";
      }).join("") + "</div></div>");
    return { el: e, judul: t(UI.materi), kicker: t(UI.semua) };
  }
  function halaman(B, La) {
    if (!B) return daftar();
    var d = deckById(B);
    if (!d) return { el: el('<div class="artikel"><div class="kartu segera-kartu"><p>' + esc(t(UI.tidakAda)) + "</p></div></div>"), judul: t(UI.materi), kicker: t(UI.materi) };
    var D = muat();
    var bag = d.bagian;
    var toc = bag.map(function (s, i) { return '<li><button type="button" data-ke="' + s.id + '"><span class="mt-toc-no">' + (i + 1) + "</span><span>" + esc(t(s.judul)) + "</span></button></li>"; }).join("");
    var isi = bag.map(function (s, i) {
      return '<section class="mt-bagian" id="mt-' + d.id + "-" + s.id + '" data-id="' + s.id + '">' +
        '<div class="mt-bagian-kepala"><span class="mt-bagian-no">' + (i + 1) + "/" + bag.length + "</span>" + (s.kicker ? '<span class="mt-kicker">' + esc(t(s.kicker)) + "</span>" : "") + "</div>" +
        "<h2>" + esc(t(s.judul)) + "</h2>" + (s.pesan ? '<div class="mt-pesan">' + teks(s.pesan) + "</div>" : "") +
        s.blok.map(blok).join("") + "</section>";
    }).join("");
    var logo = d.logo && D.gambar[d.logo] ? '<img class="mt-logo" src="' + esc(D.gambar[d.logo].file) + '" alt="BPJS Ketenagakerjaan">' : "";
    var e = el('<div class="mt-halaman">' +
      '<header class="mt-sampul"><div class="mt-sampul-teks"><div class="kicker"><a href="#/materi">' + esc(t(UI.materi)) + "</a> · " + esc(t(d.kicker)) + "</div><h1>" + esc(t(d.judul)) + "</h1><p>" + esc(t(d.ringkas)) + "</p>" +
      '<div class="mt-meta">' + bag.length + " " + esc(t(UI.bagian)) + (d.penyusun ? " · " + esc(d.penyusun) : "") + " · " + esc(t(UI.asal)) + "</div></div>" + logo + "</header>" +
      '<div class="mt-tata"><nav class="mt-toc" aria-label="' + esc(t(UI.isi)) + '"><details open><summary>' + esc(t(UI.isi)) + "</summary><ol>" + toc + "</ol></details></nav>" +
      '<div class="mt-isi">' + isi + '<div class="mt-kaki"><button type="button" class="tombol garis" data-aksi-materi="atas">' + ikon("atas") + "<span>" + esc(t(UI.keAtas)) + "</span></button>" +
      '<a class="tombol garis" href="#/materi">' + esc(t(UI.semua)) + "</a></div></div></div></div>");
    // daftar isi: gulir tanpa mengganti rute
    e.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-ke]");
      if (b) { var s = e.querySelector('[data-id="' + b.getAttribute("data-ke") + '"]'); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); if (window.matchMedia("(max-width: 960px)").matches) { var dt = e.querySelector(".mt-toc details"); if (dt) dt.open = false; } return; }
      if (ev.target.closest('[data-aksi-materi="atas"]')) { e.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      var g = ev.target.closest(".mt-perbesar");
      if (g) { perbesar(g.getAttribute("data-src"), g.getAttribute("data-ket")); }
    });
    // sorot bagian yang sedang dibaca
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (!x.isIntersecting) return;
          var id = x.target.getAttribute("data-id");
          e.querySelectorAll(".mt-toc [data-ke]").forEach(function (b) { b.classList.toggle("aktif", b.getAttribute("data-ke") === id); });
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      setTimeout(function () { e.querySelectorAll(".mt-bagian").forEach(function (s) { io.observe(s); }); }, 0);
    }
    if (La) setTimeout(function () { var s = e.querySelector('[data-id="' + La + '"]'); if (s) s.scrollIntoView({ block: "start" }); }, 60);
    return { el: e, judul: t(d.judul), kicker: t(UI.materi), hancur: function () { if (io) io.disconnect(); } };
  }
  function perbesar(src, ket) {
    var dlg = el('<div class="mt-lightbox" role="dialog" aria-modal="true"><button type="button" class="mt-tutup" aria-label="' + esc(t(UI.tutup)) + '">×</button><img src="' + esc(src) + '" alt="">' + (ket ? "<p>" + esc(ket) + "</p>" : "") + "</div>");
    var tutup = function () { dlg.remove(); document.removeEventListener("keydown", kb, true); };
    var kb = function (ev) { if (ev.key === "Escape") { ev.stopPropagation(); tutup(); } };
    dlg.addEventListener("click", function (ev) { if (ev.target === dlg || ev.target.closest(".mt-tutup")) tutup(); });
    document.addEventListener("keydown", kb, true);
    document.body.appendChild(dlg);
  }
  function nav(hash) {
    var D = muat(); if (!D.deck.length) return "";
    var buka = (hash || "").indexOf("#/materi") === 0;
    return '<details class="nav-grup"' + (buka ? " open" : "") + '><summary class="nav-label">' + ikon("presentasi") + "<span>" + esc(t(UI.materi)) + "</span></summary>" +
      D.deck.map(function (d) {
        var aktif = hash === "#/materi/" + d.id || hash.indexOf("#/materi/" + d.id + "/") === 0;
        return '<a class="nav-butir' + (aktif ? " aktif" : "") + '" href="#/materi/' + d.id + '" title="' + esc(t(d.judul)) + '">' + ikon(d.ikon) + '<span class="teks">' + esc(t(d.judulPendek || d.judul)) + "</span></a>";
      }).join("") + "</details>";
  }
  window.__MATERI = { halaman: halaman, nav: nav };
})();
