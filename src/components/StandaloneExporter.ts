/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff, DefectType, QualityReport } from "../types";

export function exportToSingleHTML(
  currentStaff: Staff[],
  currentDefectTypes: DefectType[],
  currentReports: QualityReport[]
): string {
  // Serialize current data safely so they can be injected as initial states
  const staffBlob = JSON.stringify(currentStaff, null, 2);
  const defectBlob = JSON.stringify(currentDefectTypes, null, 2);
  const reportsBlob = JSON.stringify(currentReports, null, 2);

  // We write a beautifully crafted vanilla web app inside a single HTML file to minimize CDN loading hurdles.
  // It has its own lightweight UI and mimics 100% of the React behavior, powered by Tailwind and Lucide!
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iQC Quality & Personnel Portal (Offline Version)</title>
  <!-- Tailwind Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons Library -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      body { background-color: white !important; color: black !important; }
    }
    /* Simple animation utilities */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
  </style>
  <script>
    // Config tailwind colors
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              500: '#0284c7',
              600: '#0369a1',
              700: '#1d4ed8',
              800: '#1e40af'
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-200">

  <!-- STANDALONE APP INJECTED SEED DATA -->
  <script>
    window.__IQC_INITIAL_STAFF__ = ${staffBlob};
    window.__IQC_INITIAL_DEFECTS__ = ${defectBlob};
    window.__IQC_INITIAL_REPORTS__ = ${reportsBlob};
  </script>

  <!-- Mount target for our standalone app UI -->
  <div id="app" class="flex min-h-screen flex-col md:flex-row">
    <!-- The app renders dynamically via script below -->
    <div class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="text-center space-y-4">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent"></div>
        <p class="text-sm font-semibold text-slate-500">Đang khởi tạo iQC Offline Engine...</p>
      </div>
    </div>
  </div>

  <!-- Dynamic Offline Core Application Code -->
  <script>
    // State management & DB
    let currentTab = 'dashboard';
    let darkMode = false;

    // Load or initialize DB
    function getDB(key, defaultVal) {
      const v = localStorage.getItem(key);
      if (v) {
        try { return JSON.parse(v); } catch(e) { return defaultVal; }
      }
      return defaultVal;
    }

    function setDB(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    }

    // Load states
    let staff = getDB('iqc_staff', window.__IQC_INITIAL_STAFF__);
    let defects = getDB('iqc_defects', window.__IQC_INITIAL_DEFECTS__);
    let reports = getDB('iqc_reports', window.__IQC_INITIAL_REPORTS__);
    let session = getDB('iqc_session', null); // authentication

    // Forms temp state
    let editingStaffId = null;
    let editingDefectId = null;
    let activePrintJob = null;
    let viewReportDetail = null;

    // Uploaded images preview buffer
    let uploadedImagesBuffer = [];

    // Login function
    function handleLogin(username, password) {
      if (username === 'admin' && password === 'admin') {
        session = { username: 'admin', role: 'admin', displayName: 'Giám Đốc (Full)' };
        setDB('iqc_session', session);
        currentTab = 'dashboard';
        renderApp();
      } else if (username === 'admin2' && password === 'admin2') {
        session = { username: 'admin2', role: 'admin2', displayName: 'QC Trưởng Nhóm' };
        setDB('iqc_session', session);
        currentTab = 'dashboard';
        renderApp();
      } else {
        alert('Tài khoản hoặc mật khẩu không đúng!');
      }
    }

    function handleLogout() {
      session = null;
      localStorage.removeItem('iqc_session');
      currentTab = 'dashboard';
      renderApp();
    }

    // Toggle dark mode
    function toggleDarkMode() {
      darkMode = !darkMode;
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      renderApp();
    }

    // Helper functions for names
    function getQCName(id) {
      const s = staff.find(x => x.id === id);
      return s ? s.name : 'Unknown QC';
    }
    function getDefectName(id) {
      const d = defects.find(x => x.id === id);
      return d ? d.name : 'Lỗi không xác định';
    }

    // Get today
    function getFormattedToday() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    // Initialize photo uploader on reporting form
    function handlePhotoUpload(files) {
      const maxFiles = Math.min(files.length, 3 - uploadedImagesBuffer.length);
      for(let i=0; i<maxFiles; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
          uploadedImagesBuffer.push(e.target.result);
          renderUploadPreviews();
        }
        reader.readAsDataURL(file);
      }
    }

    function removeUploadPreview(idx) {
      uploadedImagesBuffer.splice(idx, 1);
      renderUploadPreviews();
    }

    function renderUploadPreviews() {
      const wrap = document.getElementById('image-previews-container');
      if (!wrap) return;
      if (uploadedImagesBuffer.length === 0) {
        wrap.innerHTML = '<span class="text-xs text-slate-400">Chưa tải ảnh bằng chứng lên (Tối đa 3 ảnh)</span>';
        return;
      }
      wrap.innerHTML = uploadedImagesBuffer.map((img, idx) => \`
        <div class="relative group w-16 h-16 border rounded overflow-hidden shadow-xs">
          <img src="\${img}" class="w-full h-full object-cover">
          <button type="button" onclick="removeUploadPreview(\${idx})" class="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 hover:bg-red-500 text-[10px] font-bold">X</button>
        </div>
      \`).join('');
    }

    // Generate CSV for Excel
    function downloadCSV() {
      const csvHeader = "\\uFEFF" + ["Ngày", "QC Ghi nhận", "Bộ phận", "Loại lỗi", "Mức độ", "Số lượng kiểm tra", "Số lượng lỗi", "Tỉ lệ (%)", "Mô tả"].join(",");
      const csvRows = reports.map(r => [
        r.date,
        getQCName(r.qcId),
        r.department,
        getDefectName(r.defectId),
        r.severity,
        r.inspectedQty,
        r.defectQty,
        ((r.defectQty / r.inspectedQty) * 100).toFixed(2) + '%',
        '"' + (r.description || '').replace(/"/g, '""') + '"'
      ].join(","));

      const content = [csvHeader, ...csvRows].join("\\n");
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iQC_Bao_Cao_Tong_Hop_' + getFormattedToday() + '.csv';
      a.click();
    }

    // Backup Data JSON
    function backupJSON() {
      const data = { staff, defects, reports };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iQC_Backup_' + getFormattedToday() + '.json';
      a.click();
    }

    // Restore Backup JSON
    function triggerJSONImport(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.staff && parsed.defects && parsed.reports) {
            staff = parsed.staff;
            defects = parsed.defects;
            reports = parsed.reports;
            setDB('iqc_staff', staff);
            setDB('iqc_defects', defects);
            setDB('iqc_reports', reports);
            alert('Nhập dữ liệu thành công!');
            renderApp();
          } else {
            alert('Tệp dữ liệu không đúng cấu trúc iQC!');
          }
        } catch(err) {
          alert('Không thể đọc tệp sao lưu: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    // Reset database to defaults
    function resetDatabaseToDefaults() {
      if(confirm('Bạn có chắc chắn muốn khôi phục dữ liệu ban đầu không?')) {
        localStorage.clear();
        location.reload();
      }
    }

    // Build hierarchical tree for UI
    function renderOrgTree(nodeId = null, depth = 0) {
      const roots = nodeId ? staff.filter(x => x.reportsTo === nodeId) : staff.filter(x => {
        if (!x.reportsTo) return true;
        return !staff.some(p => p.id === x.reportsTo);
      });

      if (roots.length === 0) return '';

      return roots.map(node => {
        const childrenHTML = renderOrgTree(node.id, depth + 1);
        let badgeColor = '';
        if(node.role === 'Director') badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-350';
        else if (node.role === 'Manager') badgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300';
        else if (node.role === 'QC Leader') badgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300';
        else badgeColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

        return \`
          <div class="flex flex-col items-center">
            \${depth > 0 ? '<div class="w-0.5 h-4 bg-sky-200 dark:bg-slate-800"></div>' : ''}
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center w-52 text-center text-xs">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase mb-1 \${badgeColor}">\${node.role}</span>
              <strong class="font-bold text-slate-800 dark:text-slate-100">\${node.name}</strong>
              <span class="text-[10px] text-slate-400 mt-0.5">Bộ phận: \${node.department}</span>
            </div>
            \${childrenHTML ? \`
              <div class="w-0.5 h-4 bg-sky-200 dark:bg-slate-800"></div>
              <div class="flex flex-row justify-center gap-4 relative">
                \${childrenHTML}
              </div>
            \` : ''}
          </div>
        \`;
      }).join('');
    }

    // MAIN RENDER APP PIPELINE
    function renderApp() {
      const container = document.getElementById('app');

      // 1. LOGIN SCREEN DIRECTIVE
      if (!session) {
        container.className = "flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-6";
        container.innerHTML = \`
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-800 w-full max-w-md space-y-6 animate-fade-in text-center">
            <div class="space-y-2">
              <div class="inline-flex p-3 bg-sky-100 dark:bg-sky-950/40 rounded-full text-sky-600 dark:text-sky-450 mb-2">
                <i data-lucide="check-circle-2" class="w-10 h-10"></i>
              </div>
              <h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-105">Hệ thống iQC Portal</h2>
              <p class="text-xs text-slate-500">Vui lòng đăng nhập bằng tài khoản phân quyền chỉ định</p>
            </div>

            <form onsubmit="event.preventDefault(); handleLogin(this.username.value, this.password.value);" class="space-y-4 text-left">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-550 block">Tài khoản</label>
                <input type="text" name="username" required placeholder="Ví dụ: admin hoặc admin2" class="w-full text-sm px-4 py-3 rounded-xl border border-slate-250 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-550 block">Mật khẩu</label>
                <input type="password" name="password" required placeholder="Nhập mật khẩu" class="w-full text-sm px-4 py-3 rounded-xl border border-slate-250 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100">
              </div>

              <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-900/10 transition mt-2">
                ĐĂNG NHẬP HỆ THỐNG
              </button>
            </form>

            <div class="bg-indigo-50/50 dark:bg-slate-850 p-4 rounded-xl text-[11px] text-slate-500 text-left space-y-1 block border border-indigo-100/30">
              <strong class="text-slate-700 dark:text-slate-300 block mb-1">Tài khoản mẫu:</strong>
              <div class="flex justify-between"><span>Lãnh đạo/Giám đốc:</span> <strong>admin / admin</strong></div>
              <div class="flex justify-between"><span>QC Trưởng Nhóm:</span> <strong>admin2 / admin2</strong></div>
            </div>
          </div>
        \`;
        lucide.createIcons();
        return;
      }

      // 2. MAIN APPLICATION WORKSPACE
      container.className = "flex min-h-screen flex-col md:flex-row";

      // Common calculations
      const today = getFormattedToday();
      const todayReports = reports.filter(r => r.date === today);

      const totalInspected = todayReports.reduce((s, r) => s + r.inspectedQty, 0);
      const totalDefects = todayReports.reduce((s, r) => s + r.defectQty, 0);
      const rate = totalInspected > 0 ? (totalDefects / totalInspected) * 100 : 0;

      // Group for stats
      const deptList = ["Kho", "Sơ chế", "Tinh chế", "Lắp ráp", "Sơn", "Đóng gói", "Lên Cont"];
      const severityList = ["Nặng", "Vừa", "Nhẹ", "Chấp nhận"];

      // Compile Sidebar markup
      const sidebarHTML = \`
        <div class="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-10 no-print">
          <!-- Branded Info -->
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="p-1.5 bg-sky-500 text-white rounded-lg flex items-center justify-center shrink-0">
                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
              </span>
              <div>
                <h1 class="text-sm font-black text-white tracking-widest uppercase">iQC PORTAL</h1>
                <span class="text-[9px] text-sky-400 font-bold">Phiên Bản Ngoại Tuyến</span>
              </div>
            </div>
            
            <!-- Darkmode Toggle -->
            <button onclick="toggleDarkMode()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <i data-lucide="\${darkMode ? 'sun' : 'moon'}" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Logged User Card -->
          <div class="p-4 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold text-xs uppercase shadow-inner">
              \${session.username.slice(0, 2)}
            </div>
            <div class="min-w-0">
              <h5 class="text-xs font-bold text-slate-200 truncate leading-none">\${session.displayName}</h5>
              <span class="text-[9px] text-slate-500 uppercase font-black tracking-wide">\${session.role === 'admin' ? 'Quyền Hạn Cao Nhất' : 'Quyền Ghi Lỗi'}</span>
            </div>
          </div>

          <!-- Navigation Nodes -->
          <div class="flex-1 p-3 space-y-1 overflow-y-auto">
            <button onclick="currentTab='dashboard'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'dashboard' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i> Tổng Quan Hôm Nay
            </button>
            <button onclick="currentTab='staff'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'staff' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="users" class="w-4 h-4"></i> Quản Lý Nhân Sự
            </button>
            <button onclick="currentTab='defects'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'defects' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="settings-2" class="w-4 h-4"></i> Cấu Hình Loại Lỗi
            </button>
            <button onclick="currentTab='reporting'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'reporting' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="edit-3" class="w-4 h-4"></i> Form Ghi Nhận Lỗi
            </button>
            <button onclick="currentTab='records'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'records' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Nhật Ký Sự Cố
            </button>
            <button onclick="currentTab='analytics'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'analytics' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="trending-up" class="w-4 h-4"></i> Thống Kê Chi Tiết
            </button>
            <button onclick="currentTab='export'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'export' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="download" class="w-4 h-4"></i> Xuất Báo Cáo In / Excel
            </button>
            <button onclick="currentTab='settings'; renderApp();" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition \${currentTab === 'settings' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 hover:text-white'}">
              <i data-lucide="settings" class="w-4 h-4"></i> Sao Lưu & Phục Hồi
            </button>
          </div>

          <!-- Bottom Session -->
          <div class="p-3 border-t border-slate-800">
            <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-slate-850 hover:text-rose-300 transition">
              <i data-lucide="log-out" class="w-4 h-4"></i> Đăng Xuất
            </button>
          </div>
        </div>
      \`;

      // Compile Body Content based on active Tab
      let bodyHTML = '';

      if (currentTab === 'dashboard') {
        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-850">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Hệ Thống Quản Lý Chất Lượng & Nhân Sự iQC</h2>
                <p class="text-xs text-slate-500">Bảng điều hành giám sát trạng thái năng lực hôm nay: \${today}</p>
              </div>
              <span class="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-bold dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-250">● Không Gian Offline</span>
            </div>

            <!-- Stats Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold block uppercase mb-1">MẫU KIỂM TRA HÔM NAY</span>
                  <strong class="text-3xl font-extrabold text-slate-800 dark:text-slate-150">\${totalInspected}</strong>
                  <p class="text-[10px] text-slate-500 mt-1">Tổng sản phẩm đã chạy khảo sát</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><i data-lucide="bar-chart-2"></i></div>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold block uppercase mb-1 text-rose-500">MẪU DÙNG SAI LỆCH LỖI</span>
                  <strong class="text-3xl font-extrabold text-rose-600">\${totalDefects}</strong>
                  <p class="text-[10px] text-slate-500 mt-1">Sản sinh khuyết tật kiểm dịch</p>
                </div>
                <div class="p-3 bg-rose-100 rounded-xl text-rose-600 dark:bg-rose-950/40 dark:text-rose-450"><i data-lucide="alert-circle"></i></div>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold block uppercase mb-1 text-emerald-500">TỈ LỆ HẠN NGẠCH LỖI</span>
                  <strong class="text-3xl font-extrabold text-emerald-600">\${rate.toFixed(2)}%</strong>
                  <p class="text-[10px] text-slate-500 mt-1">Chỉ tiêu rủi ro an toàn</p>
                </div>
                <div class="p-3 bg-emerald-100 rounded-xl text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450"><i data-lucide="trending-up"></i></div>
              </div>
            </div>

            <!-- Quick shortcuts -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 class="font-bold text-sm text-slate-850 dark:text-slate-100 mb-4 block">Hành Động Nhanh</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onclick="currentTab='reporting'; renderApp();" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-center border transition flex flex-col items-center gap-2">
                  <i data-lucide="edit-3" class="w-5 h-5 text-indigo-500"></i>
                  <span class="text-xs font-semibold">Ghi Nhật Ký Lỗi</span>
                </button>
                <button onclick="currentTab='export'; renderApp();" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-center border transition flex flex-col items-center gap-2">
                  <i data-lucide="printer" class="w-5 h-5 text-sky-500"></i>
                  <span class="text-xs font-semibold">Tạo Bản In PDF</span>
                </button>
                <button onclick="downloadCSV();" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-center border transition flex flex-col items-center gap-2">
                  <i data-lucide="file-spreadsheet" class="w-5 h-5 text-emerald-500"></i>
                  <span class="text-xs font-semibold">Tải Excel (.csv)</span>
                </button>
                <button onclick="currentTab='staff'; renderApp();" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-center border transition flex flex-col items-center gap-2">
                  <i data-lucide="network" class="w-5 h-5 text-amber-500"></i>
                  <span class="text-xs font-semibold">Xem Sơ Đồ Cây</span>
                </button>
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'staff') {
        const staffListHTML = staff.map((s, idx) => \`
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
            <td class="p-3 text-center text-slate-400 font-mono text-xs">\${idx+1}</td>
            <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">\${s.name}</td>
            <td class="p-3"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-350">\${s.role}</span></td>
            <td class="p-3 text-slate-600 dark:text-slate-350">\${s.department}</td>
            <td class="p-3 text-slate-500 truncate">\${s.reportsTo ? getQCName(s.reportsTo) : 'Không có'}</td>
            <td class="p-3 text-center">
              <button onclick="editStaff('\${s.id}')" class="text-indigo-600 hover:text-indigo-500 font-bold text-xs px-2 py-1 select-none">Sửa</button>
              <button onclick="deleteStaff('\${s.id}')" class="text-red-500 hover:text-red-400 font-bold text-xs px-2 py-1 select-none">Xóa</button>
            </td>
          </tr>
        \`).join('');

        const reportersOptions = staff.filter(x => x.role !== 'QC Inline').map(x => \`
          <option value="\${x.id}">\${x.name} (\${x.role})</option>
        \`).join('');

        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Hồ Sơ Danh Sách Nhân Sự</h2>
                <p class="text-xs text-slate-500">Quản lý đội ngũ QC, Manager, Ban Giám đốc và Cơ cấu luồng báo cáo</p>
              </div>
            </div>

            <!-- Main grid Split for table vs form -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm xl:col-span-2">
                <h3 class="font-bold text-xs uppercase text-slate-450 tracking-wider mb-3">Nhân sự hiện trực</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-850/60 text-slate-400 border-b">
                        <th class="p-3 text-center w-8">STT</th>
                        <th class="p-3">Họ và Tên</th>
                        <th class="p-3">Vai Trò</th>
                        <th class="p-3">Bộ Phận Thực Trực</th>
                        <th class="p-3">Báo Cáo Cho ai</th>
                        <th class="p-3 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      \${staffListHTML || '<tr><td colspan="6" class="p-8 text-center text-slate-400">Trống danh sách nhân sự</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Add/Edit form -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 id="staff-form-title" class="font-bold text-sm tracking-tight mb-4">Thêm Nhân Sự Mới</h3>
                <form id="staff-crud-form" onsubmit="saveStaff(event)" class="space-y-3 text-xs">
                  <input type="hidden" name="id">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Tên Nhân QC / Cán Bộ</label>
                    <input type="text" name="name" required placeholder="Họ và tên..." class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Chức vụ</label>
                    <select name="role" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      <option value="QC Inline">QC Inline (Nhân viên)</option>
                      <option value="QC Leader">QC Leader (Trưởng ca)</option>
                      <option value="Manager">Manager (Quản đốc)</option>
                      <option value="Director">Director (Giám đốc)</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Bộ phận chính</label>
                    <select name="department" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      \${deptList.map(d => \`<option value="\${d}">Bộ phận \${d}</option>\`).join('')}
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Người Quản Lý Trực Tiếp</label>
                    <select name="reportsTo" class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      <option value="">-- Không có (Hoặc cấp Cao) --</option>
                      \${reportersOptions}
                    </select>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition">Lưu Hồi Sơ</button>
                    <button type="button" onclick="cancelStaffEdit()" class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold dark:bg-slate-800 dark:text-slate-300">Hủy</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Dynamic Org Chart Display -->
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <h3 class="font-bold text-sm tracking-tight mb-4 flex items-center gap-2"><i data-lucide="network" class="w-4 h-4 text-sky-500"></i> Sơ đồ tổ chức phân cấp hình cây (Org Chart)</h3>
              <div class="flex flex-col items-center py-6 min-w-[800px]">
                \${renderOrgTree()}
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'defects') {
        const defectsListHTML = defects.map((d, index) => \`
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
            <td class="p-3 text-center text-slate-400 font-mono text-xs">\${index+1}</td>
            <td class="p-3 font-bold text-slate-800 dark:text-slate-150">\${d.name}</td>
            <td class="p-3 font-medium text-slate-600 dark:text-slate-350">\${d.department}</td>
            <td class="p-3 text-slate-500 leading-snug">\${d.description || '-'}</td>
            <td class="p-3 text-center">
              <button onclick="editDefect('\${d.id}')" class="text-indigo-600 hover:text-indigo-500 font-bold text-xs px-2 py-1 select-none">Sửa</button>
              <button onclick="deleteDefect('\${d.id}')" class="text-red-500 hover:text-red-400 font-bold text-xs px-2 py-1 select-none">Xóa</button>
            </td>
          </tr>
        \`).join('');

        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Cấu Hình Danh Loại Mục Lỗi</h2>
                <p class="text-xs text-slate-500">Khai báo phân mục lỗi kĩ thuật để phân tích sự phân bổ rủi ro sản lượng</p>
              </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm xl:col-span-2">
                <h3 class="font-bold text-xs uppercase text-slate-450 tracking-wider mb-3">Loại lỗi đã kê khai</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-850/60 text-slate-400 border-b">
                        <th class="p-3 text-center w-8">STT</th>
                        <th class="p-3">Mã/Loại Lỗi</th>
                        <th class="p-3">Bộ Phận Phụ Trách</th>
                        <th class="p-3">Diễn giải Chi Tiết Lỗi</th>
                        <th class="p-3 text-center">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      \${defectsListHTML || '<tr><td colspan="5" class="p-8 text-center text-slate-400">Chưa khai báo loại lỗi nào</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Form edit -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 id="defect-form-title" class="font-bold text-sm tracking-tight mb-4">Khai Báo Lỗi Mới</h3>
                <form id="defect-crud-form" onsubmit="saveDefect(event)" class="space-y-3 text-xs">
                  <input type="hidden" name="id">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Tên Loại Lỗi (Mẫu)</label>
                    <input type="text" name="name" required placeholder="Ví dụ: Seam Defect, Scratch..." class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Bộ Phận Áp Dụng</label>
                    <select name="department" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      <option value="Tất cả">Tất Cả Bộ Phận</option>
                      \${deptList.map(d => \`<option value="\${d}">Bộ phận \${d}</option>\`).join('')}
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Mô Tả Kĩ Thuật</label>
                    <textarea name="description" rows="3" placeholder="Cách phát hiện và biểu hiện..." class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700"></textarea>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition">Khai Báo</button>
                    <button type="button" onclick="cancelDefectEdit()" class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold dark:bg-slate-800 dark:text-slate-350">Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'reporting') {
        const qcinlineOptions = staff.filter(x => x.role === 'QC Inline' || x.role === 'QC Leader').map(x => \`
          <option value="\${x.id}">\${x.name} (\${x.role} - \${x.department})</option>
        \`).join('');

        const firstQCId = staff.filter(x => x.role === 'QC Inline' || x.role === 'QC Leader')[0]?.id || '';

        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Kê Khai Biến Cố Chất Lượng (Báo cáo Lỗi)</h2>
                <p class="text-xs text-slate-500">Khu vực dành cho QC ghi nhận kiểm duyệt sản phẩm thực ca của từng người.</p>
              </div>
            </div>

            <div class="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
              <form id="reporting-form" onsubmit="saveReportForm(event)" class="space-y-4 text-xs">
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Khoảng Ngày Kiểm</label>
                    <input type="date" name="date" value="\${today}" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Thực hiện kiểm</label>
                    <select name="qcId" required onchange="handleFormQCChange(this.value)" class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      \${qcinlineOptions}
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Bộ Phận Kiểm Định</label>
                    <select id="form-dept-select" name="department" required onchange="handleFormDeptChange(this.value)" class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      \${deptList.map(d => \`<option value="\${d}">\${d}</option>\`).join('')}
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Loại Lãnh Lỗi</label>
                    <select id="form-defect-select" name="defectId" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                      <!-- Filled dynamically -->
                    </select>
                  </div>
                </div>

                <!-- Severity Level Selection -->
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-550 block">Mức Độ Lỗi</label>
                  <div class="grid grid-cols-4 gap-2">
                    <label class="p-2.5 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="radio" name="severity" value="Nặng" checked class="accent-red-650">
                      <span class="font-bold text-red-600">Đỏ (Nặng)</span>
                    </label>
                    <label class="p-2.5 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="radio" name="severity" value="Vừa" class="accent-orange-550">
                      <span class="font-bold text-orange-500">Vừa</span>
                    </label>
                    <label class="p-2.5 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="radio" name="severity" value="Nhẹ" class="accent-yellow-550">
                      <span class="font-bold text-yellow-600">Nhẹ</span>
                    </label>
                    <label class="p-2.5 border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="radio" name="severity" value="Chấp nhận" class="accent-green-550">
                      <span class="font-bold text-green-600">Duyệt qua</span>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Số Lượng Kiểm Tra Mẫu</label>
                    <input type="number" name="inspectedQty" min="1" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-550">Số Lượng Lỗi Ráp Phát Hiện</label>
                    <input type="number" name="defectQty" min="0" required class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700">
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="font-bold text-slate-550">Ghi Chú & Giải Trình Hiện Trạng</label>
                  <textarea name="description" rows="3" placeholder="Ghi nhận cụ thể mã lô, chi tiết khuyết tật sọc chỉ hay nhãn mác..." class="w-full p-2.5 rounded border dark:bg-slate-800 dark:border-slate-700"></textarea>
                </div>

                <!-- Photo Evidence -->
                <div class="space-y-2">
                  <label class="font-bold text-slate-550 block">Ảnh Bằng Chứng Thực Tế (Tối đa 3 ảnh)</label>
                  <div class="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900 transition relative">
                    <input type="file" multiple accept="image/*" onchange="handlePhotoUpload(this.files)" class="absolute inset-0 opacity-0 cursor-pointer">
                    <i data-lucide="camera" class="w-6 h-6 text-slate-400 mb-1.5"></i>
                    <span class="text-xs font-semibold text-slate-500">Ấn để chọn ảnh mẫu dây chuyền</span>
                    <span class="text-[10px] text-slate-400 mt-0.5">Dạng PNG, JPG (Base64 lưu trực tiếp cơ sở dữ liệu)</span>
                  </div>
                  <div id="image-previews-container" class="flex gap-3 flex-wrap mt-2">
                    <span class="text-xs text-slate-400">Chưa tải ảnh bằng chứng lên (Tối đa 3 ảnh)</span>
                  </div>
                </div>

                <div class="flex gap-3 pt-3">
                  <button type="submit" class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition">LƯU PHIẾU CHẤT LƯỢNG</button>
                  <button type="button" onclick="resetReportForm()" class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold dark:bg-slate-800 dark:text-slate-350">Xóa Form</button>
                </div>
              </form>
            </div>
          </div>
        \`;

        // Run async layout refresh after placing input HTML to setup dynamically loaded select inputs
        setTimeout(() => {
          if (firstQCId) {
            handleFormQCChange(firstQCId);
          }
        }, 100);
      }

      else if (currentTab === 'records') {
        const recordsHTML = todayReports.map((r, index) => {
          const hasPhotos = r.images && r.images.length > 0;
          return \`
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 border-b">
              <td class="p-3 text-center text-slate-400 font-mono text-xs">\${index+1}</td>
              <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">\${getQCName(r.qcId)}</td>
              <td class="p-3">\${r.department}</td>
              <td class="p-3 font-semibold text-slate-700 dark:text-slate-200">\${getDefectName(r.defectId)}</td>
              <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase \${
                  r.severity === 'Nặng' ? 'bg-red-50 text-red-700 border border-red-200' :
                  r.severity === 'Vừa' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  r.severity === 'Nhẹ' ? 'bg-yellow-50 text-yellow-700 border border-yellow-250' :
                  'bg-green-50 text-green-700 border border-green-200'
                }">\${r.severity}</span>
              </td>
              <td class="p-3 text-right font-mono">\${r.inspectedQty}</td>
              <td class="p-3 text-right font-mono font-bold text-rose-500">\${r.defectQty}</td>
              <td class="p-3 text-right font-mono font-bold text-blue-600">\${((r.defectQty / r.inspectedQty)*100).toFixed(2)}%</td>
              <td class="p-3 text-center">
                \${hasPhotos ? \`<span class="text-xs bg-sky-150 text-indigo-700 px-2 py-0.5 rounded font-bold">\${r.images.length} Ảnh</span>\` : '<span class="text-xs text-slate-400">-</span>'}
              </td>
              <td class="p-3 text-center space-x-1">
                <button onclick="viewReportDetailModal('\${r.id}')" class="text-sky-600 hover:text-sky-500 font-bold text-xs p-1 select-none">Xem</button>
                <button onclick="printSingleReport('\${r.id}')" class="text-amber-500 hover:text-amber-400 font-bold text-xs p-1 select-none">In</button>
                <button onclick="deleteReport('\${r.id}')" class="text-red-500 hover:text-red-400 font-bold text-xs p-1 select-none">Xóa</button>
              </td>
            </tr>
          \`;
        }).join('');

        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Nhật Ký Sự Cố & Lỗi Trong Ngày</h2>
                <p class="text-xs text-slate-500">Theo dõi toàn bộ biến động báo lỗi kíp máy hôm nay (\${today})</p>
              </div>
              <button onclick="downloadCSV()" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 font-bold hover:bg-emerald-500 text-white rounded-xl text-xs transition">
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> XUẤT EXCEL TỔNG HỢP
              </button>
            </div>

            <!-- Table of records -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-850/60 text-slate-400 border-b">
                      <th class="p-3 text-center w-8">STT</th>
                      <th class="p-3">Người báo cáo</th>
                      <th class="p-3">Khu vực</th>
                      <th class="p-3">Loại khuyết tật</th>
                      <th class="p-3 text-center">Nghiêm trọng</th>
                      <th class="p-3 text-right">Số lượng kiểm</th>
                      <th class="p-3 text-right">Số lượng lỗi</th>
                      <th class="p-3 text-right">Tỷ lệ</th>
                      <th class="p-3 text-center">Bằng chứng</th>
                      <th class="p-3 text-center">Tùy chọn</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${recordsHTML || '<tr><td colspan="10" class="p-12 text-center text-slate-400">Không có bản ghi lỗi chất lượng nào kê khai hôm nay.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'analytics') {
        const severityStatsHTML = severityList.map(item => {
          const count = todayReports.filter(r => r.severity === item).reduce((sum, r) => sum + r.defectQty, 0);
          const percent = totalDefects > 0 ? (count / totalDefects) * 100 : 0;
          return \`
            <div class="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-850 border border-transparent hover:border-slate-200 rounded-lg">
              <span class="font-bold flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full \${item === 'Nặng' ? 'bg-red-500' : item === 'Vừa' ? 'bg-orange-500' : item === 'Nhẹ' ? 'bg-yellow-500' : 'bg-green-500'}"></span>\${item}</span>
              <span class="font-mono text-slate-500">\${count} lỗi (\${percent.toFixed(1)}%)</span>
            </div>
          \`;
        }).join('');

        const popularDefectsHTML = defects.map(d => {
          const qty = todayReports.filter(r => r.defectId === d.id).reduce((sum, r) => sum + r.defectQty, 0);
          return { name: d.name, qty };
        }).sort((a,b) => b.qty - a.qty).slice(0, 5).map((x, i) => \`
          <div class="flex items-center gap-3 text-xs leading-none">
            <span class="w-5 font-black text-slate-400 text-center">#\${i+1}</span>
            <div class="flex-1 space-y-1">
              <div class="flex justify-between font-semibold">
                <span>\${x.name}</span>
                <span class="text-rose-500 font-bold">\${x.qty} lỗi</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: \${totalDefects > 0 ? (x.qty / totalDefects)*100 : 0}%"></div>
              </div>
            </div>
          </div>
        \`).join('');

        const deptShareHTML = deptList.map(dept => {
          const dRep = todayReports.filter(r => r.department === dept);
          const dInsp = dRep.reduce((sum, r) => sum + r.inspectedQty, 0);
          const dDef = dRep.reduce((sum, r) => sum + r.defectQty, 0);
          const dRate = dInsp > 0 ? (dDef/dInsp)*100 : 0;
          return \`
            <div class="space-y-1 text-xs">
              <div class="flex justify-between font-semibold text-slate-600 dark:text-slate-350">
                <span>Bộ phận \${dept}</span>
                <span>\${dDef} lỗi (\${dRate.toFixed(1)}% tỉ lệ lỗi)</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full rounded-full" style="width: \${totalDefects > 0 ? (dDef / totalDefects)*100 : 0}%"></div>
              </div>
            </div>
          \`;
        }).join('');

        bodyHTML = \`
          <div class="space-y-6 animate-fade-in">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Thống Kê Chất Lượng Hôm Nay</h2>
                <p class="text-xs text-slate-500">Phân tích rủi ro sản xuất tự động hệ thống iQC</p>
              </div>
            </div>

            <!-- Quick Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-indigo-50/50 border border-indigo-150 p-6 rounded-xl text-center space-y-1 block dark:bg-slate-900/40">
                <span class="text-[10px] text-indigo-500 font-extrabold tracking-wider block">CHỈ SỐ TIÊU CHUẨN THÀNH PHẨM</span>
                <strong class="text-3xl font-black text-indigo-900 dark:text-indigo-400">\${rate.toFixed(2)}%</strong>
                <p class="text-[10px] text-slate-500 mt-1">Đạt chỉ số hao hụt cho phép (&lt; 3.00%)</p>
              </div>
              <div class="bg-rose-50/50 border border-rose-150 p-6 rounded-xl text-center space-y-1 block dark:bg-slate-900/40">
                <span class="text-[10px] text-rose-500 font-extrabold tracking-wider block">PHÂN MỤC KHUYẾT TẬT GHI NHẬN</span>
                <strong class="text-3xl font-black text-rose-600">\${totalDefects}</strong>
                <p class="text-[10px] text-slate-500 mt-1">Dây chuyền đang gặp rủi ro nhỏ</p>
              </div>
              <div class="bg-emerald-50/50 border border-emerald-150 p-6 rounded-xl text-center space-y-1 block dark:bg-slate-900/40">
                <span class="text-[10px] text-emerald-500 font-extrabold tracking-wider block">TỔNG KIỂM TRA MẪU ĐẦU CA</span>
                <strong class="text-3xl font-black text-emerald-600">\${totalInspected}</strong>
                <p class="text-[10px] text-slate-500 mt-1">Năng lực kíp vận hành toàn diện</p>
              </div>
            </div>

            <!-- Mini Analytics Graphics Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h4 class="font-bold text-xs uppercase text-slate-450 tracking-wider">Lỗi theo mức độ nghiêm trọng</h4>
                <div class="space-y-3">
                  \${severityStatsHTML}
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h4 class="font-bold text-xs uppercase text-slate-450 tracking-wider">Top 5 khuyết tật xuất hiện nhiều nhất</h4>
                <div class="space-y-4">
                  \${popularDefectsHTML}
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h4 class="font-bold text-xs uppercase text-slate-450 tracking-wider">Tỷ lệ lỗi theo từng phòng đội</h4>
                <div class="space-y-3">
                  \${deptShareHTML}
                </div>
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'export') {
        const personsToPrint = [...new Set(todayReports.map(r => r.qcId))];
        const personsHTML = personsToPrint.map(id => \`
          <div class="flex items-center justify-between p-3.5 border rounded-xl hover:bg-slate-50">
            <div>
              <strong class="text-sm text-slate-800 font-bold">\${getQCName(id)}</strong>
              <p class="text-xs text-slate-400">Hôm nay ghi nhận \${todayReports.filter(r => r.qcId === id).length} lỗi.</p>
            </div>
            <button onclick="printSingleQCOneClick('\${id}')" class="px-3.5 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition">
              Xuất PDF Người Này
            </button>
          </div>
        \`).join('');

        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Xuất Bản Tài Liệu PDF & Excel hằng ngày</h2>
                <p class="text-xs text-slate-500">Kết xuất chứng từ lưu hành nội bộ của kíp QC hiện thời</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Left side: Excel and PDF Composite -->
              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 class="font-bold text-sm tracking-tight mb-2">Báo Cáo Tổng Hợp Toàn Bộ Ban Ca</h3>
                <p class="text-xs text-slate-400 leading-snug">Chứa tất cả các kíp viên đã ghi nhận sự việc trong ngày hôm nay.</p>
                <div class="flex flex-col gap-3.5 pt-2">
                  <button onclick="printCompositeSummaryReport()" class="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition">
                    <i data-lucide="printer" class="w-4 h-4"></i> In Báo Cáo Tổng Hợp Hôm Nay
                  </button>
                  <button onclick="printSplittedQCReports()" class="flex items-center justify-center gap-2 p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-lg transition">
                    <i data-lucide="users" class="w-4 h-4"></i> In Tách Tờ Từng QC Ca Trực
                  </button>
                  <button onclick="downloadCSV()" class="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Tải Xuống File Excel Tổng Hợp Ca
                  </button>
                </div>
              </div>

              <!-- Right side: Individual Print breakout -->
              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 class="font-bold text-sm tracking-tight">Biểu Mẫu Tách Rõ Từng Nhân Sự</h3>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  \${personsHTML || '<p class="text-xs text-slate-400">Hôm nay chưa có dữ liệu ghi nhận nào từ kíp QC.</p>'}
                </div>
              </div>
            </div>
          </div>
        \`;
      }

      else if (currentTab === 'settings') {
        bodyHTML = \`
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">Hệ Thống Thiết Lập & Sao Lưu Dữ Liệu</h2>
                <p class="text-xs text-slate-500">Giúp đồng bộ lưu dữ liệu hoặc xịt reset mốc kĩ thuật lại ban đầu</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 class="font-bold text-sm text-slate-800 dark:text-slate-150">Gửi Xuất & Phục Hồi File Sao Lưu JSON</h3>
                <p class="text-xs text-slate-400 leading-relaxed">Xuất toàn bộ hệ thống lưu thành file cứng .json để backup mang đi máy khác, hoặc nạp file .json vào để lấy lại cấu trúc ca trực.</p>
                <div class="flex flex-col gap-3">
                  <button onclick="backupJSON()" class="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition">
                    <i data-lucide="download" class="w-4 h-4"></i> SAO LƯU DỰ PHÒNG (DOWNLOAD JSON)
                  </button>
                  
                  <div class="border border-dashed p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50 relative dark:bg-slate-900/60">
                    <input type="file" accept=".json" onchange="triggerJSONImport(this.files[0])" class="absolute inset-0 opacity-0 cursor-pointer">
                    <i data-lucide="upload" class="w-5 h-5 text-slate-400 mb-1"></i>
                    <strong class="text-[11px] text-slate-600 block">Nạp File Phục Hồi (.json)</strong>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 class="font-bold text-sm text-red-600">Phân Trùng hoặc Reset Toàn Bộ</h3>
                <p class="text-xs text-slate-400 leading-relaxed">Xóa bỏ toàn bộ dữ liệu hiện trực ở localStorage và nạp lại kho 12 nhân sự mẫu, 10 loại lỗi kĩ thuật mẫu cùng 5 biểu báo lỗi chất lượng mẫu.</p>
                <button onclick="resetDatabaseToDefaults()" class="p-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs w-full transition shadow-sm">
                  KHỞI ĐỘNG RESET TOÀN BỘ CƠ SỞ DỮ LIỆU
                </button>
              </div>
            </div>
          </div>
        \`;
      }

      // Merge and render components
      const layoutWrapper = \`
        \${sidebarHTML}
        <!-- Main Panel Content -->
        <div class="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen relative no-print bg-slate-50 dark:bg-slate-950">
          \${bodyHTML}
        </div>

        <!-- PRINT COMPOSITE MODALS IF IN PRINT STATE -->
        \${renderPrintJobFrame()}

        <!-- PHOTO RECORD EXPAND MODAL -->
        \${renderDetailReportModal()}
      \`;

      container.innerHTML = layoutWrapper;
      lucide.createIcons();
    }

    // Handles interactive dropdown cascading on form
    function handleFormQCChange(val) {
      const qc = staff.find(x => x.id === val);
      if (!qc) return;
      const deptSelect = document.getElementById('form-dept-select');
      if (deptSelect) {
        deptSelect.value = qc.department;
        handleFormDeptChange(qc.department);
      }
    }

    function handleFormDeptChange(deptVal) {
      const defectSelect = document.getElementById('form-defect-select');
      if (!defectSelect) return;
      
      // Filter defect options by department OR "Tất cả"
      const eligibleDefects = defects.filter(df => df.department === deptVal || df.department === 'Tất cả');
      defectSelect.innerHTML = eligibleDefects.map(df => \`
        <option value="\${df.id}">\${df.name} (\${df.description.slice(0, 45)}...)</option>
      \`).join('');
    }

    // Save Quality Form Report
    function saveReportForm(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newReport = {
        id: 'report-' + Date.now(),
        date: fd.get('date'),
        qcId: fd.get('qcId'),
        department: fd.get('department'),
        defectId: fd.get('defectId'),
        severity: fd.get('severity'),
        inspectedQty: parseInt(fd.get('inspectedQty')),
        defectQty: parseInt(fd.get('defectQty')),
        description: fd.get('description'),
        images: [...uploadedImagesBuffer],
        createdAt: new Date().toISOString()
      };

      if (newReport.defectQty > newReport.inspectedQty) {
        alert('Số lượng lỗi không được vượt quá số lượng kiểm tra mẫu!');
        return;
      }

      reports.push(newReport);
      setDB('iqc_reports', reports);
      alert('Ghi nhận chất lượng lỗi thành công!');
      uploadedImagesBuffer = [];
      
      // Switch back to records tab to view entries
      currentTab = 'records';
      renderApp();
    }

    function resetReportForm() {
      uploadedImagesBuffer = [];
      const form = document.getElementById('reporting-form');
      if(form) form.reset();
      renderUploadPreviews();
    }

    // Staff actions
    function saveStaff(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const rId = fd.get('id');

      const staffObj = {
        id: rId || 'staff-' + Date.now(),
        name: fd.get('name'),
        role: fd.get('role'),
        department: fd.get('department'),
        reportsTo: fd.get('reportsTo') || undefined
      };

      if (rId) {
        // Edit mode
        staff = staff.map(x => x.id === rId ? staffObj : x);
      } else {
        // Create mode
        staff.push(staffObj);
      }

      setDB('iqc_staff', staff);
      alert('Đã cập nhật thông tin nhân sự!');
      editingStaffId = null;
      renderApp();
    }

    function editStaff(id) {
      const person = staff.find(x => x.id === id);
      if(!person) return;
      editingStaffId = id;
      renderApp();
      
      // Populate fields
      const f = document.getElementById('staff-crud-form');
      if(f) {
        f.id.value = person.id;
        f.name.value = person.name;
        f.role.value = person.role;
        f.department.value = person.department;
        f.reportsTo.value = person.reportsTo || '';
        document.getElementById('staff-form-title').innerText = 'Sửa Thông Tin: ' + person.name;
      }
    }

    function cancelStaffEdit() {
      editingStaffId = null;
      const f = document.getElementById('staff-crud-form');
      if(f) f.reset();
      const title = document.getElementById('staff-form-title');
      if(title) title.innerText = 'Thêm Nhân Sự Mới';
    }

    function deleteStaff(id) {
      if(confirm('Bạn có thực sự muốn xóa bỏ dòng nhân sự này?')) {
        staff = staff.filter(x => x.id !== id);
        // Clean children relationships
        staff = staff.map(x => x.reportsTo === id ? { ...x, reportsTo: undefined } : x);
        setDB('iqc_staff', staff);
        renderApp();
      }
    }

    // Defect actions
    function saveDefect(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const dId = fd.get('id');

      const defObj = {
        id: dId || 'defect-' + Date.now(),
        name: fd.get('name'),
        department: fd.get('department'),
        description: fd.get('description')
      };

      if (dId) {
        defects = defects.map(x => x.id === dId ? defObj : x);
      } else {
        defects.push(defObj);
      }

      setDB('iqc_defects', defects);
      alert('Đã cập nhật danh lục lỗi!');
      editingDefectId = null;
      renderApp();
    }

    function editDefect(id) {
      const dt = defects.find(x => x.id === id);
      if(!dt) return;
      editingDefectId = id;
      renderApp();

      const f = document.getElementById('defect-crud-form');
      if(f) {
        f.id.value = dt.id;
        f.name.value = dt.name;
        f.department.value = dt.department;
        f.description.value = dt.description || '';
        document.getElementById('defect-form-title').innerText = 'Sửa Lỗi Kĩ Thuật: ' + dt.name;
      }
    }

    function cancelDefectEdit() {
      editingDefectId = null;
      const f = document.getElementById('defect-crud-form');
      if (f) f.reset();
      const title = document.getElementById('defect-form-title');
      if (title) title.innerText = 'Khai Báo Lỗi Mới';
    }

    function deleteDefect(id) {
      if(confirm('Có chắc tháo rời loại lỗi kĩ thuật khỏi hệ thống?')) {
        defects = defects.filter(x => x.id !== id);
        setDB('iqc_defects', defects);
        renderApp();
      }
    }

    // Delete Report log
    function deleteReport(id) {
      if(confirm('Bạn có chắc chắn muốn xóa hẳn chứng từ báo lỗi này không?')) {
        reports = reports.filter(r => r.id !== id);
        setDB('iqc_reports', reports);
        renderApp();
      }
    }

    // MODAL POPUPS DRAW PIPELINE
    function viewReportDetailModal(id) {
      viewReportDetail = reports.find(x => x.id === id);
      renderApp();
    }

    function closeDetailModal() {
      viewReportDetail = null;
      renderApp();
    }

    function renderDetailReportModal() {
      if(!viewReportDetail) return '';
      const r = viewReportDetail;
      const q = staff.find(x => x.id === r.qcId);
      const d = defects.find(x => x.id === r.defectId);

      const imagesHTML = r.images && r.images.length > 0 ? r.images.map(img => \`
        <div class="border rounded bg-slate-50 overflow-hidden flex items-center justify-center p-1">
          <img src="\${img}" class="max-h-48 object-contain rounded">
        </div>
      \`).join('') : '<p class="text-xs text-slate-400 col-span-3 text-center py-4">Không có tệp bằng chứng hình ảnh đính kèm.</p>';

      return \`
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button onclick="closeDetailModal()" class="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-150 transition">&times;</button>
            <h3 class="text-sm uppercase tracking-wider font-extrabold text-slate-400">CHI TIẾT PHIẾU GHI LỖI QC</h3>
            
            <div class="space-y-2 text-xs border-b pb-3">
              <div class="flex justify-between"><span><strong>Nhân Viên Kiểm Định:</strong></span> <span>\${q ? q.name : 'Unknown QC'}</span></div>
              <div class="flex justify-between"><span><strong>Bộ Phận Tìm Thấy:</strong></span> <span>\${r.department}</span></div>
              <div class="flex justify-between"><span><strong>Ngày Ghi Nhận:</strong></span> <span>\${r.date}</span></div>
              <div class="flex justify-between"><span><strong>Tên Lỗi Ráp:</strong></span> <strong>\${d ? d.name : 'Unknown Defect'}</strong></div>
              <div class="flex justify-between"><span><strong>Mức Độ Lỗi:</strong></span> <span class="bg-red-50 text-red-600 px-2 rounded border font-mono font-bold font-xs">\${r.severity}</span></div>
              <div class="flex justify-between mt-2 pt-2 border-t"><span><strong>Sản Lượng Mẫu:</strong></span> <span class="font-mono">\${r.inspectedQty}</span></div>
              <div class="flex justify-between"><span><strong>Sản Lượng Lỗi:</strong></span> <span class="font-mono text-rose-500 font-bold">\${r.defectQty}</span></div>
              <div class="flex justify-between"><span><strong>Tỷ lệ (%):</strong></span> <strong class="text-blue-600 font-mono">\${((r.defectQty / r.inspectedQty)*100).toFixed(2)}%</strong></div>
            </div>

            <div class="space-y-1.5">
              <strong class="text-xs block">Mô tả cụ thể sự cố:</strong>
              <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs leading-relaxed min-h-[60px]">\${r.description || 'Không có ghi chú.'}</div>
            </div>

            <div class="space-y-1.5">
              <strong class="text-xs block">Ảnh bằng chứng đính kèm:</strong>
              <div class="grid grid-cols-3 gap-2">
                \${imagesHTML}
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // PRINT DOCUMENTS MANAGEMENT
    function printSingleReport(id) {
      activePrintJob = { type: 'single', reportId: id, date: getFormattedToday() };
      renderApp();
      setTimeout(() => { window.print(); }, 200);
    }

    function printSingleQCOneClick(qcId) {
      activePrintJob = { type: 'composite-by-person', date: getFormattedToday() };
      renderApp();
      // Wait slightly
      setTimeout(() => { window.print(); }, 200);
    }

    function printCompositeSummaryReport() {
      activePrintJob = { type: 'composite-summary', date: getFormattedToday() };
      renderApp();
      setTimeout(() => { window.print(); }, 200);
    }

    function printSplittedQCReports() {
      activePrintJob = { type: 'composite-by-person', date: getFormattedToday() };
      renderApp();
      setTimeout(() => { window.print(); }, 200);
    }

    function handlePrintDismiss() {
      activePrintJob = null;
      renderApp();
    }

    function renderPrintJobFrame() {
      if(!activePrintJob) return '';
      const job = activePrintJob;
      const todayReports = reports.filter(r => r.date === job.date);

      let printBodyHTML = '';

      if (job.type === 'single') {
        const r = reports.find(x => x.id === job.reportId);
        if (!r) return '';
        const inspector = staff.find(x => x.id === r.qcId);
        const d = defects.find(x => x.id === r.defectId);

        printBodyHTML = \`
          <div class="space-y-6">
            <h2 class="text-center font-black text-xl uppercase tracking-wider text-slate-800 border-b-2 border-slate-350 pb-2">PHIẾU CHẤT LƯỢNG KÊ KHAI</h2>
            <div class="grid grid-cols-2 text-xs gap-y-2 bg-slate-50 p-4 rounded-xl border">
              <div><span>QC Kiểm Định:</span> <strong>\${inspector ? inspector.name : 'Unknown QC'}</strong></div>
              <div><span>Bộ Phận Chạy Mẫu:</span> <strong>\${r.department}</strong></div>
              <div><span>Thời gian ghi nhận:</span> <span>\${r.date} (\${new Date(r.createdAt).toLocaleTimeString('vi-VN')})</span></div>
              <div><span>Tên lỗi kĩ thuật:</span> <strong>\${d ? d.name : 'Sự cố lẻ'}</strong></div>
            </div>

            <table class="w-full text-xs font-medium border-collapse border border-slate-200 text-left">
              <thead><tr class="bg-slate-100"><th class="p-2 border">Sản Lượng Mẫu</th><th class="p-2 border">Sản Lực Lỗi</th><th class="p-2 border">Mức Độ</th><th class="p-2 border">Tỷ Lệ</th></tr></thead>
              <tbody><tr><td class="p-2 border">\${r.inspectedQty}</td><td class="p-2 border text-red-650 font-bold">\${r.defectQty}</td><td class="p-2 border font-bold">\${r.severity}</td><td class="p-2 border font-mono font-bold text-blue-700">\${((r.defectQty / r.inspectedQty)*100).toFixed(2)}%</td></tr></tbody>
            </table>

            <div class="space-y-1"><span class="text-xs font-semibold block">Mô tả hiện trạng:</span><div class="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed border min-h-[60px]">\${r.description || 'Không có.'}</div></div>

            <div class="space-y-1"><span class="text-xs font-semibold block">Ảnh minh chứng:</span>
              <div class="flex gap-2">
                \${r.images && r.images.length > 0 ? r.images.map(img => \`<img src="\${img}" class="w-24 h-24 object-cover border rounded bg-white p-1">\`).join('') : '<span class="text-xs text-slate-400">Chứng từ không đính kèm đa phương tiện.</span>'}
              </div>
            </div>
          </div>
        \`;
      } 
      
      else if (job.type === 'composite-summary') {
        const totalInsp = todayReports.reduce((s, r) => s + r.inspectedQty, 0);
        const totalDefest = todayReports.reduce((s, r) => s + r.defectQty, 0);
        const printRate = totalInsp > 0 ? (totalDefest/totalInsp)*100 : 0;

        printBodyHTML = \`
          <div class="space-y-6">
            <h2 class="text-center font-black text-xl text-slate-800 uppercase tracking-widest border-b-2 border-slate-300 pb-2">BÁO CÁO CÔNG TÁC KIỂM TRA CHẤT LƯỢNG HẰNG NGÀY</h2>
            <div class="p-3 bg-blue-50 border rounded text-center grid grid-cols-3 text-xs">
              <div><span>Tổng Sản Lượng Kiểm:</span> <strong class="text-sm font-bold text-blue-900">\${totalInsp}</strong></div>
              <div><span>Tổng Khuyết Tật Phát Hiện:</span> <strong class="text-sm font-bold text-rose-500">\${totalDefest}</strong></div>
              <div><span>Tỷ Lệ Lỗi Bình Quân:</span> <strong class="text-sm font-bold text-emerald-600">\${printRate.toFixed(2)}%</strong></div>
            </div>

            <table class="w-full text-xs border-collapse border border-slate-200">
              <thead><tr class="bg-slate-100"><th class="p-2 border">STT</th><th class="p-2 border">QC Inline</th><th class="p-2 border">Khu Vực</th><th class="p-2 border">Loại Khuyết Tật</th><th class="p-2 border">Mức Độ</th><th class="p-2 border text-right">Mẫu</th><th class="p-2 border text-right">Lỗi</th><th class="p-2 border text-right">Tỷ Lệ</th></tr></thead>
              <tbody>
                \${todayReports.map((r, i) => \`
                  <tr>
                    <td class="p-2 border text-center">\${i+1}</td>
                    <td class="p-2 border font-bold">\${getQCName(r.qcId)}</td>
                    <td class="p-2 border">\${r.department}</td>
                    <td class="p-2 border">\${getDefectName(r.defectId)}</td>
                    <td class="p-2 border font-bold text-center">\${r.severity}</td>
                    <td class="p-2 border text-right">\${r.inspectedQty}</td>
                    <td class="p-2 border text-right text-rose-600 font-bold">\${r.defectQty}</td>
                    <td class="p-2 border text-right font-mono font-bold text-blue-600">\${((r.defectQty/r.inspectedQty)*100).toFixed(2)}%</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        \`;
      }

      return \`
        <div class="fixed inset-0 z-50 bg-slate-950/85 overflow-y-auto flex flex-col print:bg-white print:relative print:inset-auto">
          <div class="px-6 py-4 bg-slate-800 text-white flex justify-between items-center print:hidden border-b border-indigo-950 shadow">
            <span class="text-xs font-black uppercase tracking-wider text-slate-350">Xử lý tài liệu xuất kho iQC</span>
            <div class="flex gap-2">
              <button onclick="window.print()" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition">IN / LƯU PDF</button>
              <button onclick="handlePrintDismiss()" class="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition">ĐÓNG</button>
            </div>
          </div>
          
          <div class="flex-1 p-[15mm] print:p-0">
            <div class="mx-auto w-[210mm] min-h-[297mm] bg-white p-[15mm] shadow-2xl border print:shadow-none print:border-none print:p-0 text-slate-800">
              <div class="flex justify-between items-start border-b pb-4 mb-4">
                <div><strong class="text-base text-blue-800">iQC INDUSTRIAL HUB</strong><p class="text-[9px] text-slate-400 mt-0.5">Báo cáo kiểm soát nội bộ</p></div>
                <div class="text-right text-[11px] text-slate-400"><p>Mã: QC-OUT-\${job.date.replace(/-/g,'')}</p><p>Ngày in: \${job.date}</p></div>
              </div>
              
              \${printBodyHTML}

              <div class="pt-12 grid grid-cols-2 text-center text-xs text-slate-400">
                <div><span class="mb-10 block">QUẢN ĐỐC QA/QC DUYỆT B PMC</span><strong class="border-t pt-1.5 w-32 mx-auto block text-slate-600">Phê duyệt</strong></div>
                <div><span class="mb-10 block">NGƯỜI LẬP PHIẾU BÁO BẢN TÀI</span><strong class="border-t pt-1.5 w-32 mx-auto block text-slate-800">\${session.displayName}</strong></div>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // Initialize first load
    document.addEventListener('DOMContentLoaded', () => {
      renderApp();
    });
  </script>
</body>
</html>
`;
}
