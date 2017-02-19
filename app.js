var map; // global map object
var markers = []; // global blank marker array

/* Initiate map */
function initMap() {
  // Constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    // center is Bushwich, Brooklyn, Dekalb L station
    center: { lat: 40.703811, lng: -73.918425 },
    zoom: 15
  });

  // Locations array for bars around Bushwick, Brooklyn
  var locations = [
    {title: 'Heavy Woods', location: {lat: 40.705606, lng: -73.921648}},
    {title: 'Pearl\'s Social & Billy Club', location: {lat: 40.707065, lng: -73.921355}},
    {title: 'Sally Roots', location: {lat: 40.702754, lng: -73.916373}},
    {title: 'The Rookery Bar', location: {lat: 40.707404, lng: -73.922462}},
    {title: 'Boobie Trap', location: {lat: 40.70015, lng: -73.91604}}
  ];

  var largeInfoWindow = new google.maps.InfoWindow();

  // Use the location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
    // Get the position from location array
    var position = locations[i].location;
    var title = locations[i].title;
    // image icon var
    var defaultIcon;
    var imageIcon = makeMarkerIcon('images/noun_448705_cc_martini.png');
    // credit: Martini by Ralf Schmitzer from the Noun Project

    // Create a marker per location, and put into markers array
    var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Push the marker into array of markers.
    markers.push(marker);

    // Create onclick event to open an infowindow for each marker
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
    });

    // Event listeners for icon image
    marker.addListener('mouseover', function() {
      this.setIcon(imageIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  // Add event-listeners for show/hide listings buttons
  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);

  // Set default listing marker icon
  defaultIcon = marker.icon;

  // Creates new icon with given image
  function makeMarkerIcon(imageIcon) {
    var markerImage = new google.maps.MarkerImage(
      imageIcon,
      new google.maps.Size(50, 50),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(50, 50));
    return markerImage;
  }
}

/* Loop through markers array and show all markers */
function showListings() {
  var bounds = new google.maps.LatLngBounds();

  // Extend the boundaries of the map for each marker and display each marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

/* Loop through markers and hide all markers */
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

/* Populate infowindow when a marker is clicked */
function populateInfoWindow(marker, infoWindow) {
  // Check to make sure the infowindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);

    // Make sure the marker property is cleared if the infowindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
  }
}