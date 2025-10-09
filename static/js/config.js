// Konstanta & state global
window.BASE = "/api"; // endpoint Flask kamu

// Kelompok layer Palapa & lain-lain (layerGroup kosong sebagai wadah)
window.groupLayers = {
  PalapaRingBarat: { alur: L.layerGroup(), point: L.layerGroup(), all: L.layerGroup() },
  PalapaRingTengah: { alur: L.layerGroup(), point: L.layerGroup(), all: L.layerGroup() },
  PalapaRingTimur: { alur: L.layerGroup(), point: L.layerGroup(), all: L.layerGroup() },
  submarineCable: L.layerGroup()
};
window.skklRepairLayer     = L.layerGroup();
window.backupLinkLayer     = L.layerGroup();
window.linkSatelitLayer    = L.layerGroup();
window.foCutLayer          = L.layerGroup();

// Layer untuk pencarian
window.searchablePointsLayer = L.layerGroup();

// Label on/off
window.labelOn = true;
window.allLabelLayers = [];

// Sidebar state
window.currentFeature   = null;
window.currentLayer     = null;
window.currentTableName = null;
window.isEditMode       = false;
