mapboxgl.accessToken = mapToken;

const coordinates = listing.geometry?.coordinates;

if (
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every((coord) => Number.isFinite(coord))
) {
  const map = new mapboxgl.Map({
    container: "map",
    center: coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker({ color: "#fe424d" })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
      )
    )
    .addTo(map);

  map.addControl(new mapboxgl.NavigationControl());
} else {
  document.getElementById("map").innerHTML =
    '<div class="map-placeholder">Map location is not available for this listing.</div>';
}
