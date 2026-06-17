const Database = require('better-sqlite3');
const path = require('path');
const data = require('./data.json');

const db = new Database(path.join(__dirname, 'propiedades.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS propiedades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT, tipo TEXT, ubicacion TEXT,
    precio REAL, metraje REAL, link TEXT, imagen TEXT
  )
`);

if (db.prepare('SELECT COUNT(*) as c FROM propiedades').get().c === 0) {
  const ins = db.prepare('INSERT INTO propiedades (nombre,tipo,ubicacion,precio,metraje,link,imagen) VALUES (?,?,?,?,?,?,?)');
  db.transaction(() => data.forEach(p => ins.run(p.nombre||'',p.tipo||'propiedad',p.ubicacion||'',p.precio||0,p.metraje||0,p.link||'',p.imagen||'')))();
}

function buscarPorFiltros({ ubicacion, tipo, precioMin, precioMax, metrajeMin, metrajeMax } = {}) {
  const conds = ['1=1'], params = [];
  if (ubicacion) { conds.push('LOWER(ubicacion) LIKE ?'); params.push('%'+ubicacion.toLowerCase()+'%'); }
  if (tipo) { conds.push('(LOWER(tipo) LIKE ? OR LOWER(nombre) LIKE ?)'); params.push('%'+tipo.toLowerCase()+'%','%'+tipo.toLowerCase()+'%'); }
  if (precioMin) { conds.push('precio >= ?'); params.push(Number(precioMin)); }
  if (precioMax) { conds.push('precio <= ?'); params.push(Number(precioMax)); }
  if (metrajeMin) { conds.push('metraje >= ?'); params.push(Number(metrajeMin)); }
  if (metrajeMax) { conds.push('metraje <= ?'); params.push(Number(metrajeMax)); }
  return db.prepare('SELECT * FROM propiedades WHERE '+conds.join(' AND ')+' ORDER BY precio ASC LIMIT 5').all(...params);
}

function todas() { return db.prepare('SELECT * FROM propiedades').all(); }

module.exports = { buscarPorFiltros, todas, db };