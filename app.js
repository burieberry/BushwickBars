// Locations array for bars around Bushwick, Brooklyn
var locations = [
  {title: 'Heavy Woods', location: {lat: 40.705606, lng: -73.921648}},
  {title: 'Pearl\'s Social & Billy Club', location: {lat: 40.707065, lng: -73.921355}},
  {title: 'Sally Roots', location: {lat: 40.702754, lng: -73.916373}},
  {title: 'The Rookery Bar', location: {lat: 40.707404, lng: -73.922462}},
  {title: 'Boobie Trap', location: {lat: 40.70015, lng: -73.91604}}
];

var Location = function(data) {
  'use strict';
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
};

var viewModel = function() {
  'use strict';
  var self = this;

  // initial location array
  this.locationList = ko.observableArray([]);
  // filtered location array
  this.filteredArray = ko.observableArray([]);

  // push locations to locationList array
  locations.forEach(function(locItem) {
    self.locationList.push(new Location(locItem));
  });

  // set first location as the display location
  this.displayLoc = ko.observable(this.locationList()[0]);

  // set clicked location as display location
  this.setLoc = function(loc) {
    'use strict';
    self.displayLoc(loc);
    queryLocation();
    // TODO: STOP CREATING NEW MARKERS FOR EXISTING LOCATIONS
  };

  // takes in an array, sets location to list item
  this.refreshList = function(list) {
    'use strict';
    list.forEach(function(listItem) {
      self.setLoc(listItem);
    });
  };

  // filter functionality
  this.enteredValue = ko.observable();
  this.searchValue = ko.pureComputed({
    read: function() {
      'use strict';
      return this.enteredValue();
    },
    write: function(value) {
      'use strict';
      this.enteredValue = value;
      this.checkList = function(item) {
        return item.title().toLowerCase() === value.toLowerCase();
      };
      this.filteredArray = this.locationList().filter(this.checkList);
      self.refreshList(this.filteredArray);
    },
    owner: this
  });
};


/* Google Maps */

var map; // global map object
var markers = []; // initialize global locations empty array
var position,
    title,
    service,
    largeInfoWindow;
var defaultIcon,
    highlightedIcon;

/* Initiate map */
function initMap() {
  'use strict';
  // Constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    // center is Bushwick, Brooklyn, Dekalb L station
    center: { lat: 40.703811, lng: -73.918425 },
    zoom: 15,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();
  highlightedIcon = makeMarkerIcon('42adf4');

  // Use the location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
    // Get the position from markers array
    var name = locations[i].title;
    var location = locations[i].location;
    bounds.extend(locations[i].location);
    createMarker(name, location);
  };
  map.fitBounds(bounds);
}


// Creates new marker icon with given color
function makeMarkerIcon(markerColor) {
  'use strict';
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(24, 40),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 40),
    new google.maps.Size(24, 40));
  return markerImage;
}

function queryLocation() {
  'use strict';
  var place = document.getElementById('display-title').innerHTML;
  var bushwick = new google.maps.LatLng(40.703811, -73.918425);

  var request = {
    location: bushwick,
    query: place,
    radius: '500'
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  'use strict';
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var name = results[0].name;
    var location = results[0].geometry.location;
    var marker = createMarker(name, location);
    populateInfowindow(marker, largeInfoWindow);
  };
}

function createMarker(name, location) {
  'use strict';
  var marker = new google.maps.Marker({
    position: location,
    title: name,
    map: map,
    icon: defaultIcon
  });

  // Push the marker into array of markers.
  markers.push(marker);

  // Set default listing marker icon
  defaultIcon = marker.icon;

  // Create onclick event to open an infowindow for each marker
  marker.addListener('click', function() {
    'use strict';
    populateInfowindow(this, largeInfoWindow);
  });

  return marker;
}

/* Populate infowindow when a marker is clicked */
function populateInfowindow(marker, infoWindow) {
  'use strict';
  // Check to make sure the infowindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    for (var i = 0; i < markers.length; i++) {
      markers[i].setIcon(defaultIcon);
    }
    marker.setIcon(highlightedIcon);
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