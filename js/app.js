// Locations array for bars around Bushwick, Brooklyn
var locations = [
  {title: 'Heavy Woods', position: {lat: 40.705606, lng: -73.921648}},
  {title: 'Pearl\'s Social & Billy Club', position: {lat: 40.707065, lng: -73.921355}},
  {title: 'Sally Roots', position: {lat: 40.702754, lng: -73.916373}},
  {title: 'The Rookery Bar', position: {lat: 40.707404, lng: -73.922462}},
  {title: 'Boobie Trap', position: {lat: 40.70015, lng: -73.91604}},
  {title: 'Bootleg Bar', position: {lat: 40.698762, lng: -73.917186}}
];

var Location = function(data) {
  'use strict';
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.position);
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
    queryLocation(loc.title(), loc.location());
    loadFoursquare(loc.title());
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

  // hamburger menu slider
  this.menu = ko.observable();
  this.slide = ko.pureComputed({
    read: this.menu,
    write: function() {
      'use strict';
      var drawer = document.getElementById('drawer');
      drawer.classList.toggle('open');
    },
    owner: this
  });
};

// ERROR HANDLING


/* FourSquare API */
function loadFoursquare(locationName) {
  locationName = locationName.replace(' ', '%20');

  var foursquareUrl = 'https://api.foursquare.com/v2/venues/search' +
                      '?v=20170226&ll=40.703811%2C%20-73.918425';

  foursquareUrl += '&query=' + locationName + '&intent=checkin' +
                  '&client_id=YLKSNFKXRYIL5ONUCCESUFXSP51JPYSHGPQYHBKMCOKBEWUU' +
                  '&client_secret=JWWDPQVJI1FROTNRS5J0RZHHDGSJF3ZYG14WBEHSQ5BAZQRD';

  $('#foursquare-header').empty().append('Foursquare Stats:');

  $.ajax({
      url: foursquareUrl,
      dataType: 'jsonp'
  }).done(function(result) {
      console.log(result.response.venues[0]);

      var tipCount = result.response.venues[0].stats.tipCount;
      var checkinsCount = result.response.venues[0].stats.checkinsCount;
      var usersCount = result.response.venues[0].stats.usersCount;

      $('#foursquare-data').empty().append('Tip Count: ' + tipCount).append('<br>' +
        'Checkins Count: ' + checkinsCount).append('<br>' +
        'Users Count: ' + usersCount);
  });

  return false;
}


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
  // constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    // center is Bushwick, Brooklyn, Dekalb L station
    center: { lat: 40.703811, lng: -73.918425 },
    zoom: 15,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();
  highlightedIcon = makeMarkerIcon('42adf4');

  // use the locations array to call for marker creation and set bounds
  for (var i = 0; i < locations.length; i++) {
    // Get the position from markers array
    var name = locations[i].title;
    var location = locations[i].position;
    bounds.extend(locations[i].position);
    createMarker(name, location);
  };
  map.fitBounds(bounds);
}

// create new marker on the given name and location
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
    document.getElementById('display-title').innerHTML = marker.title;
    queryLocation(marker.title, marker.position);
    loadFoursquare(marker.title);
  });

  return marker;
}

// create new icon for the marker with given color
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

// use Places Library to find location
function queryLocation(locName, locLocation) {
  'use strict';
  var request = {
    name: locName,
    location: locLocation,
    radius: 100
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

// return results of the location query with additional location details
function callback(results, status) {
  'use strict';
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    markers.forEach(function(marker) {
      // compare queried place title with current markers' titles
      if (results[0].name === marker.title) {
        // marker.placeID = results[0].place_id;
        marker.rating = results[0].rating;
        marker.address = results[0].vicinity;
        marker.hours = results[0].opening_hours.open_now;
        document.getElementById('rating').innerHTML = marker.rating;
        document.getElementById('address').innerHTML = marker.address;
        if (marker.hours === true) {
          document.getElementById('hours').innerHTML = '<em class="loc-open">Open Now!</em>';
        } else {
          document.getElementById('hours').innerHTML = '<em class="loc-closed">Closed now.</em>';
        }
        populateInfowindow(marker, largeInfoWindow);
      };
    });
  };
}

// populate infowindow when a marker is clicked
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