# @ph-itdev/container-tracker

Track shipping containers across ports and vessels with status updates, ETA predictions, and milestone alerts.

## Install

```bash
npm install @ph-itdev/container-tracker
```

## Quick Start

```javascript
const { ContainerTracker } = require('@ph-itdev/container-tracker');

const tracker = new ContainerTracker();

// Register a container
tracker.register('MSKU1234567', {
  vessel: 'Maersk Seletar',
  origin: 'Shanghai, China',
  destination: 'Manila, Philippines',
  carrier: 'Maersk',
});

// Update status
tracker.updateStatus('MSKU1234567', 'IN_TRANSIT', { location: 'Suez Canal' });

// Get stats
console.log(tracker.getStats());
```

## API

- `register(id, options)` — Register a new container
- `updateStatus(id, status, options)` — Update container status
- `updateETA(id, eta)` — Update estimated arrival
- `getContainer(id)` — Get container details
- `getByStatus(status)` — Filter by status
- `getByCarrier(carrier)` — Filter by carrier
- `getTimeline(id)` — Get event history
- `getTransitDuration(id)` — Calculate transit time
- `getAlerts(filter)` — Get milestone alerts
- `getStats()` — Get overall statistics
- `search(query)` — Search across all fields

## License

MIT
