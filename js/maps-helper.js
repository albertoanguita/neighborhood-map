/***************************************************************************************/
// This file provides helper methods for using the Google Maps API
// The map provided by Google Maps must be initialized. Then, markers can be
// added to this map with custom icons and specific texts for their infowindows
// Created markers will be able to invoke the selectLocation function in the ViewModel
/***************************************************************************************/

/**
 * Global variable for the google map
 */
var map;

/**
 * Initializes the map and renders it in the page
 */
function initializeMap(mapElementId) {
    var mapOptions = {
        disableDefaultUI: true
    };
    map = new google.maps.Map(document.getElementById(mapElementId), mapOptions);
    window.mapBounds = new google.maps.LatLngBounds();
}

/**
 * createMapMarker reads Google Places search results to create map pins.
 * placeData is the object returned from search results containing information
 * about a single location.
 *
 * @param placeData result from a Google Places search
 * @param name name to assign to the marker assicuated InfoWindow
 * @param description description to assign to the marker assicuated InfoWindow
 * @param index the click event will point to this index
 * @param iconImg image to use as icon for the new marker
 * @returns {{marker: google.maps.Marker, infoWindow: google.maps.InfoWindow}}
 */
function createMapMarker(placeData, name, description, index, iconImg) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // icon object to use for the marker
    var icon = {
        url: iconImg,
        size: new google.maps.Size(25, 25),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
    };

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name,
        icon: icon
    });

    // InfoWindow object associated to this marker
    var infoWindow = new google.maps.InfoWindow({
        content: "<p><strong>" + name + "</strong></p><p>" + description + "</p>",
        maxWidth: 250
    });

    // upon click, the marker will invoke the selectLocation(index) function in the view model
    google.maps.event.addListener(marker, 'click', function () {
        viewModel.selectLocation(index);
    });
    // upon close, the infowindow will notify the ViewModel that no location is selected
    google.maps.event.addListener(infoWindow, 'closeclick', function () {
        viewModel.removeSelection();
    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());

    // an object containing the created marker and its associated infoWindow is returned
    return {
        marker: marker,
        infoWindow: infoWindow
    };
}
