// LocalStorage Keys
const USER_KEY = 'sertifku_user';
const CERTS_KEY = 'sertifku_certificates';

// App State
let currentUser = JSON.parse(localStorage.getItem(USER_KEY)) || null;
let certificates = JSON.parse(localStorage.getItem(CERTS_KEY)) || [];

// DOM Elements
const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');

// Navigation & Views
const navDashboard = document.getElementById('navDashboard');
const navSertifikat = document.getElementById('navSertifikat');
const dashboardView = document.getElementById('dashboardView');
const sertifikatView = document.getElementById('sertifikatView');
const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
const linkSeeAll = document.getElementById('linkSeeAll');

// Modal Elements
const certModal = document.getElementById('certModal');
const btnOpenModals = document.querySelectorAll('.open-modal-btn');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const addCertForm = document.getElementById('addCertForm');

// Image Preview Modal
const imageModal = document.getElementById('imageModal');
const btnCloseImageModal = document.getElementById('btnCloseImageModal');
const previewImg = document.getElementById('previewImg');
const previewTitle = document.getElementById('previewTitle');

// Filter & Search
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize Lucide Icons
function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Format Date Utility
function formatDate(dateString) {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// INIT APPLICATION
function initApp() {
  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }
  initIcons();
}

function showLogin() {
  loginPage.classList.add('active');
  appPage.classList.remove('active');
}

function showApp() {
  loginPage.classList.remove('active');
  appPage.classList.add('active');

  // Set Profile Data
  document.getElementById('userName').textContent = currentUser.nama;
  document.getElementById('userNim').textContent = currentUser.nim;
  document.getElementById('welcomeName').textContent = currentUser.nama.split(' ')[0];
  document.getElementById('userAvatar').textContent = currentUser.nama.charAt(0).toUpperCase();

  renderDashboard();
  renderSertifikatList();
  initIcons();
}

// LOGIN SUBMIT
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nama = document.getElementById('loginNama').value.trim();
  const nim = document.getElementById('loginNim').value.trim();

  if (nama && nim) {
    currentUser = { nama, nim };
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    showApp();
  }
});

// LOGOUT
btnLogout.addEventListener('click', () => {
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  showLogin();
});

// NAVIGATION LOGIC
function switchTab(viewName) {
  if (viewName === 'dashboard') {
    navDashboard.classList.add('active');
    navSertifikat.classList.remove('active');
    dashboardView.classList.add('active');
    sertifikatView.classList.remove('active');
    breadcrumbCurrent.textContent = 'Dashboard';
  } else {
    navSertifikat.classList.add('active');
    navDashboard.classList.remove('active');
    sertifikatView.classList.add('active');
    dashboardView.classList.remove('active');
    breadcrumbCurrent.textContent = 'Sertifikat Saya';
  }
}

if (navDashboard) navDashboard.addEventListener('click', () => switchTab('dashboard'));
if (navSertifikat) navSertifikat.addEventListener('click', () => switchTab('sertifikat'));
if (linkSeeAll) linkSeeAll.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('sertifikat');
});

// RENDER DASHBOARD
function renderDashboard() {
  const total = certificates.length;
  const categories = new Set(certificates.map(c => c.kategori)).size;
  const latest = certificates.length > 0 ? certificates[0].judul : '—';

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCategory').textContent = categories;
  document.getElementById('statLatest').textContent = latest;

  const recentList = document.getElementById('recentList');
  if (!recentList) return;
  recentList.innerHTML = '';

  if (certificates.length === 0) {
    recentList.style.display = 'block';
    recentList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <h4>Belum ada sertifikat</h4>
        <p>Tambahkan sertifikat pertamamu supaya arsipmu mulai terisi.</p>
      </div>
    `;
  } else {
    recentList.style.display = 'grid';
    const recentItems = certificates.slice(0, 3);
    recentItems.forEach((cert) => {
      recentList.appendChild(createCertCard(cert));
    });
  }
}

// RENDER ALL CERTIFICATES
function renderSertifikatList() {
  const listContainer = document.getElementById('allCertList');
  if (!listContainer) return;
  
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const category = categoryFilter ? categoryFilter.value : 'ALL';

  const filtered = certificates.filter(cert => {
    const matchSearch = (cert.judul || '').toLowerCase().includes(search) || (cert.penyelenggara || '').toLowerCase().includes(search);
    const matchCategory = category === 'ALL' || cert.kategori === category;
    return matchSearch && matchCategory;
  });

  listContainer.innerHTML = '';

  if (filtered.length === 0) {
    listContainer.style.display = 'block';
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <h4>Belum ada sertifikat</h4>
        <p>Tambahkan sertifikat pertamamu supaya arsipmu mulai terisi.</p>
      </div>
    `;
  } else {
    listContainer.style.display = 'grid';
    filtered.forEach((cert) => {
      listContainer.appendChild(createCertCard(cert));
    });
  }
  initIcons();
}

// CREATE CERTIFICATE CARD ELEMENT
function createCertCard(cert) {
  const card = document.createElement('div');
  card.className = 'cert-card';
  card.style.cursor = 'pointer';
  
  // Klik area kartu untuk preview sertifikat
  card.onclick = function(e) {
    if (!e.target.closest('.btn-delete')) {
      viewCertificate(cert.id);
    }
  };

  card.innerHTML = `
    <div>
      <span class="cert-card-badge">${cert.kategori || 'Sertifikat'}</span>
      <h4>${cert.judul || 'Tanpa Judul'}</h4>
      <p class="organizer">${cert.penyelenggara || '-'}</p>
    </div>
    <div class="cert-card-footer">
      <span>${formatDate(cert.tanggal)}</span>
      <div class="cert-actions">
        <button class="btn-view-img" type="button" onclick="event.stopPropagation(); viewCertificate('${cert.id}')">
          <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Lihat File
        </button>
        <button class="btn-delete" type="button" onclick="event.stopPropagation(); deleteCert('${cert.id}')">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
  `;
  return card;
}

// VIEW CERTIFICATE IMAGE
window.viewCertificate = function(id) {
  const cert = certificates.find(c => c.id === id);
  if (cert) {
    if (cert.image) {
      previewImg.src = cert.image;
      previewTitle.textContent = cert.judul || 'Preview Sertifikat';
      imageModal.classList.add('active');
    } else {
      alert('Sertifikat "' + (cert.judul || 'ini') + '" dibuat sebelum fitur upload file diaktifkan. Silakan hapus dan upload ulang file sertifikatnya.');
    }
  } else {
    alert('File sertifikat tidak ditemukan.');
  }
};

if (btnCloseImageModal) {
  btnCloseImageModal.addEventListener('click', () => {
    imageModal.classList.remove('active');
  });
}

// DELETE CERTIFICATE
window.deleteCert = function(id) {
  if (confirm('Yakin ingin menghapus sertifikat ini?')) {
    certificates = certificates.filter(c => c.id !== id);
    localStorage.setItem(CERTS_KEY, JSON.stringify(certificates));
    renderDashboard();
    renderSertifikatList();
  }
};

// MODAL CONTROLS
btnOpenModals.forEach(btn => {
  btn.addEventListener('click', () => {
    certModal.classList.add('active');
  });
});

function closeModal() {
  certModal.classList.remove('active');
  addCertForm.reset();
}

if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

// ADD CERTIFICATE SUBMIT (WITH IMAGE UPLOAD)
if (addCertForm) {
  addCertForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('certFile');
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
      alert('Silakan pilih file sertifikat terlebih dahulu.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(uploadEvent) {
      const newCert = {
        id: Date.now().toString(),
        judul: document.getElementById('certTitle').value,
        kategori: document.getElementById('certCategory').value,
        tanggal: document.getElementById('certDate').value,
        penyelenggara: document.getElementById('certOrganizer').value,
        image: uploadEvent.target.result
      };

      certificates.unshift(newCert);
      localStorage.setItem(CERTS_KEY, JSON.stringify(certificates));

      closeModal();
      renderDashboard();
      renderSertifikatList();
    };

    reader.readAsDataURL(file);
  });
}

// SEARCH & FILTER EVENTS
if (searchInput) searchInput.addEventListener('input', renderSertifikatList);
if (categoryFilter) categoryFilter.addEventListener('change', renderSertifikatList);

// INITIALIZE APP ON LOAD
document.addEventListener('DOMContentLoaded', initApp);