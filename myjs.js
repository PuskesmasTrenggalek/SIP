function showToast() {
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  toast.show();
}

function showLoading() {
  document.getElementById("loadingOverlay").classList.add("show");
}

function hideLoading() {
  setTimeout(() => {
    document.getElementById("loadingOverlay").classList.remove("show");
  }, 300);
}
function formatTanggal(isoDateStr) {
  if (!isoDateStr) return "-";
  const date = new Date(isoDateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long", // bisa diganti jadi "2-digit" kalau mau 24/06/2025
    year: "numeric",
  });
}
// Load page content
function loadPage(page) {
  // Deteksi apakah ini adalah link eksternal
  const isExternal = /^https?:\/\//i.test(page);

  if (isExternal) {
    // Jika eksternal, buka di tab baru
    window.open(page, "_blank");
    return;
  }

  // Lanjut jika internal
  showLoading();
  fetch(`pages/${page}`)
    .then((res) => res.text())
    .then((html) => {
      const content = document.getElementById("content");
      content.classList.remove("fade-in");
      content.innerHTML = html;
      void content.offsetWidth; // untuk trigger reflow animasi fade-in
      content.classList.add("fade-in");
      hideLoading();

      // Jalankan fungsi inisialisasi sesuai halaman
      switch (page) {
        case "dashboard.html":
          initDashboardAnimation?.();
          initDashboardData?.();
          break;

        case "dokumeninternal.html":
          initsk?.();
          break;

        case "duk.html":
          waitForElement("#tableduk", initDataPegawai);
          break;

        case "link_laporan.html":
          waitForElement("#karyawanTable", initaplikasi);
          break;

        case "pedomaninternal.html":
          initpedoman?.();
          break;

        case "dokumenprofile.html":
          initdokumenprofile?.();
          break;
        case "masterdokumen.html":
          initmasterdokumen?.();
          break;
        case "arsipsuratmasuk.html":
          initarsipsuratmasuk?.();
          break;
        case "dokumeneksternal.html":
          initdkeks?.();
          break;
        case "arsipsuratkeluar.html":
          initsuratkeluar?.();
          break;
        case "pkg.html":
          initchart?.();
          break;
        case "bangkom.html":
          initbangkom?.();
          break;
        case "datasasaran.html":
          initsasaran?.();
          break;
        case "sop.html":
          initsop?.();
          break;
        case "renstra.html":
          initrenstra?.();
          break;
        case "rpk.html":
          initrpk?.();
          break;
        case "blud.html":
          initblud?.();
          break;
        case "manrisk.html":
          initmanrisk?.();
          break;
        case "audit.html":
          initaudit?.();
          break;
        case "k3.html":
          initk3?.();
          break;
         case "ruk.html":
          initruk?.();
          break;
        // Tambahan halaman lain jika perlu
        default:
          // Tidak ada fungsi khusus
          break;
      }
    })
    .catch((error) => {
      document.getElementById("content").innerHTML =
        "<div class='text-danger'>Gagal memuat halaman.</div>";
      console.error("Gagal memuat halaman:", error);
      hideLoading();
    });
}

function waitForElement(selector, callback, interval = 100, timeout = 5000) {
  const start = Date.now();
  const check = () => {
    const el = document.querySelector(selector);
    if (el) {
      callback(el);
    } else if (Date.now() - start < timeout) {
      setTimeout(check, interval);
    } else {
      console.warn("Element not found:", selector);
    }
  };
  check();
}
function initDashboardAnimation() {
  const doctorImage = document.getElementById("doctorImage");
  const cardSection = document.getElementById("cardSection");

  if (doctorImage && cardSection) {
    // Hilangkan scroll horizontal saat animasi
    document.body.classList.add("overflow-hidden-x");

    // Animasikan gambar terlebih dahulu
    doctorImage.classList.add("fade-in-left");

    // Tampilkan card setelah gambar muncul sepenuhnya (delay 1000ms)
    setTimeout(() => {
      cardSection.classList.add("fade-in-right");

      // Setelah animasi selesai, aktifkan scroll kembali
      setTimeout(() => {
        document.body.classList.remove("overflow-hidden-x");
      }, 1300);
    }, 800); // Delay sebelum card muncul
  }
}

function setActiveMenu(activeLink) {
  // Hapus semua menu aktif
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Tandai link ini aktif
  activeLink.classList.add("active");

  // Buka parent collapse jika submenu
  const parentCollapse = activeLink.closest(".collapse");
  if (parentCollapse) {
    const collapseInstance =
      bootstrap.Collapse.getOrCreateInstance(parentCollapse);
    collapseInstance.show();
  }

  // Tutup submenu lain yang bukan induk dari link aktif
  document.querySelectorAll(".collapse").forEach((collapse) => {
    if (collapse !== parentCollapse) {
      const instance = bootstrap.Collapse.getInstance(collapse);
      if (instance && collapse.classList.contains("show")) {
        instance.hide();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadPage("dashboard.html");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.endsWith(".html")) {
        e.preventDefault();
        loadPage(href);
        setActiveMenu(this);

        // Tutup offcanvas jika di mode mobile
        const offcanvas = bootstrap.Offcanvas.getInstance(
          document.getElementById("sidebarOffcanvas")
        );
        if (offcanvas) offcanvas.hide();
      }
    });
  });
});

// dashboard.js

async function updateCounts() {
  const countAsn = document.getElementById("count-asn");
  const countP3k = document.getElementById("count-p3k");
  const countKontrak = document.getElementById("count-kontrak");

  // Reset isi awal: spinner
  countAsn.innerHTML = `<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div>`;
  countP3k.innerHTML = `<div class="spinner-border spinner-border-sm text-success" role="status"><span class="visually-hidden">Loading...</span></div>`;
  countKontrak.innerHTML = `<div class="spinner-border spinner-border-sm text-warning" role="status"><span class="visually-hidden">Loading...</span></div>`;

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyx4M1yXtEWbFiAWz5d3ww-TsKD7zih2D1MEC24DPj1weeC1pIxsQyDIzbnD840KNO5Kg/exec"
    );
    const data = await res.json();

    let asn = 0,
      p3k = 0,
      kontrak = 0;

    data.forEach((item) => {
      const status = item.STATUS?.trim()?.toUpperCase();
      if (status === "ASN") asn++;
      else if (status === "P3K") p3k++;
      else if (status === "KONTRAK") kontrak++;
    });

    countAsn.textContent = `${asn} Orang`;
    countP3k.textContent = `${p3k} Orang`;
    countKontrak.textContent = `${kontrak} Orang`;
  } catch (e) {
    console.error("Error fetching data:", e);
    countAsn.innerHTML = `<span class="text-danger">Gagal</span>`;
    countP3k.innerHTML = `<span class="text-danger">Gagal</span>`;
    countKontrak.innerHTML = `<span class="text-danger">Gagal</span>`;
  }
}

// Panggil setiap kali dashboard ditampilkan
function initDashboardData() {
  updateCounts();
}

// fungsi tampil sk
async function datask() {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwW1nhYeqXPU9_yrGah6eZFtGA-22Wk0YXBTcpm-ZxejA5ZYN4H1fhhifoaLUXBTihn/exec";
  let globalData = [];

  function showLoading() {
    document.getElementById("skTableBody").innerHTML = `
      <tr><td colspan="7" class="text-center text-muted">
        <div class="d-flex justify-content-center align-items-center gap-2">
          <div class="spinner-border text-primary spinner-border-sm"></div>
          <span>Memuat data...</span>
        </div>
      </td></tr>`;
  }

  function showSuccessToast(msg) {
    document.getElementById("toastBody").innerText = msg;
    new bootstrap.Toast(document.getElementById("successToast")).show();
  }

  function renderTable(data) {
    const grouped = {};
    data.forEach((row, i) => {
      const pelayanan = row["NAMA PELAYANAN/ PROGRAM"] || "Tanpa Kategori";
      if (!grouped[pelayanan]) grouped[pelayanan] = [];
      grouped[pelayanan].push({ ...row, _originalIndex: i }); // Simpan index asli
    });

    let html = "";
    Object.entries(grouped).forEach(([group, rows]) => {
      html += `<tr class="table-secondary"><td colspan="7"><strong>${group}</strong></td></tr>`;
      rows.forEach((row) => {
        html += `
        <tr>
          <td>${row["NO. DOKUMEN"] || ""}</td>
          <td>${row["NAMA PELAYANAN/ PROGRAM"] || ""}</td>
          <td>${row["JUDUL SK"] || ""}</td>
          <td>${row["REVISI"] || ""}</td>
          <td>${row["PENERBIT SK"] || ""}</td>
          <td>${
            row["LINK"]
              ? `<a href="${row["LINK"]}" target="_blank" class="badge bg-danger ">
			<i class='fas fa-file-pdf'></i> view </a>`
              : "-"
          }</td>
          <td><button class="btn btn-sm btn-warning" onclick="editData(${
            row._originalIndex
          })">Edit</button></td>
        </tr>`;
      });
    });

    document.getElementById("skTableBody").innerHTML = html;
  }

  function loadData() {
    showLoading();
    fetch(scriptURL)
      .then((res) => res.json())
      .then((data) => {
        globalData = data;
        renderTable(data);
        showSuccessToast("Data berhasil dimuat.");
      })
      .catch(() => {
        document.getElementById(
          "skTableBody"
        ).innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data.</td></tr>`;
      });
  }

  async function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  }

  document
    .getElementById("skForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const action = document.getElementById("formAction").value || "add";
      const index = document.getElementById("formIndex").value;
      const fileInput = document.getElementById("formFile");
      const file = fileInput.files[0];

      const formData = new URLSearchParams();
      formData.append("action", action);
      formData.append("index", index);
      formData.append("NO. DOKUMEN", document.getElementById("formNo").value);
      formData.append(
        "NAMA PELAYANAN/ PROGRAM",
        document.getElementById("formPelayanan").value
      );
      formData.append("JUDUL SK", document.getElementById("formJudul").value);
      formData.append("REVISI", document.getElementById("formRevisi").value);
      formData.append(
        "PENERBIT SK",
        document.getElementById("formPenerbit").value
      );

      if (file) {
        formData.append("fileName", file.name);
        formData.append("mimeType", file.type);
        formData.append("file", await toBase64(file));
      }

      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      fetch(scriptURL, {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            bootstrap.Modal.getInstance(
              document.getElementById("modalForm")
            ).hide();
            loadData();
            showSuccessToast(res.message || "Berhasil!");
          } else {
            Swal.fire("Gagal", res.message, "error");
          }
        })
        .catch(() => {
          Swal.close();
          Swal.fire("Error", "Tidak dapat mengirim data", "error");
        });
    });

  window.editData = (index) => {
    const row = globalData[index];
    document.getElementById("formAction").value = "edit";
    document.getElementById("formIndex").value = index;
    document.getElementById("formNo").value = row["NO. DOKUMEN"];
    document.getElementById("formPelayanan").value =
      row["NAMA PELAYANAN/ PROGRAM"];
    document.getElementById("formJudul").value = row["JUDUL SK"];
    document.getElementById("formRevisi").value = row["REVISI"];
    document.getElementById("formPenerbit").value = row["PENERBIT SK"];
    document.getElementById("formFile").value = "";
    new bootstrap.Modal(document.getElementById("modalForm")).show();
  };

  document.getElementById("searchInput").addEventListener("input", function () {
    const val = this.value.toLowerCase();
    const filtered = globalData.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(val)
    );
    renderTable(filtered);
  });

  window.resetForm = () => {
    document.getElementById("skForm").reset();
    document.getElementById("formAction").value = "add";
    document.getElementById("formIndex").value = "";
  };

  loadData();
}
function initsk() {
  datask();
}

//  tampil data duk
async function initDataPegawai() {
  const tbody = document.getElementById("tableduk");
  if (!tbody) {
    console.warn("Element #tableduk tidak ditemukan");
    return;
  }

  tbody.innerHTML = `
    <tr><td colspan="7" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </td></tr>`;

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyx4M1yXtEWbFiAWz5d3ww-TsKD7zih2D1MEC24DPj1weeC1pIxsQyDIzbnD840KNO5Kg/exec"
    );
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Data kosong.</td></tr>`;
      return;
    }

    const rows = data
      .map(
        (row) => `
      <tr>
        <td>${row["NAMA"] || ""}</td>
        <td>${row["NIP"] || ""}</td>
        <td>${row["TEMPAT LAHIR"] || ""}</td>
        <td>${formatTanggal(row["TGL. LAHIR"]) || ""}</td>
        <td>${row["KET"] || ""}</td>
        <td>${row["JABATAN"] || ""}</td>

      </tr>
    `
      )
      .join("");

    tbody.innerHTML = rows;

    // Hapus DataTable sebelumnya jika sudah ada
    if ($.fn.DataTable.isDataTable("#pegawaiTable")) {
      $("#pegawaiTable").DataTable().destroy();
    }

    // Inisialisasi DataTable baru
    $("#pegawaiTable").DataTable({
      ordering: false,
      pageLength: 10,
      dom: "Bfrtip", // B = Buttons
      buttons: [
        {
          extend: "excel",
          text: "Excel",
          className: "btn btn-sm btn-outline-success",
        },
        {
          extend: "print",
          text: "Cetak",
          className: "btn btn-sm btn-outline-primary",
        },
      ],
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ data",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        paginate: {
          previous: "Sebelumnya",
          next: "Berikutnya",
        },
        zeroRecords: "Tidak ada data ditemukan",
      },
    });
  } catch (error) {
    console.error("Gagal memuat data pegawai:", error);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data.</td></tr>`;
  }
}

// tampil data link aplikasi

async function initaplikasi() {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwoQLpDcvDD0Pf8kPYT8PD2xrYPui6efHHZ_g9ZKA9etOv7Elx10x24DKAO660T-optUw/exec";

  let globalData = [];

  $(document).ready(function () {
    showLoading();

    fetch(scriptURL)
      .then((res) => res.json())
      .then((data) => {
        globalData = data;
        renderTable(globalData);
        hideLoading();
        showSuccessToast("Data berhasil dimuat.");
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
        hideLoading();
      });

    // Submit form tambah
    $("#addForm").on("submit", function (e) {
      e.preventDefault();

      const newData = {
        action: "add",
        Name: $("#addNama").val().trim(),
        URL: $("#url").val().trim(),
      };

      if (!newData.Name || !newData.URL) {
        Swal.fire("Gagal", "Mohon isi semua field wajib.", "warning");
        return;
      }

      Swal.fire({
        title: "Menyimpan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      for (const key in newData) {
        formData.append(key, newData[key]);
      }

      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            showSuccessToast("Data berhasil ditambahkan.");
            $("#addModal").modal("hide");
            globalData.push(newData);
            renderTable(globalData);
            $("#addForm")[0].reset();
          } else {
            Swal.fire(
              "Gagal!",
              res.message || "Gagal menambahkan data.",
              "error"
            );
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire(
            "Error!",
            "Terjadi kesalahan saat menambahkan data.",
            "error"
          );
          console.error(err);
        });
    });

    // Submit form edit
    $("#editForm").on("submit", function (e) {
      e.preventDefault();

      const index = $("#editIndex").val();
      const updatedData = {
        action: "edit",
        index: index,
        Name: $("#editNama").val().trim(),
        URL: $("#editURL").val().trim(),
      };

      Swal.fire({
        title: "Menyimpan perubahan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      for (const key in updatedData) {
        formData.append(key, updatedData[key]);
      }

      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            showSuccessToast("Data berhasil diperbarui.");
            $("#editModal").modal("hide");
            globalData[index] = { ...globalData[index], ...updatedData };
            renderTable(globalData);
          } else {
            Swal.fire(
              "Gagal!",
              res.message || "Gagal menyimpan data.",
              "error"
            );
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire("Error!", "Terjadi kesalahan saat menyimpan.", "error");
          console.error(err);
        });
    });
  });

  function renderTable(data) {
    if ($.fn.DataTable.isDataTable("#karyawanTable")) {
      $("#karyawanTable").DataTable().destroy();
    }

    const tableBody = data
      .map((row, index) => {
        const nomor = index + 1;
        const link = row["URL"];
        const linkHTML = link
          ? `<a href="${link}" target="_blank" class="badge bg-success shadow text-decoration-none"><i class="bi bi-link-45deg"></i> Kunjungi</a>`
          : `<span class="text-muted">-</span>`;

        return `
    <tr>
      <td style="font-size: 15px;" class="text-center">${nomor}.</td>
      <td style="font-size: 15px;" class="text-start">${row["Name"] || ""}</td>
      <td style="font-size: 15px;" class="text-center">${linkHTML}</td>
      
    </tr>`;
      })
      .join("");

    $("#karyawanTable tbody").html(tableBody);
    $("#karyawanTable").DataTable();
  }

  // Fungsi edit
  window.editData = function (index) {
    const row = globalData[index];
    $("#editIndex").val(index);
    $("#editNama").val(row["Name"]);
    $("#editURL").val(row["URL"]);

    $("#editModal").modal("show");
  };

  // Fungsi hapus
  window.deleteData = function (index) {
    const row = globalData[index];

    Swal.fire({
      title: `Hapus laporan "${row["Nama_laporan"]}"?`,
      text: "Data akan dihapus dari Google Sheet.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus...",
          text: "Mohon tunggu sebentar",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const formData = new FormData();
        formData.append("action", "delete");
        formData.append("index", index);

        fetch(scriptURL, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((res) => {
            Swal.close();
            if (res.success) {
              Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
              globalData.splice(index, 1);
              renderTable(globalData);
            } else {
              Swal.fire(
                "Gagal!",
                res.message || "Gagal menghapus data.",
                "error"
              );
            }
          })
          .catch((err) => {
            Swal.close();
            Swal.fire("Error!", "Gagal menghapus data.", "error");
            console.error(err);
          });
      }
    });
  };

  // Toast sukses
  function showSuccessToast(msg) {
    $("#toastBody").text(msg);
    const toastEl = document.getElementById("successToast");
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  // Loading
  function showLoading() {
    const colCount = $("#karyawanTable thead th").length;
    $("#karyawanTable tbody").html(`
    <tr>
      <td colspan="${colCount}" class="text-center">
        <div class="spinner-border spinner-border-sm text-primary me-1" role="status"></div>
        Memuat data...
      </td>
    </tr>
  `);
  }

  function hideLoading() {
    // Tidak perlu isi, karena renderTable akan overwrite.
  }
}

// Tampilan pedoman

async function initpedoman() {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxI8YhkUPi46xqszaDCRk7l_NWJ2VN-k6T5rFkbsCL1Bgp1wgOTkgA3xoUOg7hjItMR/exec";
  let pedomanData = [];
  let selectedIndex = -1;

  $(document).ready(function () {
    loadPedoman();

    $("#btnDeleteConfirm").click(function () {
      deletePedoman(selectedIndex);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("confirmDeleteModal")
      );
      modal.hide();
    });
  });

  function showLoading() {
    const colCount = $("#pedomanTable thead th").length;
    const tds = Array(colCount).fill("<td></td>");
    tds[0] = `<td class="text-center" colspan="${colCount}">
                <div class="spinner-border spinner-border-sm text-primary me-1" role="status"></div>
                Memuat data mohon tunggu......
              </td>`;
    $("#pedomanTable tbody").html(`<tr>${tds.join("")}</tr>`);
  }

  function loadPedoman() {
    showLoading();
    fetch(scriptURL)
      .then((res) => res.json())
      .then((data) => {
        pedomanData = data;
        renderPedomanTable(data);
      })
      .catch((err) => {
        console.error("Gagal memuat data:", err);
        showToast("Gagal memuat data.");
      });
  }

  function renderPedomanTable(data) {
    if ($.fn.DataTable.isDataTable("#pedomanTable")) {
      $("#pedomanTable").DataTable().destroy();
    }

    let tbody = "";
    data.forEach((item, index) => {
      const link = item.fileUrl || "#";
      const nama = item.namaFile || "-";
      const ket = item.keterangan || "-";
      const size = item.ukuran || "-";
      const created = formatTanggal(item.created) || "-";

      tbody += `
      <tr>
        <td>${index + 1}</td>
        <td><i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>${nama}</td>
        <td>${ket}</td>
        <td>${size}</td>
        <td>${created}</td>
        <td>
          <a href="${link}" class="btn btn-sm btn-success" target="_blank" title="Lihat"><i class="bi bi-eye"></i></a>
        </td>
      </tr>
    `;
    });

    $("#pedomanTable tbody").html(tbody);
    $("#pedomanTable").DataTable();
  }

  function confirmDelete(index) {
    selectedIndex = index;
    const modal = new bootstrap.Modal(
      document.getElementById("confirmDeleteModal")
    );
    modal.show();
  }

  function deletePedoman(index) {
    fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "delete",
        index: index,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast("Data berhasil dihapus.");
          pedomanData.splice(index, 1);
          renderPedomanTable(pedomanData);
        } else {
          showToast("Gagal menghapus data.");
        }
      })
      .catch((err) => {
        console.error("Error hapus:", err);
        showToast("Terjadi kesalahan.");
      });
  }

  function showToast(msg) {
    $("#toastBody").text(msg);
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();
  }

  $("#addForm").submit(function (e) {
    e.preventDefault();
    const fileInput = document.getElementById("addFile");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      const base64 = reader.result.split(",")[1];
      const formData = new FormData();
      formData.append("action", "add");
      formData.append("filename", file.name);
      formData.append("file", base64);
      formData.append("mimeType", file.type);
      formData.append("keterangan", $("#addKeterangan").val());
      formData.append("namaFile", $("#addNamaFile").val());

      Swal.fire({
        title: "Mengunggah...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((res) => {
          Swal.close();
          if (res.success) {
            $("#addForm")[0].reset();
            bootstrap.Modal.getInstance(
              document.getElementById("addModal")
            ).hide();
            showToast("Data berhasil ditambahkan.");
            loadPedoman();
          } else {
            Swal.fire("Gagal", res.message, "error");
          }
        })
        .catch((err) => {
          Swal.close();
          Swal.fire("Error", "Terjadi kesalahan.", "error");
          console.error(err);
        });
    };
    reader.readAsDataURL(file);
  });
}

// Tampil data Dokumen Profile

async function initdokumenprofile() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbyvbQoYmS0-b4Daoo9yMCOXXnNoVKuIGZ2eJAKtqJBp_4lTDp7NXLya26CTPie0HWZs/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("dataBody");

    // Tampilkan baris loading di tbody
    tbody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat...</span>
        </div>
        <div>Memuat data...</div>
      </td>
    </tr>
  `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) {
        table.destroy(); // Hancurkan dulu datatable jika sudah ada
      }

      tbody.innerHTML = ""; // Kosongkan setelah data diterima

      data.forEach((item, i) => {
        const row = `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td>${item.Nama_Dokumen || "-"}</td>
          <td class="text-center"><a href="${
            item.fileUrl
          }" target="_blank"><i class="bi bi-file-earmark-pdf-fill fs-4 text-success"></i></a></td>
          <td class="text-center">${item.Ukuran}</td>
        </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#dokumenTable", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
      </tr>
    `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload (dipisah agar bisa dihapus dan dipasang ulang dengan aman)
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const keterangan = document.getElementById("keterangan").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput) return;

    // Nonaktifkan tombol submit
    submitButton.disabled = true;

    // Tampilkan progress
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("keterangan", keterangan);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      // Fake upload progress
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        // Reset progress dan aktifkan tombol submit lagi
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  // Hindari duplikasi event listener
  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload); // hapus dulu jika ada
  uploadForm.addEventListener("submit", handleUpload); // pasang 1x

  // Panggil fungsi utama untuk load data awal
  loadData();
}

// Tampil data master dokumen

async function initmasterdokumen() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbwkzAheoOhEoAew6MvoNxeJuCS_Tr_Bk8AWHjW-DL2KGaROyewRiGWubGgxx9g40RTd/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("dataBody");

    // Tampilkan baris loading di tbody
    tbody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat...</span>
        </div>
        <div>Memuat data...</div>
      </td>
    </tr>
  `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) {
        table.destroy(); // Hancurkan dulu datatable jika sudah ada
      }

      tbody.innerHTML = ""; // Kosongkan setelah data diterima

      data.forEach((item, i) => {
        const row = `
        <tr style="font-size:12px;">
          <td class="text-center">${i + 1}</td>
          <td>${item.nama_dokumen || "-"}</td>
          <td class="text-center"><a href="${
            item.fileUrl
          }" target="_blank"><i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i></a></td>
        </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#dokumenTable", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
      </tr>
    `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload (dipisah agar bisa dihapus dan dipasang ulang dengan aman)
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama_dokumen = document.getElementById("nama_dokumen").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput) return;

    // Nonaktifkan tombol submit
    submitButton.disabled = true;

    // Tampilkan progress
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama_dokumen", nama_dokumen);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      // Fake upload progress
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        // Reset progress dan aktifkan tombol submit lagi
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  // Hindari duplikasi event listener
  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload); // hapus dulu jika ada
  uploadForm.addEventListener("submit", handleUpload); // pasang 1x

  // Panggil fungsi utama untuk load data awal
  loadData();
}

// arsip surat masuk

async function initarsipsuratmasuk() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycby0XWPceDRIbyzt7fkW_cPpUEnmSLmi2-_tf-TnbGVvjBGd1yCuRdsNZmef8nPIMDcB2w/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("dataBody");

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${formatTanggal(item.tanggalSurat)}</td>
      <td>${item.asalSurat || "-"}</td>
      <td>${item.perihal || "-"}</td>
      <td class="text-center">
        <a href="${item.fileUrl}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#dokumenTable", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const tanggalSurat = document.getElementById("tanggalSurat").value;
    const asalSurat = document.getElementById("asalSurat").value;
    const perihal = document.getElementById("perihal").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !tanggalSurat || !asalSurat || !perihal) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("tanggalSurat", tanggalSurat);
      form.append("asalSurat", asalSurat);
      form.append("perihal", perihal);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// arsip surat Keluar

async function initsuratkeluar() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzm-5GMj-mJRrpp_JDPeDSZZSjmPi4ee6PBGIdPYSyNf8VTjKXbSNhoyr9zH6y8nGYv/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("dataBody");

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${formatTanggal(item.tanggalSurat)}</td>
      <td>${item.tujuansurat || "-"}</td>
      <td>${item.perihal || "-"}</td>
      <td class="text-center">
        <a href="${item.fileUrl}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#dokumenTable", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const tanggalSurat = document.getElementById("tanggalSurat").value;
    const tujuansurat = document.getElementById("tujuansurat").value;
    const perihal = document.getElementById("perihal").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !tanggalSurat || !tujuansurat || !perihal) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("tanggalSurat", tanggalSurat);
      form.append("tujuansurat", tujuansurat);
      form.append("perihal", perihal);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// chart
async function initchart() {
  const ctx = document.getElementById("wilayahChart").getContext("2d");
  const wilayahChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "JAWA BARAT",
        "JAWA TIMUR",
        "DKI JAKARTA",
        "SUMATERA UTARA",
        "BANTEN",
        "SUMATERA BARAT",
        "KEPULAUAN RIAU",
      ],
      datasets: [
        {
          label: "Jumlah Didata",
          data: [3467677, 2908508, 2230653, 2048480, 1449205, 456467, 237432],
          backgroundColor: "#e91e63",
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 30, // Tambahkan padding atas untuk menampung angka di atas bar
        },
      },
      scales: {
        x: {
          ticks: {
            callback: function (val, index) {
              return this.getLabelForValue(val).toUpperCase();
            },
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.parsed.y.toLocaleString();
            },
          },
        },
      },
      animation: {
        onComplete: function (animation) {
          const chart = animation.chart;
          const ctx = chart.ctx;
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";

          chart.data.datasets.forEach(function (dataset, i) {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillText(data.toLocaleString(), bar.x, bar.y - 6);
            });
          });
        },
      },
    },
  });
}

// tampil bangkom

async function initbangkom() {
  const tbody = document.getElementById("komptable");
  if (!tbody) {
    console.warn("Element #komptable tidak ditemukan");
    return;
  }

  tbody.innerHTML = `
    <tr><td colspan="18" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </td></tr>`;

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyWcSeTBLg_xR0-_Ey3pwmhfUKXsHP4jOM3lCTX5J0mU3EIW_izOqWwfQ7TPcvqcahsOQ/exec"
    );
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="18" class="text-center text-muted">Data kosong.</td></tr>`;
      return;
    }

    const rows = data
      .map(
        (row) => `
      <tr>
        <td>${row["No"] || ""}</td>
        <td>${row["Nama"] || ""}</td>
        <td>${row["Nik"] || ""}</td>
        <td>${row["JAN"] || ""}</td>
        <td>${row["FEB"] || ""}</td>
        <td>${row["MAR"] || ""}</td>
        <td>${row["APR"] || ""}</td>
        <td>${row["MEI"] || ""}</td>
        <td>${row["JUN"] || ""}</td>
        <td>${row["JUL"] || ""}</td>
        <td>${row["AGST"] || ""}</td>
        <td>${row["SEPT"] || ""}</td>
        <td>${row["OKT"] || ""}</td>
        <td>${row["NOV"] || ""}</td>
        <td>${row["DES"] || ""}</td>
        
        <td>${row["TOTAL"] || ""}</td>
        <td>${row["KET"] || ""}</td>
         <td>${row["%"] ? row["%"] + "%" : ""}</td>

      </tr>
    `
      )
      .join("");

    tbody.innerHTML = rows;

    // Hapus DataTable sebelumnya jika sudah ada
    if ($.fn.DataTable.isDataTable("#bangkomtable")) {
      $("#bangkomtable").DataTable().destroy();
    }

    // Inisialisasi DataTable baru
    $("#bangkomtable").DataTable({
      ordering: false,
      pageLength: 10,
      dom: "Bfrtip", // B = Buttons
      buttons: [
        {
          extend: "excel",
          text: "Excel",
          className: "btn btn-sm btn-outline-success",
        },
        {
          extend: "print",
          text: "Cetak",
          className: "btn btn-sm btn-outline-primary",
        },
      ],
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ data",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        paginate: {
          previous: "Sebelumnya",
          next: "Berikutnya",
        },
        zeroRecords: "Tidak ada data ditemukan",
      },
    });
  } catch (error) {
    console.error("Gagal memuat data pegawai:", error);
    tbody.innerHTML = `<tr><td colspan="18" class="text-center text-danger">Gagal memuat data.</td></tr>`;
  }
}

//Tampilan Data Sasaran
async function initsasaran() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbz21hnOtHaZgLlPdr6Mnsow_Pga3vCvQc3KeqDkENaj-5Crwd2pCunkgt96R65HyNvz/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datasasaran");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

//Data sop

async function initsop() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbwyNupUqJMrekx1SR9PjjD80j9rOub0PWcqYCxGYHFo4WJjBNdktLkQESVXs60sMnwoDA/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datasop");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

//data dokeks
async function initdkeks() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycby0uJpp8kY0suUJMefTNy29NG2-XydKW7LmbYdotTpnMHFL1TzJzBybMvEfqhXv9SQ_eA/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datadokeks");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

//renstra
async function initrenstra() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxGlp_s5Ck4KBp2I9gB7j4Yi2atltH5W0Ng4yUUfjM5D2f4pOHLKvMfzwb8_HHL_4s/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// RUK

async function initruk() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbyiKCVCX5-aHmTDfRgwlfyA6ffhp-prx5rbhz17JfMfRfWam93fODyRwUfKcsppz3E/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// RPK

async function initrpk() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbz4kBv5SPJ9z-5TAa4KVQAucEtMo5pBCXGVRi0Sn46YuCGYC5mtkz9_wdccesNO7DU/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// BLUD LAPORAN 

async function initblud() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxSTI2NHp1D5Xse6nbIXP6VeRDGWgTcIx64paPWMMmvT9YnJCaR2IiAsaReeoHpifef/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// manrisk
async function initmanrisk() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzERw9CWiqeGMS_QsC-C4EDaQHC50XaxHPV7NlAXUfCudbfNuiFSQHomQ7_tBlW965B/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// audit 

async function initaudit() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzAaFAxR8bxPO69Iwy3suZ-ZLbXhDsOgoGuORhpQZJLLWd5h2AHZlFWMzNAzi3tU0xX/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}

// K3
async function initk3() {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbyo8Ba3VFKVUuz9g17ZyWZe96nvyD7At7MpV68UpfKK7w7PF0OwNGfqcXYJvVsbLNzD/exec";
  let table;

  // Toast
  function showToast(message, type = "success") {
    const id = "toast" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("id", id);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Load Data
  async function loadData() {
    const tbody = document.getElementById("datarenstra");

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <div>Memuat data...</div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (table) table.destroy();
      tbody.innerHTML = "";

      [...data].reverse().forEach((item, i) => {
        const row = `
    <tr style="font-size:12px;">
      <td class="text-center">${i + 1}</td>
      <td>${item.nama}</td>
          <td>${item.ukuran}</td>
      <td class="text-center">
        <a href="${item.file}" target="_blank">
          <i class="bi bi-file-earmark-richtext fs-4 text-danger shadow"></i>
        </a>
      </td>
    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      table = new DataTable("#sasaran", { responsive: true });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Gagal memuat data: ${err.message}</td>
        </tr>
      `;
      showToast("Gagal memuat data: " + err.message, "danger");
    }
  }

  // Handler Upload
  async function handleUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    const nama = document.getElementById("nama").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("uploadProgress");
    const submitButton = document.querySelector(
      '#uploadForm button[type="submit"]'
    );

    if (!fileInput || !nama ) {
      showToast("Harap lengkapi semua data", "warning");
      return;
    }

    submitButton.disabled = true;
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      const form = new FormData();
      form.append("action", "add");
      form.append("nama", nama);
      form.append("file", base64);
      form.append("filename", fileInput.name);
      form.append("mimeType", fileInput.type);

      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress = Math.min(100, fakeProgress + 10);
        progressBar.style.width = fakeProgress + "%";
        progressBar.innerText = fakeProgress + "%";
      }, 100);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const result = await res.json();
        clearInterval(interval);
        progressBar.style.width = "100%";
        progressBar.innerText = "100%";

        if (result.success) {
          showToast(result.message, "success");
          document.getElementById("uploadForm").reset();
          bootstrap.Modal.getInstance(
            document.getElementById("uploadModal")
          ).hide();
          loadData();
        } else {
          showToast(result.message, "danger");
        }
      } catch (err) {
        clearInterval(interval);
        showToast("Terjadi kesalahan saat mengunggah.", "danger");
      } finally {
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.innerText = "0%";
          progressContainer.classList.add("d-none");
          submitButton.disabled = false;
        }, 1000);
      }
    };

    reader.readAsDataURL(fileInput);
  }

  const uploadForm = document.getElementById("uploadForm");
  uploadForm.removeEventListener("submit", handleUpload);
  uploadForm.addEventListener("submit", handleUpload);

  loadData();
}
