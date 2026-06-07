'use strict';

const API_URL = 'https://script.google.com/macros/s/AKfycbx4hMCvB07-4uYO3c4cvzjKDsuIiI28yD8wHjPCzkPgayXTtonT2bUabAOxuDPnwoTC/exec';
const ENTITY_CONFIG = {
  clientes: {
    title: 'Clientes',
    subtitle: 'ABM de clientes del taller',
    id: 'IDCliente',
    label: 'Nombre',
    fields: [
      { name: 'Nombre', label: 'Nombre', required: true },
      { name: 'Telefono', label: 'Telefono' },
      { name: 'Observacion', label: 'Observacion', type: 'textarea', full: true }
    ],
    columns: ['IDCliente', 'Nombre', 'Telefono', 'Observacion', 'Related Autos', 'Related Turnos']
  },
  autos: {
    title: 'Autos',
    subtitle: 'Vehiculos asociados a clientes',
    id: 'IDAuto',
    label: 'AutoDisplay',
    fields: [
      { name: 'Patente', label: 'Patente', required: true },
      { name: 'Marca', label: 'Marca' },
      { name: 'Modelo', label: 'Modelo' },
      { name: 'Cliente', label: 'Cliente', type: 'select', source: 'clientes', display: 'Nombre', value: 'IDCliente', required: true },
      { name: 'Descripcion', label: 'Descripcion', type: 'textarea', full: true }
    ],
    columns: ['IDAuto', 'AutoDisplay', 'Patente', 'Marca', 'Modelo', 'ClienteDisplay', 'Descripcion', 'Related Turnos']
  },
  mecanicos: {
    title: 'Mecanicos',
    subtitle: 'Equipo de trabajo y especialidades',
    id: 'IDMecanicos',
    label: 'Nombre y apellido',
    fields: [
      { name: 'Nombre y apellido', label: 'Nombre', required: true },
      { name: 'Especialidad', label: 'Especialidad' },
      { name: 'Numero de telefono', label: 'Telefono' }
    ],
    columns: ['IDMecanicos', 'Nombre y apellido', 'Especialidad', 'Numero de telefono', 'Related Turnos', 'Related Mano de obras']
  },
  servicios: {
    title: 'Servicios',
    subtitle: 'Lista de servicios y precios',
    id: 'IDServicio',
    label: 'Nombre',
    fields: [
      { name: 'Nombre', label: 'Nombre', required: true },
      { name: 'Precio', label: 'Precio', type: 'number', step: '0.01' }
    ],
    columns: ['IDServicio', 'Nombre', 'Precio', 'Related Turnos']
  },
  turnos: {
    title: 'Turnos',
    subtitle: 'Agenda principal del taller',
    id: 'IDTurno',
    label: 'Fecha y Hora',
    fields: [
      { name: 'Fecha y Hora', label: 'Fecha y hora', type: 'datetime-local', required: true },
      { name: 'Cliente', label: 'Cliente', type: 'select', source: 'clientes', display: 'Nombre', value: 'IDCliente', required: true },
      { name: 'Auto', label: 'Auto', type: 'select', source: 'autos', display: 'AutoDisplay', value: 'IDAuto', required: true },
      { name: 'Mecanico', label: 'Mecanico', type: 'select', source: 'mecanicos', display: 'Nombre y apellido', value: 'IDMecanicos' },
      { name: 'Servicios', label: 'Servicio', type: 'select', source: 'servicios', display: 'Nombre', value: 'IDServicio' },
      { name: 'Estado', label: 'Estado', type: 'select', options: ['Pendiente', 'Confirmado', 'En proceso', 'Finalizado', 'Cancelado'] },
      { name: 'Sena', label: 'Sena', type: 'number', step: '0.01' },
      { name: 'TotalServicios', label: 'Total servicios', type: 'number', step: '0.01', readonly: true },
      { name: 'Total Mano Obra', label: 'Total mano de obra', type: 'number', step: '0.01', readonly: true },
      { name: 'Total', label: 'Total', type: 'number', step: '0.01', readonly: true },
      { name: 'Pagado', label: 'Pagado', readonly: true },
      { name: 'Faltan pagar', label: 'Faltan pagar', type: 'number', step: '0.01', readonly: true }
    ],
    columns: ['IDTurno', 'Fecha y Hora', 'ClienteDisplay', 'AutoDisplay', 'MecanicoDisplay', 'ServicioDisplay', 'Estado', 'Sena', 'TotalServicios', 'Total Mano Obra', 'Total', 'Pagado', 'Faltan pagar']
  },
  manoObra: {
    title: 'Mano de Obra',
    subtitle: 'Tareas, horas y subtotales',
    id: 'IDMano',
    label: 'Tarea',
    fields: [
      { name: 'Turno', label: 'Turno', type: 'select', source: 'turnos', display: 'TurnoDisplay', value: 'IDTurno', required: true },
      { name: 'Mecanico', label: 'Mecanico', type: 'select', source: 'mecanicos', display: 'Nombre y apellido', value: 'IDMecanicos' },
      { name: 'Tarea', label: 'Tarea', required: true, full: true },
      { name: 'Horas', label: 'Horas', type: 'number', step: '0.01' },
      { name: 'Precio por Hora', label: 'Precio por hora', type: 'number', step: '0.01' },
      { name: 'Subtotal', label: 'Subtotal', type: 'number', step: '0.01', readonly: true }
    ],
    columns: ['IDMano', 'TurnoDisplay', 'MecanicoDisplay', 'Tarea', 'Horas', 'Precio por Hora', 'Subtotal']
  }
};

const REF_META = {
  clientes: { id: 'IDCliente', labels: ['Nombre'] },
  autos: { id: 'IDAuto', labels: ['AutoDisplay', 'Patente'] },
  mecanicos: { id: 'IDMecanicos', labels: ['Nombre y apellido'] },
  servicios: { id: 'IDServicio', labels: ['Nombre'] },
  turnos: { id: 'IDTurno', labels: ['Fecha y Hora', 'TurnoDisplay'] }
};

const State = {
  data: {
    clientes: [],
    autos: [],
    turnos: [],
    mecanicos: [],
    servicios: [],
    manoObra: []
  },
  activeView: 'dashboard',
  editing: null,
  turnoFilter: 'hoy',
  searches: {}
};

const StorageService = {
  key: 'taller_mecanico_cache_v2',
  save(data) {
    localStorage.setItem(this.key, JSON.stringify({ savedAt: new Date().toISOString(), data }));
  },
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || 'null');
    } catch (error) {
      return null;
    }
  }
};

const ApiService = {
  async request(action, payload = null) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);

    const options = payload
      ? { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) }
      : { method: 'GET' };

    const response = await fetch(url.toString(), options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (json.ok === false) throw new Error(json.error || 'Error desconocido del servidor');
    return json.data || json;
  },
  getAll() {
    return this.request('getAll');
  },
  create(entity, values) {
    return this.request('create', { entity, values });
  },
  update(entity, id, values) {
    return this.request('update', { entity, id, values });
  },
  delete(entity, id) {
    return this.request('delete', { entity, id });
  }
};

const UIService = {
  showLoader(text = 'Cargando...') {
    const loader = document.getElementById('loader');
    loader.querySelector('span').textContent = text;
    loader.classList.add('is-visible');
  },
  hideLoader() {
    document.getElementById('loader').classList.remove('is-visible');
  },
  toast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.getElementById('toastHost').appendChild(toast);
    setTimeout(() => toast.remove(), 4300);
  },
  setSync(text) {
    document.getElementById('syncState').textContent = text;
  },
  openModal(entity, item = null) {
    State.editing = { entity, item };
    const config = ENTITY_CONFIG[entity];
    document.getElementById('modalTitle').textContent = item ? `Editar ${config.title}` : `Nuevo ${config.title}`;
    document.getElementById('deleteBtn').hidden = !item;
    this.renderForm(entity, item || {});
    document.getElementById('modalBackdrop').hidden = false;
  },
  closeModal() {
    document.getElementById('modalBackdrop').hidden = true;
    State.editing = null;
    document.getElementById('entityForm').reset();
  },
  renderForm(entity, item) {
    const config = ENTITY_CONFIG[entity];
    const host = document.getElementById('formFields');
    host.innerHTML = '';

    config.fields.forEach((field) => {
      const wrapper = document.createElement('div');
      wrapper.className = `field ${field.full ? 'full' : ''}`;
      const id = `field_${field.name.replace(/\W+/g, '_')}`;
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = field.label;
      wrapper.appendChild(label);

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
      } else if (field.type === 'select') {
        input = document.createElement('select');
        input.appendChild(new Option('Seleccionar...', ''));
        if (field.options) {
          field.options.forEach((option) => input.appendChild(new Option(option, option)));
        } else {
          (State.data[field.source] || []).forEach((row) => {
            const labelValue = row[field.display] || row[field.value] || '';
            const optionValue = row[field.value] || labelValue;
            input.appendChild(new Option(labelValue, optionValue));
          });
        }
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        if (field.step) input.step = field.step;
      }

      input.id = id;
      input.name = field.name;
      input.required = Boolean(field.required);
      input.readOnly = Boolean(field.readonly);
      input.value = getFormValue(entity, item, field);
      wrapper.appendChild(input);
      host.appendChild(wrapper);
    });

    if (entity === 'manoObra') {
      ['Horas', 'Precio por Hora'].forEach((name) => {
        const input = host.querySelector(`[name="${cssEscape(name)}"]`);
        if (input) input.addEventListener('input', calculateSubtotal);
      });
      calculateSubtotal();
    }

    if (entity === 'turnos') {
      ['Servicios', 'Sena'].forEach((name) => {
        const input = host.querySelector(`[name="${cssEscape(name)}"]`);
        if (input) input.addEventListener('input', calculateTurnoPreview);
      });
      calculateTurnoPreview(item);
    }
  }
};

function cssEscape(value) {
  return String(value).replace(/"/g, '\\"');
}

function normalizePayload(data) {
  const source = data && data.data ? data.data : data || {};
  return {
    clientes: source.clientes || source.Clientes || [],
    autos: source.autos || source.Autos || [],
    turnos: source.turnos || source.Turnos || [],
    mecanicos: source.mecanicos || source.Mecanicos || [],
    servicios: source.servicios || source.Servicios || [],
    manoObra: source.manoObra || source.manoDeObra || source.ManoObra || source['Mano de Obra'] || []
  };
}

function normalizeRows(data) {
  data.clientes = data.clientes.map((row) => aliasKeys(row, {
    'Tel\u00e9fono': 'Telefono',
    'TelÃ©fono': 'Telefono',
    'Observaci\u00f3n': 'Observacion',
    'ObservaciÃ³n': 'Observacion'
  }));
  data.autos = data.autos.map((row) => aliasKeys(row, {
    'Descripci\u00f3n': 'Descripcion',
    'DescripciÃ³n': 'Descripcion'
  }));
  data.mecanicos = data.mecanicos.map((row) => aliasKeys(row, {
    'N\u00famero de tel\u00e9fono': 'Numero de telefono',
    'NÃºmero de telÃ©fono': 'Numero de telefono'
  }));
  data.turnos = data.turnos.map((row) => aliasKeys(row, {
    'Mec\u00e1nico': 'Mecanico',
    'MecÃ¡nico': 'Mecanico',
    'Servicio': 'Servicios',
    'Se\u00f1a': 'Sena',
    'SeÃ±a': 'Sena'
  }));
  data.manoObra = data.manoObra.map((row) => aliasKeys(row, {
    'Mec\u00e1nico': 'Mecanico',
    'MecÃ¡nico': 'Mecanico'
  }));
  return data;
}

function aliasKeys(row, aliases) {
  const copy = { ...row };
  Object.entries(aliases).forEach(([from, to]) => {
    if (copy[to] === undefined && copy[from] !== undefined) copy[to] = copy[from];
  });
  return copy;
}

function setData(rawData) {
  const normalized = normalizeRows(normalizePayload(rawData));
  State.data = enrichData(normalized);
  StorageService.save(State.data);
}

function enrichData(data) {
  data.autos.forEach((auto) => {
    auto.AutoDisplay = buildAutoDisplay(auto);
  });

  data.turnos.forEach((turno) => {
    turno.TurnoDisplay = buildTurnoDisplay(turno);
  });

  data.manoObra.forEach((mano) => {
    mano.Subtotal = calculateManoSubtotal(mano);
    const turno = resolveRef('turnos', mano.Turno, data);
    const mecanico = resolveRef('mecanicos', mano.Mecanico, data);
    mano.turno = turno ? turno.IDTurno : mano.Turno || '';
    mano.mecanico = mecanico ? mecanico.IDMecanicos : mano.Mecanico || '';
    mano.TurnoDisplay = turno ? buildTurnoDisplay(turno) : mano.Turno || '';
    mano.MecanicoDisplay = mecanico ? mecanico['Nombre y apellido'] : mano.Mecanico || '';
  });

  data.clientes.forEach((cliente) => {
    cliente.idCliente = cliente.IDCliente;
    cliente.label = cliente.Nombre;
    cliente.relatedAutos = data.autos.filter((auto) => sameRef(auto.Cliente, cliente.IDCliente, cliente.Nombre));
    cliente.relatedTurnos = data.turnos.filter((turno) => sameRef(turno.Cliente, cliente.IDCliente, cliente.Nombre));
    cliente['Related Autos'] = cliente.relatedAutos;
    cliente['Related Turnos'] = cliente.relatedTurnos;
  });

  data.autos.forEach((auto) => {
    const cliente = resolveRef('clientes', auto.Cliente, data);
    auto.idAuto = auto.IDAuto;
    auto.cliente = cliente ? cliente.IDCliente : auto.Cliente || '';
    auto.ClienteDisplay = cliente ? cliente.Nombre : auto.Cliente || '';
    auto.relatedTurnos = data.turnos.filter((turno) => sameRef(turno.Auto, auto.IDAuto, auto.AutoDisplay) || sameRef(turno.Auto, auto.IDAuto, auto.Patente));
    auto['Related Turnos'] = auto.relatedTurnos;
  });

  data.mecanicos.forEach((mecanico) => {
    mecanico.idMecanicos = mecanico.IDMecanicos;
    mecanico.label = mecanico['Nombre y apellido'];
    mecanico.relatedManoObra = data.manoObra.filter((mano) => sameRef(mano.Mecanico, mecanico.IDMecanicos, mecanico['Nombre y apellido']));
    mecanico.relatedTurnos = data.turnos.filter((turno) => sameRef(turno.Mecanico, mecanico.IDMecanicos, mecanico['Nombre y apellido']));
    mecanico['Related Mano de obras'] = mecanico.relatedManoObra;
    mecanico['Related Turnos'] = mecanico.relatedTurnos;
  });

  data.servicios.forEach((servicio) => {
    servicio.idServicio = servicio.IDServicio;
    servicio.label = servicio.Nombre;
    servicio.relatedTurnos = data.turnos.filter((turno) => sameRef(turno.Servicios, servicio.IDServicio, servicio.Nombre));
    servicio['Related Turnos'] = servicio.relatedTurnos;
  });

  data.turnos.forEach((turno) => {
    const cliente = resolveRef('clientes', turno.Cliente, data);
    const auto = resolveRef('autos', turno.Auto, data);
    const mecanico = resolveRef('mecanicos', turno.Mecanico, data);
    const servicio = resolveRef('servicios', turno.Servicios, data);
    const relatedManoObra = data.manoObra.filter((mano) => sameRef(mano.Turno, turno.IDTurno, turno['Fecha y Hora']));
    const totalServicios = servicio ? toNumber(servicio.Precio) : 0;
    const totalManoObra = sum(relatedManoObra.map((mano) => calculateManoSubtotal(mano)));
    const sena = isBlank(turno.Sena) ? 0 : toNumber(turno.Sena);
    const total = roundMoney(totalServicios + totalManoObra - sena);
    const pagado = total <= 0;
    const faltanPagar = total < 0 ? 0 : total;

    turno.idTurno = turno.IDTurno;
    turno.cliente = cliente ? cliente.IDCliente : turno.Cliente || '';
    turno.auto = auto ? auto.IDAuto : turno.Auto || '';
    turno.mecanico = mecanico ? mecanico.IDMecanicos : turno.Mecanico || '';
    turno.servicio = servicio ? servicio.IDServicio : turno.Servicios || '';
    turno.ClienteDisplay = cliente ? cliente.Nombre : turno.Cliente || '';
    turno.AutoDisplay = auto ? auto.AutoDisplay : turno.Auto || '';
    turno.MecanicoDisplay = mecanico ? mecanico['Nombre y apellido'] : turno.Mecanico || '';
    turno.ServicioDisplay = servicio ? servicio.Nombre : turno.Servicios || '';
    turno.TurnoDisplay = buildTurnoDisplay(turno);
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

function resolveRef(entity, value, data = State.data) {
  if (isBlank(value)) return null;
  const meta = REF_META[entity];
  const rows = data[entity] || [];
  const needle = normalizeText(value);
  return rows.find((row) => normalizeText(row[meta.id]) === needle)
    || rows.find((row) => meta.labels.some((label) => normalizeText(row[label]) === needle))
    || null;
}

function sameRef(value, id, label) {
  if (isBlank(value)) return false;
  const normalized = normalizeText(value);
  return normalized === normalizeText(id) || normalized === normalizeText(label);
}

function buildAutoDisplay(auto) {
  const patente = auto.Patente || '';
  const marca = auto.Marca || '';
  const modelo = auto.Modelo || '';
  return `${patente} - ${marca} ${modelo}`.replace(/\s+/g, ' ').trim();
}

function buildTurnoDisplay(turno) {
  return [turno['Fecha y Hora'], turno.ClienteDisplay || turno.Cliente, turno.AutoDisplay || turno.Auto]
    .filter(Boolean)
    .join(' | ');
}

async function loadData(showSuccess = false) {
  UIService.showLoader('Cargando...');
  try {
    const data = await ApiService.getAll();
    setData(data);
    UIService.setSync(`Actualizado ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
    renderAll();
    if (showSuccess) UIService.toast('Datos actualizados', 'success');
  } catch (error) {
    const cached = StorageService.load();
    if (cached && cached.data) {
      setData(cached.data);
      renderAll();
      UIService.setSync('Usando cache local');
      UIService.toast(`No se pudo conectar al backend. Cache cargado. ${error.message}`, 'error');
    } else {
      UIService.toast(`No se pudieron cargar los datos: ${error.message}`, 'error');
      renderAll();
    }
  } finally {
    UIService.hideLoader();
  }
}

function renderAll() {
  renderDashboard();
  Object.keys(ENTITY_CONFIG).forEach(renderEntityTable);
  switchView(State.activeView);
}

function renderDashboard() {
  const stats = [
    ['CL', 'Clientes', State.data.clientes.length],
    ['AU', 'Autos', State.data.autos.length],
    ['TR', 'Turnos', State.data.turnos.length],
    ['ME', 'Mecanicos', State.data.mecanicos.length],
    ['SV', 'Servicios', State.data.servicios.length]
  ];
  document.getElementById('statsGrid').innerHTML = stats.map(([icon, label, value]) => (
    `<article class="stat-card"><div class="stat-icon">${icon}</div><span>${label}</span><strong>${value}</strong></article>`
  )).join('');
}

function renderEntityTable(entity) {
  const config = ENTITY_CONFIG[entity];
  const table = document.getElementById(`${entity}Table`);
  if (!table) return;
  const rows = getFilteredRows(entity);

  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td class="empty-state">Sin registros para mostrar</td></tr></tbody>`;
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>${config.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}<th></th></tr>
    </thead>
    <tbody>
      ${rows.map((row) => `
        <tr>
          ${config.columns.map((column) => `<td>${escapeHtml(formatCell(row[column]))}</td>`).join('')}
          <td>
            <div class="row-actions">
              <button class="secondary-button" type="button" data-action="edit" data-entity="${entity}" data-id="${escapeHtml(row[config.id])}">Editar</button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function getFilteredRows(entity) {
  let rows = [...(State.data[entity] || [])];
  const query = (State.searches[entity] || '').trim().toLowerCase();
  if (query) {
    rows = rows.filter((row) => getSearchText(row).includes(query));
  }
  if (entity === 'turnos') rows = filterTurnos(rows);
  return rows;
}

function getSearchText(row) {
  return Object.values(row).map((value) => {
    if (Array.isArray(value)) return String(value.length);
    if (value && typeof value === 'object') return '';
    return String(value || '');
  }).join(' ').toLowerCase();
}

function filterTurnos(rows) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const end = start + 86400000;
  return rows.filter((row) => {
    const time = parseDate(row['Fecha y Hora']).getTime();
    if (!time) return State.turnoFilter === 'todos';
    if (State.turnoFilter === 'hoy') return time >= start && time < end;
    if (State.turnoFilter === 'proximos') return time >= end;
    return true;
  });
}

function switchView(view) {
  State.activeView = view;
  document.querySelectorAll('.view').forEach((el) => el.classList.toggle('is-active', el.id === `${view}View`));
  document.querySelectorAll('.nav-link').forEach((el) => el.classList.toggle('is-active', el.dataset.view === view));
  const config = view === 'dashboard'
    ? { title: 'Dashboard', subtitle: 'Resumen general del taller' }
    : ENTITY_CONFIG[view];
  document.getElementById('viewTitle').textContent = config.title;
  document.getElementById('viewSubtitle').textContent = config.subtitle;
  document.body.classList.remove('menu-open');
}

function collectFormValues(entity) {
  const values = {};
  ENTITY_CONFIG[entity].fields.forEach((field) => {
    if (field.readonly) return;
    const input = document.querySelector(`[name="${cssEscape(field.name)}"]`);
    values[field.name] = input ? input.value : '';
  });
  if (entity === 'manoObra') values.Subtotal = calculateSubtotal();
  return values;
}

function getFormValue(entity, item, field) {
  if (field.type === 'select') {
    return getRefFormValue(entity, item, field);
  }
  return formatInputValue(item[field.name], field.type);
}

function getRefFormValue(entity, item, field) {
  const value = item[field.name];
  if (field.source) {
    const related = resolveRef(field.source, value);
    if (related) return related[field.value];
  }
  return value || '';
}

function calculateSubtotal() {
  const horas = Number(document.querySelector('[name="Horas"]')?.value || 0);
  const precio = Number(document.querySelector('[name="Precio por Hora"]')?.value || 0);
  const subtotal = roundMoney(horas * precio);
  const input = document.querySelector('[name="Subtotal"]');
  if (input) input.value = subtotal || '';
  return subtotal;
}

function calculateTurnoPreview(item = {}) {
  const serviceValue = document.querySelector('[name="Servicios"]')?.value || item.Servicios || '';
  const senaValue = document.querySelector('[name="Sena"]')?.value || item.Sena || '';
  const servicio = resolveRef('servicios', serviceValue);
  const relatedManoObra = item.IDTurno
    ? State.data.manoObra.filter((mano) => sameRef(mano.Turno, item.IDTurno, item['Fecha y Hora']))
    : [];
  const totalServicios = servicio ? toNumber(servicio.Precio) : 0;
  const totalManoObra = sum(relatedManoObra.map((mano) => calculateManoSubtotal(mano)));
  const sena = isBlank(senaValue) ? 0 : toNumber(senaValue);
  const total = roundMoney(totalServicios + totalManoObra - sena);
  const faltanPagar = total < 0 ? 0 : total;

  setReadonlyField('TotalServicios', totalServicios);
  setReadonlyField('Total Mano Obra', totalManoObra);
  setReadonlyField('Total', total);
  setReadonlyField('Pagado', total <= 0 ? 'true' : 'false');
  setReadonlyField('Faltan pagar', faltanPagar);
}

function setReadonlyField(name, value) {
  const input = document.querySelector(`[name="${cssEscape(name)}"]`);
  if (input) input.value = value;
}

async function submitForm(event) {
  event.preventDefault();
  if (!State.editing) return;

  const { entity, item } = State.editing;
  const config = ENTITY_CONFIG[entity];
  const values = collectFormValues(entity);
  const id = item ? item[config.id] : null;

  UIService.showLoader(item ? 'Guardando cambios...' : 'Creando registro...');
  try {
    const result = item
      ? await ApiService.update(entity, id, values)
      : await ApiService.create(entity, values);
    UIService.toast(item ? 'Registro actualizado' : 'Registro creado', 'success');
    UIService.closeModal();
    if (!applyMutationResult(result)) await loadData();
  } catch (error) {
    UIService.toast(`No se pudo guardar: ${error.message}`, 'error');
  } finally {
    UIService.hideLoader();
  }
}

async function deleteCurrent() {
  if (!State.editing || !State.editing.item) return;
  const { entity, item } = State.editing;
  const id = item[ENTITY_CONFIG[entity].id];
  UIService.showLoader('Eliminando registro...');
  try {
    const result = await ApiService.delete(entity, id);
    UIService.toast('Registro eliminado', 'success');
    UIService.closeModal();
    if (!applyMutationResult(result)) await loadData();
  } catch (error) {
    UIService.toast(`No se pudo eliminar: ${error.message}`, 'error');
  } finally {
    UIService.hideLoader();
  }
}

function applyMutationResult(result) {
  const all = result && (result.all || result.getAll || result);
  if (!all || !all.clientes || !all.autos || !all.turnos) return false;
  setData(all);
  UIService.setSync(`Actualizado ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
  renderAll();
  return true;
}

function bindEvents() {
  document.querySelectorAll('.nav-link').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });

  document.getElementById('menuToggle').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  document.getElementById('refreshBtn').addEventListener('click', () => loadData(true));
  document.getElementById('entityForm').addEventListener('submit', submitForm);
  document.getElementById('deleteBtn').addEventListener('click', deleteCurrent);
  document.getElementById('modalClose').addEventListener('click', UIService.closeModal);
  document.querySelector('[data-close-modal]').addEventListener('click', UIService.closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', (event) => {
    if (event.target.id === 'modalBackdrop') UIService.closeModal();
  });

  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const entity = button.dataset.entity;
    if (button.dataset.action === 'new') {
      UIService.openModal(entity);
    }
    if (button.dataset.action === 'edit') {
      const config = ENTITY_CONFIG[entity];
      const item = (State.data[entity] || []).find((row) => String(row[config.id]) === String(button.dataset.id));
      if (item) UIService.openModal(entity, item);
    }
  });

  ['clientes', 'autos', 'servicios', 'mecanicos', 'manoObra'].forEach((entity) => {
    const input = document.getElementById(`${entity}Search`);
    if (input) {
      input.addEventListener('input', () => {
        State.searches[entity] = input.value;
        renderEntityTable(entity);
      });
    }
  });

  document.querySelectorAll('[data-turno-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      State.turnoFilter = button.dataset.turnoFilter;
      document.querySelectorAll('[data-turno-filter]').forEach((el) => el.classList.toggle('is-active', el === button));
      renderEntityTable('turnos');
    });
  });
}

function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const shortTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const todayLabel = document.getElementById('todayLabel');
  const clockLabel = document.getElementById('clockLabel');
  const heroClock = document.getElementById('heroClock');
  if (todayLabel) todayLabel.textContent = date;
  if (clockLabel) clockLabel.textContent = time;
  if (heroClock) heroClock.textContent = shortTime;
}

function formatInputValue(value, type) {
  if (!value) return '';
  if (type === 'datetime-local') {
    const date = parseDate(value);
    if (!date.getTime()) return '';
    const pad = (number) => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return value;
}

function formatCell(value) {
  if (Array.isArray(value)) return `${value.length} registros`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value && typeof value === 'object') return value.label || value.Nombre || value.AutoDisplay || value.IDTurno || '-';
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (!value) return new Date('');
  return new Date(String(value).replace(' ', 'T'));
}

function calculateManoSubtotal(row) {
  return roundMoney(toNumber(row.Horas) * toNumber(row['Precio por Hora']));
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (isBlank(value)) return 0;
  return Number(String(value).replace(/\./g, '').replace(',', '.')) || 0;
}

function sum(values) {
  return roundMoney(values.reduce((total, value) => total + toNumber(value), 0));
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  updateClock();
  setInterval(updateClock, 1000);
  loadData();
});
