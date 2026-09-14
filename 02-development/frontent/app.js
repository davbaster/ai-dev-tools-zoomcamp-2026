import { api } from './api.js';

const app = document.querySelector('#app');
let data;
let page = 'floor';
let selectedEntryId = null;
let selectedTables = new Set();
let searchTerm = '';
let toast = '';

const icon = (name) => ({
  grid: '<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 16v-5M12 16V7M16 16v-8"/></svg>',
  people: '<svg viewBox="0 0 24 24"><path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 11a3 3 0 1 0-2.4-4.8M21 20v-1a4 4 0 0 0-2.8-3.8"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
}[name] || '');

const canHost = () => ['host', 'manager'].includes(data.currentUser.role);
const isManager = () => data.currentUser.role === 'manager';
const isServer = () => data.currentUser.role === 'server';
const time = (value) => value ? new Date(`2020-01-01T${value}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—';
const labelStatus = (status) => ({ waiting: 'Waiting', seated: 'Seated', cancelled: 'Cancelled', 'no-show': 'No-show', available: 'Available', occupied: 'Occupied', reserved: 'Reserved' }[status] || status);
const entryTime = (entry) => entry.type === 'reservation' ? `Booked ${time(entry.reservationTime)}` : `Arrives ${time(entry.arrivalTime)}`;

async function refresh() { data = await api.getAppData(); render(); }
function notify(message) { toast = message; render(); setTimeout(() => { toast = ''; render(); }, 2600); }
function activeEntries() { return data.entries.filter((entry) => entry.status === 'waiting'); }
function selectedEntry() { return data.entries.find((entry) => entry.id === selectedEntryId); }

function render() {
  if (!data) { app.innerHTML = '<main class="loading">Setting the host stand…</main>'; return; }
  const user = data.currentUser;
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">H</span><span>HostBoard</span></div>
        <div class="location"><span class="dot"></span><div><small>LOCATION</small><strong>Juniper &amp; Ash</strong></div>${icon('chevron')}</div>
        <nav>
          ${nav('floor','Floor plan','grid')}
          ${nav('waitlist','Waitlist','list', activeEntries().length)}
          ${nav('reservations','Reservations','calendar')}
          ${isManager() ? nav('reports','Reports','chart') : ''}
          ${isManager() ? nav('team','Team','people') : ''}
        </nav>
        <div class="sidebar-bottom"><div class="service-note"><span>DINNER SERVICE</span><strong>18:00 — 23:00</strong><small>Live floor status</small></div>
          <button class="profile" data-action="profile"><span>${user.initials}</span><div><strong>${user.name}</strong><small>${user.role}</small></div>${icon('chevron')}</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar"><button class="mobile-brand" data-action="menu">☰ <b>HostBoard</b></button><div class="date"><span>${new Date().toLocaleDateString('en-US',{weekday:'long'})}</span><strong>${new Date().toLocaleDateString('en-US',{month:'long', day:'numeric'})}</strong></div><div class="top-actions"><label class="search">${icon('search')}<input placeholder="Search name or phone" value="${searchTerm}" data-action="search" /></label>${canHost() ? '<button class="primary" data-action="open-entry">'+icon('plus')+' New party</button>' : ''}</div></header>
        ${page === 'floor' ? floorPage() : page === 'waitlist' ? waitlistPage() : page === 'reservations' ? reservationsPage() : page === 'reports' ? reportsPage() : teamPage()}
      </main>
    </div>
    ${toast ? `<div class="toast">${toast}</div>` : ''}
    <div id="modal-root"></div>`;
  bindEvents();
}

function nav(id, title, glyph, count = '') { return `<button class="nav-item ${page === id ? 'active' : ''}" data-page="${id}">${icon(glyph)}<span>${title}</span>${count ? `<b>${count}</b>` : ''}</button>`; }

function serviceTickets(entries) {
  const filtered = entries.filter((entry) => `${entry.partyName} ${entry.phone}`.toLowerCase().includes(searchTerm.toLowerCase()));
  if (!filtered.length) return '<div class="empty">No matching parties.</div>';
  return filtered.map((entry) => `<article class="ticket ${selectedEntryId === entry.id ? 'selected' : ''}" data-entry="${entry.id}">
    <div class="ticket-time"><b>${entry.type === 'reservation' ? time(entry.reservationTime) : time(entry.arrivalTime)}</b><span>${entry.type === 'reservation' ? 'RESERVATION' : `${entry.estimatedWait} MIN`}</span></div>
    <div class="ticket-party"><h3>${entry.partyName}</h3><p>${entry.partySize} guests <i></i> ${entry.request || 'No special requests'}</p></div>
    <span class="status ${entry.status}">${labelStatus(entry.status)}</span>
    <button class="ticket-chevron" data-action="select-entry" data-id="${entry.id}">${icon('chevron')}</button>
  </article>`).join('');
}

function floorPage() {
  const waiting = activeEntries().filter((entry) => entry.type === 'walk-in');
  const reservations = activeEntries().filter((entry) => entry.type === 'reservation');
  const entry = selectedEntry();
  const available = data.tables.filter((table) => table.status === 'available').length;
  return `<section class="page floor-page">
    <div class="page-intro"><div><p class="eyebrow">LIVE SERVICE · ${available} TABLES OPEN</p><h1>Dining room</h1><p class="subcopy">Place the next party with one clear glance.</p></div><div class="legend"><span><i class="available"></i> Available</span><span><i class="occupied"></i> Occupied</span><span><i class="reserved"></i> Reserved</span></div></div>
    <div class="floor-layout"><section class="floor-card"><div class="floor-head"><div><span class="eyebrow">JUNIPER &amp; ASH</span><h2>Tonight’s floor</h2></div><span class="floor-count">${available} open</span></div><div class="floor-map">${data.tables.map(tableCard).join('')}</div></section>
      <aside class="assignment-panel">${isServer() ? serverPanel() : entry ? assignmentPanel(entry) : `<div class="panel-heading"><p class="eyebrow">NEXT TO SEAT</p><h2>Choose a party</h2><p>Select a waiting party to begin a table assignment.</p></div>${quickQueue(waiting, reservations)}`}</aside>
    </div>
  </section>`;
}

function tableCard(table) {
  const selected = selectedTables.has(table.id);
  const entry = selectedEntry();
  const canSelectReservation = entry?.type === 'reservation' && table.status === 'reserved';
  const disabled = !canHost() || (!canSelectReservation && table.status !== 'available' && !selected);
  return `<button class="table ${table.status} ${selected ? 'map-selected' : ''}" data-table="${table.id}" ${disabled ? 'disabled' : ''}><span class="table-label">${table.label}</span><span class="table-seats">${table.capacity} seats</span>${table.status !== 'available' ? `<small>${table.status === 'reserved' ? 'held' : table.server || 'in service'}</small>` : ''}</button>`;
}

function quickQueue(waiting, reservations) { return `<div class="mini-queue"><h3>Waiting now <span>${waiting.length}</span></h3>${waiting.length ? waiting.slice(0,3).map(miniTicket).join('') : '<p class="muted">No walk-ins waiting.</p>'}<h3 class="up-next">Reservations <span>${reservations.length}</span></h3>${reservations.length ? reservations.slice(0,2).map(miniTicket).join('') : '<p class="muted">No reservations due.</p>'}</div>`; }
function miniTicket(entry) { return `<button class="mini-ticket" data-action="select-entry" data-id="${entry.id}"><span>${entry.partySize}</span><div><b>${entry.partyName}</b><small>${entryTime(entry)}</small></div>${icon('chevron')}</button>`; }
function serverPanel() { const tables = data.tables.filter((table) => table.status === 'occupied' && table.server === data.currentUser.name); return `<div class="panel-heading"><p class="eyebrow">YOUR SECTION</p><h2>Ready tables</h2><p>Mark a table open once it is ready for the next party.</p></div><div class="mini-queue">${tables.length ? tables.map((table) => { const entry = data.entries.find((item) => item.id === table.partyId); return `<div class="server-table"><span>${table.label}</span><div><b>${entry?.partyName || 'In service'}</b><small>${entry?.partySize || table.capacity} guests · ${table.capacity} seats</small></div><button class="secondary" data-action="release-table" data-id="${table.id}">Ready</button></div>`; }).join('') : '<p class="muted">No occupied tables assigned to you.</p>'}</div>`; }

function assignmentPanel(entry) {
  const capacity = [...selectedTables].reduce((sum, id) => sum + data.tables.find((table) => table.id === id).capacity, 0);
  const tableNames = [...selectedTables].map((id) => data.tables.find((table) => table.id === id).label);
  const isUnder = selectedTables.size && capacity < entry.partySize;
  const overlaps = [...selectedTables].filter((id) => { const table = data.tables.find((item) => item.id === id); return entry.type === 'reservation' && table.status === 'reserved' && table.partyId !== entry.id; });
  const assigned = entry.tables.map((id) => data.tables.find((table) => table.id === id)).filter(Boolean);
  return `<div class="panel-heading"><button class="back-link" data-action="clear-entry">← All parties</button><p class="eyebrow">${entry.type === 'reservation' ? 'RESERVATION' : 'WAITLIST'} · ${entryTime(entry)}</p><h2>${entry.partyName}</h2><p>${entry.partySize} guests <i></i> ${entry.phone}</p></div>
    <div class="request"><span>NOTE</span><p>${entry.request || 'No special requests'}</p></div>
    <div class="assignment-summary"><span class="eyebrow">TABLE ASSIGNMENT</span>${selectedTables.size ? `<strong>${tableNames.join(' + ')} <em>${capacity} seats</em></strong>` : assigned.length ? `<strong>${assigned.map((table) => table.label).join(' + ')} <em>${assigned.reduce((sum, table) => sum + table.capacity, 0)} seats</em></strong>` : '<p>Choose one or more open tables on the map.</p>'}</div>
    ${isUnder ? `<div class="warning"><b>Capacity warning</b><span>${entry.partySize} guests assigned to ${capacity} seats. You can still continue.</span></div>` : ''}${overlaps.length ? `<div class="warning"><b>Reservation overlap</b><span>Table ${overlaps.map((id) => data.tables.find((table) => table.id === id).label).join(', ')} is already reserved. Review the conflict before continuing.</span></div>` : ''}
    <div class="panel-actions">${canHost() && selectedTables.size ? `<button class="secondary" data-action="assign">Assign table${selectedTables.size > 1 ? 's' : ''}</button>` : ''}${canHost() && (selectedTables.size || entry.tables.length) ? `<button class="primary wide" data-action="seat">Seat party</button>` : ''}</div>
    ${canHost() ? `<div class="status-actions"><button data-action="status" data-status="cancelled">Cancel</button><button data-action="status" data-status="no-show">No-show</button></div>` : ''}`;
}

function waitlistPage() { return `<section class="page list-page"><div class="page-intro"><div><p class="eyebrow">LIVE SERVICE</p><h1>Waitlist</h1><p class="subcopy">${activeEntries().filter((entry)=>entry.type==='walk-in').length} parties are waiting for a table.</p></div>${canHost() ? '<button class="primary" data-action="open-entry">'+icon('plus')+' Add walk-in</button>' : ''}</div><div class="list-head"><span>TIME</span><span>PARTY &amp; REQUEST</span><span>STATUS</span><span></span></div><div class="ticket-list">${serviceTickets(data.entries.filter((entry) => entry.type === 'walk-in'))}</div></section>`; }
function reservationsPage() { return `<section class="page list-page"><div class="page-intro"><div><p class="eyebrow">${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase()}</p><h1>Reservations</h1><p class="subcopy">Tonight’s book, arranged around your dining room.</p></div>${canHost() ? '<button class="primary" data-action="open-reservation">'+icon('plus')+' New reservation</button>' : ''}</div><div class="list-head"><span>TIME</span><span>PARTY &amp; REQUEST</span><span>STATUS</span><span></span></div><div class="ticket-list">${serviceTickets(data.entries.filter((entry) => entry.type === 'reservation'))}</div></section>`; }

function reportsPage() { const seated = data.entries.filter((entry) => entry.status === 'seated'); const noShows = data.entries.filter((entry) => ['no-show','cancelled'].includes(entry.status)); return `<section class="page reports"><div class="page-intro"><div><p class="eyebrow">DAILY CLOSEOUT</p><h1>Service report</h1><p class="subcopy">A readable snapshot of today’s floor rhythm.</p></div><button class="secondary" data-action="print">Print report</button></div><div class="report-band"><div><span>COVERS SEATED</span><strong>${seated.reduce((sum, entry) => sum + entry.partySize, 0)}</strong><small>Across ${seated.length} parties</small></div><div><span>AVG. WAIT</span><strong>18<em> min</em></strong><small>Target: under 20 min</small></div><div><span>TABLE TURNS</span><strong>1.8<em>x</em></strong><small>Average this service</small></div><div><span>LOST PARTIES</span><strong>${noShows.length}</strong><small>Cancelled or no-show</small></div></div><div class="report-grid"><article class="report-card"><p class="eyebrow">WAIT TIME DISTRIBUTION</p><h2>Most parties seated within 20 min</h2><div class="bars"><span style="height:38%"></span><span style="height:68%"></span><span style="height:88%"></span><span style="height:54%"></span><span style="height:25%"></span></div><div class="bar-labels"><span>0–5</span><span>6–10</span><span>11–20</span><span>21–30</span><span>30+</span></div></article><article class="report-card"><p class="eyebrow">SERVICE NOTES</p><h2>At a glance</h2><ul class="notes"><li><b>Window section</b><span>Fastest turnover</span></li><li><b>Large parties</b><span>2 seated</span></li><li><b>Special requests</b><span>3 accommodated</span></li></ul></article></div></section>`; }
function teamPage() { return `<section class="page team"><div class="page-intro"><div><p class="eyebrow">STAFF &amp; ACCESS</p><h1>Your team</h1><p class="subcopy">Manage who can run the floor.</p></div><button class="primary" data-action="open-staff">${icon('plus')} Add staff</button></div><div class="team-list">${data.staff.map((staff) => `<article><span class="avatar">${staff.initials}</span><div><h3>${staff.name}</h3><p>${staff.role}</p></div><span class="active-pill ${staff.active ? '' : 'inactive'}">${staff.active ? 'Active' : 'Inactive'}</span><button class="text-button" data-action="toggle-staff" data-id="${staff.id}">${staff.active ? 'Deactivate' : 'Activate'}</button></article>`).join('')}</div><section class="table-admin"><div><div><p class="eyebrow">FLOOR SETUP</p><h2>Tables</h2></div><button class="secondary" data-action="open-table">${icon('plus')} Add table</button></div><div class="admin-table">${data.tables.map((table) => `<span><b>${table.label}</b>${table.capacity} seats <em>${table.section}</em></span>`).join('')}</div></section></section>`; }

function modal(kind) {
  const root = document.querySelector('#modal-root');
  if (kind === 'entry') root.innerHTML = `<div class="modal-backdrop"><form class="modal" data-form="entry"><button type="button" class="modal-close" data-action="close-modal">${icon('close')}</button><p class="eyebrow">NEW PARTY</p><h2>Add to the floor</h2><div class="segmented"><button type="button" class="chosen" data-entry-type="walk-in">Walk-in</button><button type="button" data-entry-type="reservation">Reservation</button></div><input type="hidden" name="type" value="walk-in"><div class="form-grid"><label>Party name<input required name="partyName" placeholder="e.g. The Nguyen party"></label><label>Party size<input required name="partySize" type="number" min="1" value="2"></label><label>Phone number<input required name="phone" placeholder="555-0100"></label><label>Estimated arrival<input required name="arrivalTime" type="time" value="19:00"></label><label class="wait-field">Estimated wait (min)<input required name="estimatedWait" type="number" min="0" value="15"></label><label class="reservation-field hidden">Reservation date<input name="reservationDate" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label class="reservation-field hidden">Reservation time<input name="reservationTime" type="time" value="19:00"></label><label class="full">Special request<input required name="request" value="None" placeholder="Dietary, accessibility, celebration…"></label></div><button class="primary wide" type="submit">Add to waitlist</button></form></div>`;
  if (kind === 'staff') root.innerHTML = `<div class="modal-backdrop"><form class="modal compact" data-form="staff"><button type="button" class="modal-close" data-action="close-modal">${icon('close')}</button><p class="eyebrow">TEAM MEMBER</p><h2>Add staff account</h2><label>Name<input required name="name" placeholder="Full name"></label><label>Role<select name="role"><option value="host">Host</option><option value="server">Server</option><option value="manager">Manager</option></select></label><button class="primary wide" type="submit">Create account</button></form></div>`;
  if (kind === 'table') root.innerHTML = `<div class="modal-backdrop"><form class="modal compact" data-form="table"><button type="button" class="modal-close" data-action="close-modal">${icon('close')}</button><p class="eyebrow">FLOOR SETUP</p><h2>Add a table</h2><label>Table label<input required name="label" placeholder="e.g. 11"></label><label>Seating capacity<input required name="capacity" type="number" min="1" value="2"></label><label>Section<input required name="section" placeholder="e.g. Patio"></label><button class="primary wide" type="submit">Add table</button></form></div>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => button.onclick = () => { page = button.dataset.page; selectedEntryId = null; selectedTables.clear(); render(); });
  document.querySelectorAll('[data-entry]').forEach((button) => button.onclick = () => { selectedEntryId = button.dataset.entry; const entry = selectedEntry(); selectedTables = new Set(entry.tables); page = 'floor'; render(); });
  document.querySelectorAll('[data-table]').forEach((button) => button.onclick = () => { const id = button.dataset.table; selectedTables.has(id) ? selectedTables.delete(id) : selectedTables.add(id); render(); });
  const search = document.querySelector('[data-action="search"]'); if (search) search.oninput = (event) => { searchTerm = event.target.value; if (page !== 'floor') render(); };
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async (event) => {
    const action = button.dataset.action;
    if (action === 'open-entry') modal('entry');
    if (action === 'open-reservation') { modal('entry'); document.querySelector('[data-entry-type="reservation"]').click(); }
    if (action === 'open-staff') modal('staff');
    if (action === 'open-table') modal('table');
    if (action === 'close-modal') document.querySelector('#modal-root').innerHTML = '';
    if (action === 'clear-entry') { selectedEntryId = null; selectedTables.clear(); render(); }
    if (action === 'assign') { await api.assignTables(selectedEntryId, [...selectedTables]); notify(`Table${selectedTables.size > 1 ? 's' : ''} assigned.`); await refresh(); }
    if (action === 'seat') { const entry = selectedEntry(); if (selectedTables.size) await api.assignTables(entry.id, [...selectedTables]); await api.changeEntryStatus(entry.id, 'seated'); notify(`${entry.partyName} is seated.`); selectedEntryId = null; selectedTables.clear(); await refresh(); }
    if (action === 'status') { const entry = selectedEntry(); await api.changeEntryStatus(entry.id, button.dataset.status); notify(`${entry.partyName} marked ${labelStatus(button.dataset.status).toLowerCase()}.`); selectedEntryId = null; selectedTables.clear(); await refresh(); }
    if (action === 'toggle-staff') { await api.toggleStaff(button.dataset.id); await refresh(); }
    if (action === 'release-table') { const table = data.tables.find((item) => item.id === button.dataset.id); await api.releaseTable(table.id); notify(`Table ${table.label} is now available.`); await refresh(); }
    if (action === 'print') { window.print(); }
    if (action === 'profile') profileMenu(button);
  }));
  document.querySelectorAll('[data-entry-type]').forEach((button) => button.onclick = () => { const form = button.closest('form'); const isReservation = button.dataset.entryType === 'reservation'; form.querySelector('[name="type"]').value = button.dataset.entryType; form.querySelectorAll('[data-entry-type]').forEach((item) => item.classList.toggle('chosen', item === button)); form.querySelectorAll('.reservation-field').forEach((item) => item.classList.toggle('hidden', !isReservation)); form.querySelector('.wait-field').classList.toggle('hidden', isReservation); form.querySelector('button[type="submit"]').textContent = isReservation ? 'Create reservation' : 'Add to waitlist'; });
  document.querySelectorAll('form[data-form]').forEach((form) => form.onsubmit = async (event) => { event.preventDefault(); const formData = Object.fromEntries(new FormData(form)); if (form.dataset.form === 'entry') { formData.partySize = Number(formData.partySize); formData.estimatedWait = Number(formData.estimatedWait || 0); await api.createEntry(formData); notify(formData.type === 'reservation' ? 'Reservation created.' : 'Party added to waitlist.'); } if (form.dataset.form === 'staff') { await api.createStaff(formData); notify('Staff account created.'); } if (form.dataset.form === 'table') { formData.capacity = Number(formData.capacity); await api.createTable(formData); notify('Table added to the floor.'); } document.querySelector('#modal-root').innerHTML = ''; await refresh(); });
}

function profileMenu(anchor) { const menu = document.createElement('div'); menu.className = 'profile-menu'; menu.innerHTML = `<p>Preview as</p>${data.staff.filter((staff) => staff.active).map((staff) => `<button data-user="${staff.id}"><span>${staff.initials}</span>${staff.name}<small>${staff.role}</small></button>`).join('')}`; document.body.append(menu); const rect = anchor.getBoundingClientRect(); menu.style.left = `${rect.right + 8}px`; menu.style.bottom = '18px'; menu.querySelectorAll('[data-user]').forEach((button) => button.onclick = async () => { await api.signIn(button.dataset.user); menu.remove(); page = 'floor'; selectedEntryId = null; selectedTables.clear(); notify(`Viewing as ${data.staff.find((staff) => staff.id === button.dataset.user).role}.`); await refresh(); }); setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 0); }

refresh();
