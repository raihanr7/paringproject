// palapa-projects.byRing.js
// Build Layer Control grouped by Palapa Ring (Barat/Tengah/Timur), each contains per-Project overlays (P1, P2, ...).
// Each overlay combines POINT + ALUR filtered by that Project within the Ring.
// Ensures sidebar click + permanent labels like original loaders.

(function(){
  const RINGS = ['Barat','Tengah','Timur'];

  function normalizeProject(v){
    if (!v) return null;
    v = String(v).trim();
    // accept: "P1", "p1", "P-1", "P 1", "Project 1", "Proj 1"
    const m = v.match(/p(?:roject)?\s*[-\s]?(\d+)/i);
    if (m) return 'P'+m[1];
    const m2 = v.match(/p\s*[-\s]?(\d+)/i);
    if (m2) return 'P'+m2[1];
    // last chance: keep alnum
    return v.toUpperCase();
  }

  function getProp(obj, keys){
    for (const k of keys){
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
    }
    return undefined;
  }

  // Small helper to clone a single feature into a Leaflet layer with our styles + events
  function makeLeafletLayerFromFeature(feature, ring, type, dataset){
    let layer;
    if (type === 'point'){
      layer = L.geoJSON(feature, {
        pointToLayer: (f, latlng)=> L.circleMarker(latlng, (typeof styleTitik==='function') ? styleTitik(f) : {radius:6, fillColor:'#00bfff', color:'#000', weight:1, fillOpacity:.8})
      });
    } else {
      layer = L.geoJSON(feature, { style: (typeof styleAlur==='function') ? styleAlur : {color:'#ff9800', weight:2, opacity:.7} });
    }

    layer.eachLayer(l=>{
      // CLICK → open sidebar (same behavior as layers-palapa.js)
      l.on('click', (e)=>{
        try{ L.DomEvent.stopPropagation(e); }catch{}
        window.currentFeature = feature; window.currentLayer = l;
        window.currentTableName = null;
        if (type==='alur'){
          if (ring==='Barat') window.currentTableName = 'Palapa_Ring_Barat_Alur';
          else if (ring==='Tengah') window.currentTableName = 'Palapa_Ring_Tengah_Alur';
          else if (ring==='Timur')  window.currentTableName = 'Palapa_Ring_Timur_Alur';
        }
        if (typeof showSidebar==='function' && typeof buildSidebarContent==='function'){
          const html = buildSidebarContent(feature, dataset || {}, l, window.currentTableName);
          showSidebar(html);
        }
        if (l.getBounds) map.fitBounds(l.getBounds(), { maxZoom: 9 });
        else if (l.getLatLng) map.setView(l.getLatLng(), 9);
      });

      // LABEL titik: gunakan properti 'Nama' jika ada (sama seperti loader asli)
      if (type==='point'){
        const nm = getProp(feature.properties || {}, ['Nama','name','Name','Site','Kota','Lokasi']);
        if (nm){
          l.bindTooltip(nm, { permanent:true, direction:'top', className:'label-nama' });
          if (window.labelOn) l.openTooltip(); else l.closeTooltip();
          (window.allLabelLayers||[]).push(l);
          l.options.title = nm;
        }
        if (window.searchablePointsLayer) window.searchablePointsLayer.addLayer(l);
      }
    });

    return layer;
  }

  async function fetchJSON(url){
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }

  async function buildForRing(ring){
    const lower = ring.toLowerCase();
    const [points, lines] = await Promise.all([
      fetchJSON(`${BASE}/point/${lower}`),
      fetchJSON(`${BASE}/alur/${lower}`),
    ]);

    // Group features by Project code
    const groups = {}; // code => { point:[], alur:[] }
    function assign(feature, type){
      const raw = getProp((feature.properties||{}), ['Project','project','PROJECT','Proyek','Project_ID','ProjectId']);
      const code = normalizeProject(raw);
      if (!code) return;
      if (!groups[code]) groups[code] = { point:[], alur:[] };
      groups[code][type].push(feature);
    }

    (points.features||[]).forEach(f=>assign(f,'point'));
    (lines.features||[]).forEach(f=>assign(f,'alur'));

    // Create/refresh container
    if (!window.groupLayers.palapaByRingProject) window.groupLayers.palapaByRingProject = {};
    window.groupLayers.palapaByRingProject[ring] = window.groupLayers.palapaByRingProject[ring] || {};

    // Remove existing overlays for this ring from control (if any)
    const gc = window.groupedControl;
    const lc = window.layerControl;
    const hasGrouped = !!(gc && typeof gc.addOverlay==='function');

    // Build overlays per project
    const codes = Object.keys(groups).sort((a,b)=>{
      const na = parseInt(a.replace(/\D/g,''))||0;
      const nb = parseInt(b.replace(/\D/g,''))||0;
      return na-nb || a.localeCompare(b);
    });

    const built = {};
    codes.forEach(code=>{
      const g = L.layerGroup();
      const bucket = groups[code];
      // add alur
      (bucket.alur||[]).forEach(f=> makeLeafletLayerFromFeature(f, ring, 'alur', lines).addTo(g));
      // add point
      (bucket.point||[]).forEach(f=> makeLeafletLayerFromFeature(f, ring, 'point', points).addTo(g));
      built[code] = g;
    });

    // Save
    window.groupLayers.palapaByRingProject[ring] = built;

    // Attach to control
    if (attachToLayerControl && hasGrouped){
      Object.entries(built).forEach(([code, layer])=>{
        window.groupedControl.addOverlay(layer, code, `Palapa Ring ${ring}`);
      });
    }else if (attachToLayerControl && lc && typeof lc.addOverlay==='function'){
      // fallback to normal control: label with prefix
      Object.entries(built).forEach(([code, layer])=>{
        lc.addOverlay(layer, `Palapa ${ring} · ${code}`);
      });
    }else{
      // create a grouped control if none exists
      const grouped = { [`Palapa Ring ${ring}`]: {} };
      Object.entries(built).forEach(([code, layer])=> grouped[`Palapa Ring ${ring}`][code] = layer );
      window.groupedControl = L.control.groupedLayers(window.baseLayers || {}, grouped, { groupCheckboxes: true }).addTo(map);
    }

    return built;
  }

  // Public API
  window.initPalapaProjectsByRing = async function(opts={}){
    const attachToLayerControl = !!opts.attachToLayerControl;
    // If you already have a grouped control, keep it; if not, create one minimal first.
    if (!window.groupedControl && window.layerControl){
      // optional: remove old plain control from map if needed (cannot, no reference)
      // We'll just add a new grouped control; user can comment out the old one.
    }

    const all = {};
    for (const ring of RINGS){
      all[ring] = await buildForRing(ring);
    }
    // expose
    window.PALAPA_RING_PROJECTS = all;
    return all;
  };

  // Optional: hook into refreshAllLayers to rebuild per 30s if needed
  const origRefresh = window.refreshAllLayers;
  window.refreshAllLayers = function(){
    if (typeof origRefresh === 'function') origRefresh();
    // rebuild in background (not blocking UI)
    setTimeout(()=>{ window.initPalapaProjectsByRing().catch(console.error); }, 500);
  };
})();
