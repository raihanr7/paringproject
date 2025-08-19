// Inisialisasi map
window.map = L.map('map', { layers: [baseLayers["Google Satellite"]] }).setView([-2.5, 120], 5);

// LEGEND
const legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");
  div.innerHTML =
    "<h4>Keterangan Peta</h4><hr>" +
    "<img src='/static/images/microwave.png' style='width:18px;height:18px;margin-right:8px;'>Microwave/Radio<br>" +
    "<img src='/static/images/backuplink.png' style='width:18px;height:18px;margin-right:8px;'>Backup Link<br>" +
    "<img src='/static/images/linksatelit.png' style='width:18px;height:18px;margin-right:8px;'>Link Satelit Temporer<br>" +
    "<img src='/static/images/repair.png' style='width:18px;height:18px;margin-right:8px;'>Repair SKKL<br>" +
    "<img src='/static/images/exclamation.png' style='width:18px;height:18px;margin-right:8px;'>FO Cut<br><hr>" +
    "<i style='background:#00bfff'></i> Kota Interkoneksi<br>" +
    "<i style='background:#ffff00'></i> Kota Layanan<br>" +
    "<i style='background:#ff9800'></i> Submarine Cable<br><hr>" +
    "<i style='background:green'></i> Okupansi < 50%<br>" +
    "<i style='background:yellow'></i> Okupansi 50–80%<br>" +
    "<i style='background:red'></i> Okupansi > 80%<br>";
  return div;
};
legend.addTo(map);

// LAYER CONTROL
L.control.layers(baseLayers, {
  "Palapa Ring Barat": groupLayers.PalapaRingBarat.all,
  "Palapa Ring Tengah": groupLayers.PalapaRingTengah.all,
  "Palapa Ring Timur": groupLayers.PalapaRingTimur.all,
  "Submarine Cable": groupLayers.submarineCable,
  "SKKL Repair": skklRepairLayer,
  "Backup Link": backupLinkLayer,
  "Link Satelit": linkSatelitLayer,
  "FO Cut": foCutLayer
}).addTo(map);
