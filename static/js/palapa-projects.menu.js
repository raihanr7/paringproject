// palapa-projects.menu.js
// Custom Leaflet control: dropdown per Ring (Barat/Tengah/Timur) -> project list (P1..)
// Toggling checkbox will add/remove corresponding overlay layers.
// Requires: initPalapaProjectsByRing({ attachToLayerControl:false }) has run, so window.groupLayers.palapaByRingProject is ready.

(function(){
  function createEl(tag, cls, html){ const el = document.createElement(tag); if(cls) el.className = cls; if(html!=null) el.innerHTML = html; return el; }
  function kebab(s){ return String(s).toLowerCase().replace(/\s+/g,'-'); }

  // Style (scoped simple)
  const style = document.createElement('style');
  style.textContent = `
  .palapa-menu{ background:#fff;border:1px solid #d1d5db;border-radius:10px;box-shadow:0 1px 6px rgba(0,0,0,.08);overflow:hidden; font:14px/1.2 sans-serif; }
  .palapa-menu .sec{ border-top:1px solid #eee; }
  .palapa-menu .hdr{ display:flex; align-items:center; justify-content:space-between; padding:8px 10px; cursor:pointer; background:#f8fafc; }
  .palapa-menu .hdr span{ font-weight:700; }
  .palapa-menu .list{ display:none; padding:8px 10px; max-height:220px; overflow:auto; }
  .palapa-menu .row{ display:flex; align-items:center; gap:6px; padding:4px 0; }
  .palapa-menu .tools{ display:flex; gap:8px; margin-bottom:6px; }
  .palapa-menu input[type="checkbox"]{ transform: scale(1.05); }
  `;
  document.head.appendChild(style);

  L.Control.PalapaMenu = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function(map){
      const wrap = createEl('div','leaflet-control palapa-menu');
      wrap.appendChild(createEl('div','hdr',`<span>Palapa Ring</span><small>▼</small>`));
      const container = createEl('div','list'); wrap.appendChild(container);

      // top-level behavior
      wrap.querySelector('.hdr').addEventListener('click', ()=>{
        container.style.display = (container.style.display==='block') ? 'none' : 'block';
      });

      // Build per ring sections
      const rings = ['Barat','Tengah','Timur'];
      rings.forEach(ring=>{
        const sec = createEl('div','sec');
        const sh = createEl('div','hdr', `<span>${ring}</span><small>▼</small>`);
        const list = createEl('div','list'); sec.appendChild(sh); sec.appendChild(list);

        sh.addEventListener('click', ()=>{
          list.style.display = (list.style.display==='block') ? 'none' : 'block';
        });

        // tools: select all / none
        const tools = createEl('div','tools');
        const btnAll  = createEl('button', '', 'Semua');
        const btnNone = createEl('button', '', 'Kosongkan');
        [btnAll, btnNone].forEach(b=>{ b.style.cssText='padding:2px 6px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;'; });
        tools.appendChild(btnAll); tools.appendChild(btnNone);
        list.appendChild(tools);

        // list will be filled after data is ready
        list.appendChild(createEl('div','', '<em>Loading…</em>'));

        container.appendChild(sec);

        // populate projects once data exists
        function populate(){
          const store = (window.groupLayers && window.groupLayers.palapaByRingProject && window.groupLayers.palapaByRingProject[ring]) || null;
          if (!store){ setTimeout(populate, 300); return; }
          list.innerHTML = ''; list.appendChild(tools);

          const entries = Object.entries(store).sort((a,b)=>{
            const na = parseInt(a[0].replace(/\D/g,''))||0;
            const nb = parseInt(b[0].replace(/\D/g,''))||0;
            return na-nb || a[0].localeCompare(b[0]);
          });

          entries.forEach(([code, layer])=>{
            const id = `chk-${kebab(ring)}-${kebab(code)}`;
            const row = createEl('label','row', `<input type="checkbox" id="${id}"><span>${code}</span>`);
            const cb = row.querySelector('input');
            cb.addEventListener('change', ()=>{
              if (cb.checked) map.addLayer(layer); else map.removeLayer(layer);
            });
            list.appendChild(row);
          });

          btnAll.addEventListener('click', ()=>{
            list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = true; const row = cb.closest('label'); const code = row.textContent.trim(); map.addLayer(store[code]); });
          });
          btnNone.addEventListener('click', ()=>{
            list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = false; const row = cb.closest('label'); const code = row.textContent.trim(); map.removeLayer(store[code]); });
          });
        }
        populate();
      });

      return wrap;
    }
  });

  L.control.palapaMenu = function(opts){ return new L.Control.PalapaMenu(opts); };
})();
