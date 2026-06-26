// Container Tracking Client
// Track shipping containers across ports and vessels with status updates, ETA predictions, and milestone alerts.

const STATUSES = ['BOOKED', 'LOADED', 'IN_TRANSIT', 'AT_PORT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'];

const STATUS_ICONS = {
  BOOKED: '📋', LOADED: '📦', IN_TRANSIT: '🚢', AT_PORT: '🏗️',
  CUSTOMS: '🛃', OUT_FOR_DELIVERY: '🚚', DELIVERED: '✅', EXCEPTION: '⚠️',
};

class ContainerTracker {
  constructor() {
    this.containers = new Map();
    this.milestones = [];
    this.alerts = [];
  }

  register(containerId, { vessel, origin, destination, commodity, carrier, etd, eta }) {
    if (this.containers.has(containerId)) throw new Error(`Container ${containerId} already registered`);
    const container = {
      id: containerId,
      vessel: vessel || 'TBD',
      origin: origin || 'TBD',
      destination: destination || 'TBD',
      commodity: commodity || '',
      carrier: carrier || '',
      status: 'BOOKED',
      etd: etd || null,
      eta: eta || null,
      events: [],
      alerts: [],
    };
    this.containers.set(containerId, container);
    this._emit('REGISTERED', containerId, { vessel, origin, destination });
    return container;
  }

  updateStatus(containerId, status, { location = '', details = '', timestamp = null } = {}) {
    const c = this.containers.get(containerId);
    if (!c) throw new Error(`Container ${containerId} not found`);
    if (!STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);

    const prev = c.status;
    c.status = status;
    const event = {
      status,
      location,
      details,
      timestamp: timestamp || new Date().toISOString(),
      previousStatus: prev,
    };
    c.events.push(event);
    this._emit('STATUS_UPDATE', containerId, event);

    // Check for milestone alerts
    if (status === 'AT_PORT' || status === 'CUSTOMS' || status === 'DELIVERED') {
      const alert = { type: status, containerId, location, timestamp: event.timestamp };
      c.alerts.push(alert);
      this.alerts.push(alert);
      this._emit('MILESTONE', containerId, alert);
    }

    // Check for exceptions
    if (status === 'EXCEPTION') {
      const alert = { type: 'EXCEPTION', containerId, details, timestamp: event.timestamp };
      c.alerts.push(alert);
      this.alerts.push(alert);
      this._emit('EXCEPTION', containerId, alert);
    }

    return event;
  }

  updateETA(containerId, eta) {
    const c = this.containers.get(containerId);
    if (!c) throw new Error(`Container ${containerId} not found`);
    c.eta = eta;
    return { containerId, eta };
  }

  getContainer(containerId) {
    return this.containers.get(containerId) || null;
  }

  getByStatus(status) {
    return [...this.containers.values()].filter(c => c.status === status);
  }

  getByCarrier(carrier) {
    return [...this.containers.values()].filter(c =>
      c.carrier.toLowerCase() === carrier.toLowerCase()
    );
  }

  getByOrigin(origin) {
    return [...this.containers.values()].filter(c =>
      c.origin.toLowerCase().includes(origin.toLowerCase())
    );
  }

  getTimeline(containerId) {
    const c = this.containers.get(containerId);
    return c ? [...c.events] : [];
  }

  getTransitDuration(containerId) {
    const c = this.containers.get(containerId);
    if (!c || c.events.length < 2) return null;
    const first = new Date(c.events[0].timestamp);
    const last = new Date(c.events[c.events.length - 1].timestamp);
    const ms = last - first;
    return {
      milliseconds: ms,
      hours: +(ms / 3600000).toFixed(1),
      days: +(ms / 86400000).toFixed(1),
    };
  }

  getAlerts(filter = {}) {
    return this.alerts.filter(a => {
      if (filter.type && a.type !== filter.type) return false;
      if (filter.containerId && a.containerId !== filter.containerId) return false;
      return true;
    });
  }

  getStats() {
    const all = [...this.containers.values()];
    const byStatus = {};
    const byCarrier = {};
    for (const c of all) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.carrier) byCarrier[c.carrier] = (byCarrier[c.carrier] || 0) + 1;
    }
    const delivered = all.filter(c => c.status === 'DELIVERED').length;
    const inTransit = all.filter(c => c.status === 'IN_TRANSIT').length;
    const exceptions = all.filter(c => c.status === 'EXCEPTION').length;
    return {
      total: all.length,
      delivered,
      inTransit,
      exceptions,
      byStatus,
      byCarrier,
      alerts: this.alerts.length,
    };
  }

  search(query) {
    const q = query.toLowerCase();
    return [...this.containers.values()].filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.vessel.toLowerCase().includes(q) ||
      c.origin.toLowerCase().includes(q) ||
      c.destination.toLowerCase().includes(q) ||
      c.commodity.toLowerCase().includes(q) ||
      c.carrier.toLowerCase().includes(q)
    );
  }

  _emit(eventType, containerId, data) {
    this.milestones.push({ eventType, containerId, data, timestamp: new Date().toISOString() });
  }
}

module.exports = { ContainerTracker, STATUSES, STATUS_ICONS };
