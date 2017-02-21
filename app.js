// Locations array for bars around Bushwick, Brooklyn
var locations = [
  {title: 'Heavy Woods', location: {lat: 40.705606, lng: -73.921648}},
  {title: 'Pearl\'s Social & Billy Club', location: {lat: 40.707065, lng: -73.921355}},
  {title: 'Sally Roots', location: {lat: 40.702754, lng: -73.916373}},
  {title: 'The Rookery Bar', location: {lat: 40.707404, lng: -73.922462}},
  {title: 'Boobie Trap', location: {lat: 40.70015, lng: -73.91604}}
];

var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
};

var viewModel = function() {
  var self = this;

  this.locationList = ko.observableArray();

  locations.forEach(function(locItem) {
    self.locationList.push(new Location(locItem));
  });

  // show all locations
  this.showListings = function() {
    showListings();
  }

  // hide all locations on map
  this.hideListings = function() {
    hideListings();
  }

  // set first location as the display location
  this.displayLoc = ko.observable(this.locationList()[0]);

  // set clicked location as display location
  this.setLoc = function(loc) {
    self.displayLoc(loc);
    queryLocation();
  };
};


/* Google Maps */

var map; // global map object
var markers = []; // initialize global locations empty array
var service,
    largeInfoWindow;

/* Initiate map */
function initMap() {
  // Constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    // center is Bushwick, Brooklyn, Dekalb L station
    center: { lat: 40.703811, lng: -73.918425 },
    zoom: 15,
    mapTypeControl: false
  });

  // TODO: REFACTOR CREATE MARKER FUNCTIONS
  // Use the location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
    // Get the position from markers array
    var position = locations[i].location;
    var title = locations[i].title;
    var defaultIcon;
    var highlightedIcon = makeMarkerIcon('42adf4');

    // Create a marker per location, and put into markers array
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      map: map,
      icon: defaultIcon,
      id: i
    });

    // Push the marker into array of markers.
    markers.push(marker);

    largeInfoWindow = new google.maps.InfoWindow();

    // show all listings when map loads
    showListings();

    // Set default listing marker icon
    defaultIcon = marker.icon;

    // Create onclick event to open an infowindow for each marker
    marker.addListener('click', function() {
      populateInfowindow(this, largeInfoWindow);
      for (var i = 0; i < markers.length; i++) {
        markers[i].setIcon(defaultIcon);
      }
      this.setIcon(highlightedIcon);
    });
  }
}


// Creates new marker icon with given color
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(24, 40),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 40),
    new google.maps.Size(24, 40));
  return markerImage;
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

function queryLocation() {
  var placeData = document.getElementById('display-title').innerHTML;
  var bushwick = new google.maps.LatLng(40.703811, -73.918425);

  var request = {
    location: bushwick,
    query: placeData,
    radius: '500'
  };


  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarker(results[0]);
  };
}


function createMarker(placeData) {
  var name = placeData.name;   // name of the place from the place service

  var marker = new google.maps.Marker({
    position: placeData.geometry.location,
    title: name,
    map: map
  });

  // TODO: AFTER REFACTORING, THIS SHOULDN'T ADD DUPLICATE LISTINGS IN ARRAY
  markers.push(marker);

  populateInfowindow(marker, largeInfoWindow);
}


/* Populate infowindow when a marker is clicked */
function populateInfowindow(marker, infoWindow) {
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

// activate knockout
ko.applyBindings(new viewModel());