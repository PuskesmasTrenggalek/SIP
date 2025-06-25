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
// Load page content
function loadPage(page) {
  showLoading();
  fetch(`pages/${page}`)
    .then((res) => res.text())
    .then((html) => {
      const content = document.getElementById("content");
      content.classList.remove("fade-in");
      content.innerHTML = html;
      void content.offsetWidth;
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
        <td>${row["TGL. LAHIR"] || ""}</td>
        <td>${row["GOL"] || ""}</td>
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
    "https://script.google.com/macros/s/AKfycbwza69B5neACyqTIuFD8wVWOLUtWwItCjLFiqKtrNtUxnMMpzv-yeWP0W1wGtZ02LLn/exec";
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
      const created = item.created || "-";

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
