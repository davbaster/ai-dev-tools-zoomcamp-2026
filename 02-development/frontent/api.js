// This is the single boundary between the UI and its future backend.
// Replace the mocked functions below with HTTP calls without changing app.js.

const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = (value, delay = 180) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), delay));
const today = new Date().toISOString().slice(0, 10);

let database = {
  currentUser: { id: 'u1', name: 'Marina Cruz', role: 'host', initials: 'MC' },
  staff: [
    { id: 'u1', name: 'Marina Cruz', role: 'host', initials: 'MC', active: true },
    { id: 'u2', name: 'Evan Lee', role: 'server', initials: 'EL', active: true },
    { id: 'u3', name: 'Ari Bennett', role: 'manager', initials: 'AB', active: true },
    { id: 'u4', name: 'Nora Kim', role: 'server', initials: 'NK', active: true },
  ],
  tables: [
    { id: 't1', label: '01', capacity: 2, status: 'available', section: 'Window' },
    { id: 't2', label: '02', capacity: 2, status: 'occupied', section: 'Window', partyId: 'w2', server: 'Evan Lee' },
    { id: 't3', label: '03', capacity: 4, status: 'available', section: 'Main' },
    { id: 't4', label: '04', capacity: 4, status: 'reserved', section: 'Main', partyId: 'r1' },
    { id: 't5', label: '05', capacity: 4, status: 'occupied', section: 'Main', partyId: 'w3', server: 'Nora Kim' },
    { id: 't6', label: '06', capacity: 6, status: 'available', section: 'Main' },
    { id: 't7', label: '07', capacity: 2, status: 'available', section: 'Patio' },
    { id: 't8', label: '08', capacity: 4, status: 'available', section: 'Patio' },
    { id: 't9', label: '09', capacity: 6, status: 'available', section: 'Patio' },
    { id: 't10', label: '10', capacity: 2, status: 'available', section: 'Bar' },
  ],
  entries: [
    { id: 'w1', type: 'walk-in', partyName: 'The Morales', partySize: 2, phone: '555-0184', request: 'High chair', arrivalTime: '18:45', estimatedWait: 15, status: 'waiting', createdAt: '18:30', tables: [] },
    { id: 'w2', type: 'walk-in', partyName: 'Samir Patel', partySize: 2, phone: '555-0197', request: 'Quiet corner if possible', arrivalTime: '18:25', estimatedWait: 10, status: 'seated', createdAt: '18:18', seatedAt: '18:31', tables: ['t2'] },
    { id: 'w3', type: 'walk-in', partyName: 'The Turner Party', partySize: 4, phone: '555-0142', request: 'Celebrating anniversary', arrivalTime: '18:20', estimatedWait: 20, status: 'seated', createdAt: '18:02', seatedAt: '18:26', tables: ['t5'] },
    { id: 'r1', type: 'reservation', partyName: 'Avery Morgan', partySize: 4, phone: '555-0122', request: 'Gluten-free menu', reservationDate: today, reservationTime: '19:15', arrivalTime: '19:05', status: 'waiting', createdAt: '17:20', tables: ['t4'] },
    { id: 'r2', type: 'reservation', partyName: 'Jamie Ortiz', partySize: 6, phone: '555-0165', request: 'Wheelchair access', reservationDate: today, reservationTime: '19:30', arrivalTime: '19:20', status: 'waiting', createdAt: '17:35', tables: [] },
  ],
};

const timeNow = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
const getEntry = (id) => database.entries.find((entry) => entry.id === id);

export const api = {
  async signIn(userId) {
    const user = database.staff.find((staff) => staff.id === userId && staff.active);
    if (!user) throw new Error('Unable to sign in with that account.');
    database.currentUser = user;
    return wait(user);
  },

  async getAppData() { return wait(database); },

  async createEntry(payload) {
    const entry = { id: `e${Date.now()}`, ...payload, status: 'waiting', createdAt: timeNow(), tables: [] };
    database.entries.unshift(entry);
    return wait(entry);
  },

  async assignTables(entryId, tableIds) {
    const entry = getEntry(entryId);
    if (!entry) throw new Error('Guest entry not found.');
    entry.tables = tableIds;
    if (entry.type === 'reservation') {
      database.tables.forEach((table) => {
        if (tableIds.includes(table.id)) { table.status = 'reserved'; table.partyId = entryId; }
      });
    }
    return wait(entry);
  },

  async changeEntryStatus(entryId, status) {
    const entry = getEntry(entryId);
    if (!entry) throw new Error('Guest entry not found.');
    entry.status = status;
    entry[`${status}At`] = timeNow();
    if (status === 'seated') {
      entry.tables.forEach((tableId) => {
        const table = database.tables.find((item) => item.id === tableId);
        if (table) { table.status = 'occupied'; table.partyId = entry.id; table.server = entry.partySize > 3 ? 'Nora Kim' : 'Evan Lee'; }
      });
    }
    if (['cancelled', 'no-show'].includes(status)) {
      entry.tables.forEach((tableId) => {
        const table = database.tables.find((item) => item.id === tableId);
        if (table?.partyId === entry.id) { table.status = 'available'; delete table.partyId; }
      });
    }
    return wait(entry);
  },

  async releaseTable(tableId) {
    const table = database.tables.find((item) => item.id === tableId);
    if (!table) throw new Error('Table not found.');
    table.status = 'available';
    table.releasedAt = timeNow();
    delete table.partyId;
    delete table.server;
    return wait(table);
  },

  async createStaff(payload) {
    const staff = { id: `u${Date.now()}`, initials: payload.name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(), active: true, ...payload };
    database.staff.push(staff);
    return wait(staff);
  },

  async toggleStaff(id) {
    const staff = database.staff.find((item) => item.id === id);
    if (!staff) throw new Error('Staff member not found.');
    staff.active = !staff.active;
    return wait(staff);
  },

  async createTable(payload) {
    const table = { id: `t${Date.now()}`, status: 'available', ...payload };
    database.tables.push(table);
    return wait(table);
  },
};
