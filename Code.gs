const SHEET_CONFIG = {
  clientes: {
    sheet: 'CLIENTES',
    id: 'IDCliente',
    aliases: {
      Telefono: 'Tel\u00e9fono',
      Observacion: 'Observaci\u00f3n'
    }
  },
  autos: {
    sheet: 'AUTOS',
    id: 'IDAuto',
    aliases: {
      Descripcion: 'Descripci\u00f3n'
    }
  },
  mecanicos: {
    sheet: 'MEC\u00c1NICOS',
    fallbackSheets: ['MECANICOS'],
    id: 'IDMecanicos',
    aliases: {
      'Numero de telefono': 'N\u00famero de tel\u00e9fono',
      Telefono: 'N\u00famero de tel\u00e9fono',
      Nombre: 'Nombre y apellido'
    }
  },
  servicios: {
    sheet: 'SERVICIOS',
    id: 'IDServicio'
  },
  turnos: {
    sheet: 'TURNOS',
    id: 'IDTurno',
    aliases: {
      Mecanico: 'Mec\u00e1nico',
      Servicio: 'Servicios',
      Sena: 'Se\u00f1a',
      TotalServicios: 'TotalServicios',
      'Total Mano Obra': 'Total Mano Obra',
      Pagado: 'Pagado',
      'Faltan pagar': 'Faltan pagar'
    }
  },
  manoObra: {
    sheet: 'MANO DE OBRA',
    id: 'IDMano',
    aliases: {
      Mecanico: 'Mec\u00e1nico'
    }
  }
};

function doGet(e) {
  return route_(e);
}

function doPost(e) {
  return route_(e);
}

function route_(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'getAll');
    const body = parseBody_(e);

    if (action === 'getAll') return json_({ ok: true, data: getAll_() });
    if (action === 'getClientes') return json_({ ok: true, data: getAll_().clientes });
    if (action === 'getAutos') return json_({ ok: true, data: getAll_().autos });
    if (action === 'getTurnos') return json_({ ok: true, data: getAll_().turnos });
    if (action === 'getMecanicos') return json_({ ok: true, data: getAll_().mecanicos });
    if (action === 'getServicios') return json_({ ok: true, data: getAll_().servicios });
    if (action === 'getManoObra') return json_({ ok: true, data: getAll_().manoObra });

    if (action === 'create') {
      const record = createRow_(body.entity, body.values || body);
      return json_({ ok: true, data: { record: record, all: getAll_() } });
    }
    if (action === 'update') {
      const record = updateRow_(body.entity, body.id, body.values || body);
      return json_({ ok: true, data: { record: record, all: getAll_() } });
    }
    if (action === 'delete') {
      const record = deleteRow_(body.entity, body.id);
      return json_({ ok: true, data: { record: record, all: getAll_() } });
    }

    return json_({ ok: false, error: 'Accion no soportada: ' + action });
  } catch (error) {
    return json_({ ok: false, error: error.message, stack: error.stack });
  }
}

function getAll_() {
  return enrichAll_({
    clientes: getRows_('clientes'),
    autos: getRows_('autos'),
    turnos: getRows_('turnos'),
    mecanicos: getRows_('mecanicos'),
    servicios: getRows_('servicios'),
    manoObra: getRows_('manoObra')
  });
}

function getRows_(entity) {
  const sheet = getSheet_(entity);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1)
    .filter((row) => row.some((cell) => cell !== '' && cell !== null))
    .map((row) => rowToObject_(headers, row));
}

function enrichAll_(data) {
  data.clientes = data.clientes.map(normalizeCliente_);
  data.autos = data.autos.map(normalizeAuto_);
  data.mecanicos = data.mecanicos.map(normalizeMecanico_);
  data.turnos = data.turnos.map(normalizeTurno_);
  data.manoObra = data.manoObra.map(normalizeManoObra_);

  data.autos.forEach((auto) => {
    auto.AutoDisplay = buildAutoDisplay_(auto);
  });

  data.turnos.forEach((turno) => {
    turno.TurnoDisplay = buildTurnoDisplay_(turno);
  });

  data.manoObra.forEach((mano) => {
    const turno = resolveRef_(data.turnos, 'IDTurno', ['Fecha y Hora', 'TurnoDisplay'], mano.Turno);
    const mecanico = resolveRef_(data.mecanicos, 'IDMecanicos', ['Nombre y apellido'], mano.Mecanico);
    mano.Subtotal = calculateSubtotal_(mano);
    mano.turno = turno ? turno.IDTurno : valueOrBlank_(mano.Turno);
    mano.mecanico = mecanico ? mecanico.IDMecanicos : valueOrBlank_(mano.Mecanico);
    mano.TurnoDisplay = turno ? buildTurnoDisplay_(turno) : valueOrBlank_(mano.Turno);
    mano.MecanicoDisplay = mecanico ? mecanico['Nombre y apellido'] : valueOrBlank_(mano.Mecanico);
  });

  data.clientes.forEach((cliente) => {
    cliente.idCliente = cliente.IDCliente;
    cliente.label = cliente.Nombre;
    cliente.relatedAutos = data.autos.filter((auto) => sameRef_(auto.Cliente, cliente.IDCliente, cliente.Nombre));
    cliente.relatedTurnos = data.turnos.filter((turno) => sameRef_(turno.Cliente, cliente.IDCliente, cliente.Nombre));
    cliente['Related Autos'] = cliente.relatedAutos;
    cliente['Related Turnos'] = cliente.relatedTurnos;
  });

  data.autos.forEach((auto) => {
    const cliente = resolveRef_(data.clientes, 'IDCliente', ['Nombre'], auto.Cliente);
    auto.idAuto = auto.IDAuto;
    auto.cliente = cliente ? cliente.IDCliente : valueOrBlank_(auto.Cliente);
    auto.ClienteDisplay = cliente ? cliente.Nombre : valueOrBlank_(auto.Cliente);
    auto.relatedTurnos = data.turnos.filter((turno) => sameRef_(turno.Auto, auto.IDAuto, auto.AutoDisplay) || sameRef_(turno.Auto, auto.IDAuto, auto.Patente));
    auto['Related Turnos'] = auto.relatedTurnos;
  });

  data.mecanicos.forEach((mecanico) => {
    mecanico.idMecanicos = mecanico.IDMecanicos;
    mecanico.label = mecanico['Nombre y apellido'];
    mecanico.relatedManoObra = data.manoObra.filter((mano) => sameRef_(mano.Mecanico, mecanico.IDMecanicos, mecanico['Nombre y apellido']));
    mecanico.relatedTurnos = data.turnos.filter((turno) => sameRef_(turno.Mecanico, mecanico.IDMecanicos, mecanico['Nombre y apellido']));
    mecanico['Related Mano de obras'] = mecanico.relatedManoObra;
    mecanico['Related Turnos'] = mecanico.relatedTurnos;
  });

  data.servicios.forEach((servicio) => {
    servicio.idServicio = servicio.IDServicio;
    servicio.label = servicio.Nombre;
    servicio.relatedTurnos = data.turnos.filter((turno) => sameRef_(turno.Servicios, servicio.IDServicio, servicio.Nombre));
    servicio['Related Turnos'] = servicio.relatedTurnos;
  });

  data.turnos.forEach((turno) => {
    const cliente = resolveRef_(data.clientes, 'IDCliente', ['Nombre'], turno.Cliente);
    const auto = resolveRef_(data.autos, 'IDAuto', ['AutoDisplay', 'Patente'], turno.Auto);
    const mecanico = resolveRef_(data.mecanicos, 'IDMecanicos', ['Nombre y apellido'], turno.Mecanico);
    const servicio = resolveRef_(data.servicios, 'IDServicio', ['Nombre'], turno.Servicios);
    const relatedManoObra = data.manoObra.filter((mano) => sameRef_(mano.Turno, turno.IDTurno, turno['Fecha y Hora']));
    const totalServicios = servicio ? toNumber_(servicio.Precio) : 0;
    const totalManoObra = sum_(relatedManoObra.map((mano) => calculateSubtotal_(mano)));
    const sena = isBlank_(turno.Sena) ? 0 : toNumber_(turno.Sena);
    const total = roundMoney_(totalServicios + totalManoObra - sena);
    const pagado = total <= 0;
    const faltanPagar = total < 0 ? 0 : total;

    turno.idTurno = turno.IDTurno;
    turno.cliente = cliente ? cliente.IDCliente : valueOrBlank_(turno.Cliente);
    turno.auto = auto ? auto.IDAuto : valueOrBlank_(turno.Auto);
    turno.mecanico = mecanico ? mecanico.IDMecanicos : valueOrBlank_(turno.Mecanico);
    turno.servicio = servicio ? servicio.IDServicio : valueOrBlank_(turno.Servicios);
    turno.ClienteDisplay = cliente ? cliente.Nombre : valueOrBlank_(turno.Cliente);
    turno.AutoDisplay = auto ? auto.AutoDisplay : valueOrBlank_(turno.Auto);
    turno.MecanicoDisplay = mecanico ? mecanico['Nombre y apellido'] : valueOrBlank_(turno.Mecanico);
    turno.ServicioDisplay = servicio ? servicio.Nombre : valueOrBlank_(turno.Servicios);
    turno.TurnoDisplay = buildTurnoDisplay_(turno);
    turno.relatedManoObra = relatedManoObra;
    turno['Related Mano de obras'] = relatedManoObra;
    turno.totalServicios = totalServicios;
    turno.totalManoObra = totalManoObra;
    turno.total = total;
    turno.pagado = pagado;
    turno.faltanPagar = faltanPagar;
    turno.TotalServicios = totalServicios;
    turno['Total Mano Obra'] = totalManoObra;
    turno.Total = total;
    turno.Pagado = pagado;
    turno['Faltan pagar'] = faltanPagar;
  });

  return data;
}

function createRow_(entity, values) {
  validateEntity_(entity);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_(entity);
    const config = SHEET_CONFIG[entity];
    const headers = getHeaders_(sheet);
    const clean = normalizeIncoming_(entity, values || {});
    if (!clean[config.id]) clean[config.id] = nextId_(sheet, headers, config.id);
    if (entity === 'manoObra') clean.Subtotal = calculateSubtotal_(clean);
    const row = headers.map((header) => clean[header] !== undefined ? clean[header] : '');
    sheet.appendRow(row);
    return clean;
  } finally {
    lock.releaseLock();
  }
}

function updateRow_(entity, id, values) {
  validateEntity_(entity);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_(entity);
    const config = SHEET_CONFIG[entity];
    const headers = getHeaders_(sheet);
    const rowIndex = findRowIndex_(sheet, headers, config.id, id);
    const existingValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    const existing = rowToObject_(headers, existingValues);
    const clean = Object.assign({}, existing, normalizeIncoming_(entity, values || {}));
    clean[config.id] = existing[config.id] || id;
    if (entity === 'manoObra') clean.Subtotal = calculateSubtotal_(clean);
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([headers.map((header) => clean[header] !== undefined ? clean[header] : '')]);
    return clean;
  } finally {
    lock.releaseLock();
  }
}

function deleteRow_(entity, id) {
  validateEntity_(entity);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_(entity);
    const config = SHEET_CONFIG[entity];
    const headers = getHeaders_(sheet);
    const rowIndex = findRowIndex_(sheet, headers, config.id, id);
    sheet.deleteRow(rowIndex);
    return { id: id };
  } finally {
    lock.releaseLock();
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function normalizeCliente_(row) {
  return aliasKeys_(row, {
    'Tel\u00e9fono': 'Telefono',
    'Observaci\u00f3n': 'Observacion'
  });
}

function normalizeAuto_(row) {
  return aliasKeys_(row, {
    'Descripci\u00f3n': 'Descripcion'
  });
}

function normalizeMecanico_(row) {
  return aliasKeys_(row, {
    'N\u00famero de tel\u00e9fono': 'Numero de telefono'
  });
}

function normalizeTurno_(row) {
  return aliasKeys_(row, {
    'Mec\u00e1nico': 'Mecanico',
    Servicio: 'Servicios',
    'Se\u00f1a': 'Sena'
  });
}

function normalizeManoObra_(row) {
  return aliasKeys_(row, {
    'Mec\u00e1nico': 'Mecanico'
  });
}

function aliasKeys_(row, aliases) {
  const copy = Object.assign({}, row);
  Object.keys(aliases).forEach((from) => {
    const to = aliases[from];
    if (copy[to] === undefined && copy[from] !== undefined) copy[to] = copy[from];
  });
  return copy;
}

function normalizeIncoming_(entity, values) {
  const sheet = getSheet_(entity);
  const headers = getHeaders_(sheet);
  const config = SHEET_CONFIG[entity];
  const aliases = config.aliases || {};
  const clean = {};

  Object.keys(values).forEach((key) => {
    const canonical = aliases[key] || key;
    const header = findHeader_(headers, canonical);
    if (header) clean[header] = values[key];
  });

  return clean;
}

function findHeader_(headers, wanted) {
  if (headers.indexOf(wanted) !== -1) return wanted;
  const normalized = normalizeText_(wanted);
  return headers.find((header) => normalizeText_(header) === normalized) || '';
}

function getSheet_(entity) {
  validateEntity_(entity);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('No hay spreadsheet activo. Vincula este Apps Script a la planilla.');
  const config = SHEET_CONFIG[entity];
  const names = [config.sheet].concat(config.fallbackSheets || []);
  for (let i = 0; i < names.length; i += 1) {
    const sheet = spreadsheet.getSheetByName(names[i]);
    if (sheet) return sheet;
  }
  const normalizedTargets = names.map(normalizeText_);
  const sheets = spreadsheet.getSheets();
  for (let j = 0; j < sheets.length; j += 1) {
    if (normalizedTargets.indexOf(normalizeText_(sheets[j].getName())) !== -1) return sheets[j];
  }
  throw new Error('No existe la hoja: ' + names.join(' o '));
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) throw new Error('La hoja ' + sheet.getName() + ' no tiene encabezados.');
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function rowToObject_(headers, row) {
  const object = {};
  headers.forEach((header, index) => {
    const value = row[index];
    object[header] = value instanceof Date ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : value;
  });
  return object;
}

function resolveRef_(rows, idField, labelFields, value) {
  if (isBlank_(value)) return null;
  const needle = normalizeText_(value);
  return rows.find((row) => normalizeText_(row[idField]) === needle)
    || rows.find((row) => labelFields.some((field) => normalizeText_(row[field]) === needle))
    || null;
}

function sameRef_(value, id, label) {
  if (isBlank_(value)) return false;
  const normalized = normalizeText_(value);
  return normalized === normalizeText_(id) || normalized === normalizeText_(label);
}

function buildAutoDisplay_(auto) {
  return [valueOrBlank_(auto.Patente) + ' -', auto.Marca, auto.Modelo]
    .filter((value) => !isBlank_(value))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTurnoDisplay_(turno) {
  return [turno['Fecha y Hora'], turno.ClienteDisplay || turno.Cliente, turno.AutoDisplay || turno.Auto]
    .filter((value) => !isBlank_(value))
    .join(' | ');
}

function calculateSubtotal_(values) {
  return roundMoney_(toNumber_(values.Horas) * toNumber_(values['Precio por Hora']));
}

function nextId_(sheet, headers, idHeader) {
  const idColumn = headers.indexOf(idHeader) + 1;
  if (idColumn < 1) throw new Error('No existe la columna ID: ' + idHeader);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return idHeader + '-1';
  const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues().flat();
  let max = 0;
  ids.forEach((id) => {
    const match = String(id || '').match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return idHeader + '-' + (max + 1);
}

function findRowIndex_(sheet, headers, idHeader, id) {
  const idColumn = headers.indexOf(idHeader) + 1;
  if (idColumn < 1) throw new Error('No existe la columna ID: ' + idHeader);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('No hay registros para modificar.');
  const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i += 1) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  throw new Error('No se encontro el registro con ID: ' + id);
}

function validateEntity_(entity) {
  if (!SHEET_CONFIG[entity]) throw new Error('Entidad invalida: ' + entity);
}

function toNumber_(value) {
  if (typeof value === 'number') return value;
  if (isBlank_(value)) return 0;
  return Number(String(value).replace(/\./g, '').replace(',', '.')) || 0;
}

function sum_(values) {
  return roundMoney_(values.reduce((total, value) => total + toNumber_(value), 0));
}

function roundMoney_(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function valueOrBlank_(value) {
  return isBlank_(value) ? '' : value;
}

function normalizeText_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
