# Location & Apple Health

Extensions add context to your hours from your iPhone itself: where you were, and what your body was doing. Both are optional and off until you turn them on in **Settings → Extensions**.

<!-- screenshot: NN-settings-extensions -->

**Location and Health data stay on your iPhone. They are never uploaded to Cadence**, and they are not part of Cloud sync.

## Location

Turn on **Location** to record where each hour of your day happened. With **Show the map on a timeslice** on, an hour's details show a small map, and you can open a full-screen map of your days.

<!-- screenshot: NN-timeslice-map -->

### Permissions

1. Cadence first asks for location access **While Using the App**. It then records a coarse location while Cadence is open.
2. It can then ask you to allow **Always**. This lets it keep recording in the background, so the map is complete even for hours you didn't open the app.
3. It may also ask for **Motion & Fitness**. Motion tells a journey apart from time spent in one place, so Cadence can record far less location.

You can say no to **Always** or to motion. Recording then happens only while the app is open, or a little less precisely. If you force-quit Cadence, background recording pauses until you open it again, which can leave a gap on the map.

Cadence records a coarse location, not turn-by-turn precision, and groups it into places where you stayed and journeys between them.

## Apple Health

Turn on **Heart rate** and **Steps** to see, for each hour, your average heart rate and your step count from Apple Health.

- Cadence **only reads** heart rate and steps. It reads nothing else and **never writes to Health**.
- If an hour looks empty, check **Health → Sharing → Apps → Cadence**, or tap **Open Health**.

## Deleting and moving this data

- Turning a toggle off **stops recording but keeps the history**.
- **Delete location history** and **Delete health history** (Settings → Extensions → Data) are the only way to delete it.
- Because this data never leaves your iPhone on its own, use **Export data** to save it to a file protected with a passphrase you choose, and **Import data** on another iPhone to bring it back. Cadence can't recover the passphrase if you forget it.

See also: [Location & Health FAQ](/docs/faq/location-health) and the [Privacy Policy](/docs/legal/privacy).
