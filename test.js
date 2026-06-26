const { ContainerTracker, STATUSES, STATUS_ICONS } = require('./index.js');
const assert = require('assert');

console.log('Testing @ph-itdev/container-tracker...\n');

const tracker = new ContainerTracker();

// Test registration
const c1 = tracker.register('MSKU1234567', {
  vessel: 'Maersk Seletar',
  origin: 'Shanghai, China',
  destination: 'Manila, Philippines',
  commodity: 'Electronics',
  carrier: 'Maersk',
  eta: '2026-07-15',
});
assert.strictEqual(c1.id, 'MSKU1234567');
console.log('  ✓ Register container');

// Test status updates
const e1 = tracker.updateStatus('MSKU1234567', 'LOADED', { location: 'Shanghai Port' });
assert.strictEqual(e1.status, 'LOADED');
console.log('  ✓ Update status');

// Test timeline
const timeline = tracker.getTimeline('MSKU1234567');
assert.strictEqual(timeline.length, 1);
console.log('  ✓ Timeline tracking');

// Test search
const results = tracker.search('MSKU');
assert.strictEqual(results.length, 1);
console.log('  ✓ Search');

// Test stats
const stats = tracker.getStats();
assert.strictEqual(stats.total, 1);
console.log('  ✓ Stats');

// Test status icons
assert.strictEqual(STATUS_ICONS['IN_TRANSIT'], '🚢');
console.log('  ✓ Status icons');

// Test multiple containers
tracker.register('HLXU9876543', {
  vessel: 'Hapag-Lloyd Berlin',
  origin: 'Hamburg, Germany',
  destination: 'Manila, Philippines',
  carrier: 'Hapag-Lloyd',
});
tracker.updateStatus('HLXU9876543', 'IN_TRANSIT', { location: 'Suez Canal' });
assert.strictEqual(tracker.getByStatus('IN_TRANSIT').length, 1);
console.log('  ✓ Multiple containers');

// Test alerts
tracker.updateStatus('MSKU1234567', 'AT_PORT', { location: 'Manila Port' });
assert.strictEqual(tracker.getAlerts({ type: 'AT_PORT' }).length, 1);
console.log('  ✓ Milestone alerts');

console.log('\n✓ All tests passed!');
