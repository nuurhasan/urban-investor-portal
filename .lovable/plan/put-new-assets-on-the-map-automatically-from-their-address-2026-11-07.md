# Put new assets on the map automatically from their address

## What's wrong now
New assets only save a name, city and state. A pin needs map coordinates (latitude/longitude), and right now you have to type those in by hand on the asset's page. So new assets never show up on the map.

## What will change
1. **Add Asset form** gets Street address and Postcode fields next to the existing Name, City and State fields.
2. **Automatic pin placement:** when you save, the portal looks up the full address and saves its coordinates. The new pin shows up on the map straight away.
3. **Editing an asset's address** on its page works the same way. Saving a changed address looks up the new location and moves the pin, so you no longer type coordinates. The manual latitude/longitude fields stay as a backup, and the old "remember to update lat/lng" tip will be removed.
4. **If the address can't be found:** the asset still saves, and a message tells you to check the address or enter the coordinates yourself.
5. **Assets without a pin** get a small "Not on map" label on their card, so you can spot them.

## Technical details
- Geocode in the browser with OpenStreetMap Nominatim (free, no API key). The map already uses OpenStreetMap. Query is `address, city, state, postcode, Australia` with `countrycodes=au`, `limit=1`.
- New helper `src/lib/geocode.ts`, used by `useAddFacility` (Portfolio dialog) and by the header save in `FacilityDetail`. The header only geocodes when an address field changed and you didn't edit lat/lng by hand.
- No database changes: the `facilities` table already has address, postcode, latitude and longitude columns.
