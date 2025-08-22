window.formatRupiah = function(nilai){
  if (nilai === undefined || nilai === null) return '-';
  return 'Rp' + Number(nilai).toLocaleString('id-ID', { minimumFractionDigits: 0 });
};


window.showNotification = function(message, type='success'){
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('fadeOut');
    setTimeout(() => el.remove(), 300);
  }, 3000);
};

window.showSidebar = function(html){
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('sidebarContent');
  content.innerHTML = html;
  sidebar.classList.add('open');
};
window.hideSidebar = function(){
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('open');
  window.currentFeature = window.currentLayer = null;
  window.currentTableName = null; window.isEditMode = false;
};

document.getElementById('closeSidebar').addEventListener('click', hideSidebar);
map?.on?.('click', hideSidebar); // aman jika map belum ada