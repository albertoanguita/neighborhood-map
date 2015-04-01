/************************************************************************************************************************/
//
// This file contains the main functionality of the app
// The ViewModel object and the different Model objects employed are defined here
//
// GENERAL FEATURES OF THE APPLICATION
// -----------------------------------
// - there is a set of hard-coded locations, obtained from locations-data.js. These locations contain several
// fields such as name, description, category (out of four possible: museum, restaurant, bar, theater), etc
//
// - upon initialization, the locations data are extended with data retrieved from the Google Places API. The
// additional information are markers and infowindows for each location
//
// - the user can type text in the top-left search box. The locations will be filtered by matching the inputted
// text with the name and descriptions of the available locations. The match is done in a word-basis (search text
// is divided in words, all words must be contained either in the name or in the description of the location)
//
// - the user can also filter the categories that will be visible, by clicking on the images below the search box
//
// - when a user clicks on a location (or its corresponding marker), it will become the selected location. Its
// marker will bounce for a couple of seconds, and additional information about the location will be shown below
// the location list. The information type depends on the location category: for museums, data from wikipedia is
// retrieved. For the rest of categories, the score and link to yelp is retrieved
//
//
// DECLARED CLASSES FOR MODEL OBJECTS
// ----------------------------------
// - Location: stores data about one single location (name, description, marker, etc)
// - CategoryFilter: stores the state of one single category filter
// - AjaxRequestState: stores the state of one ajax request (used for yelp requests and wikipedia requests)
// - YelpResults: inherits from AjaxRequestState, and also stores the results from one Yelp request
// - WikiResults: inherits from AjaxRequestState, and also stores the results from one Wikipedia request
//
//
// MODEL OBJECTS CONTAINED IN THE VIEWMODEL
// ----------------------------------------
// - locationList: the full list of available locations. This array is populated at initialization time
//                 and it does not ever change again
// - appStatus: the status of the app, initialized with 'ok'. If changed to 'error' due to an error accessing
//              the google maps api, an error message will be displayed
// - selectedLocation: the location selected by the user. Upon change in this model, the map will display
//                     an infowindow and some additional information will be retrieved form an external API
// - searchString: stores the string written by the user to filter the provided locations
//                 upon a change on it, the available locations are filtered by name and description
// - categoryFilters: stores the status of the 4 possible category filters
//                    upon a change on any of them, the locations are filtered by category
// - yelpResults: the results of the last yelp ajax request. Upon changes on it, several html components
//                become visible and show the contents of this object
// - wikiResults: the results of the last wikipedia ajax request. Upon changes on it, several html components
//                become visible and show the contents of this object
//
/************************************************************************************************************************/


/**
 * This object stores data about one single location
 *
 * @param index index of this location in the location array
 * @param data all data fields for this location
 */
var Location = function (index, data) {
    var self = this;
    // the index of this location in the array of locations
    this.index = ko.observable(index);
    // the name of this location
    this.name = ko.observable(data.name);
    // the category of this location
    this.category = ko.observable(data.category);
    // description for this location
    this.description = ko.observable(data.description);
    // yelp business id for this location (null for museums)
    this.yelpId = ko.observable(data.yelpId);
    // google maps marker for this location (created previously)
    this.marker = data.markerData.marker;
    // infowindow attached to the previous marker
    this.infoWindow = data.markerData.infoWindow;

    // this function indicates whether this location should be displayed, given a user search text
    // search text is separated in individual words. Each word must be contained in the name or the description of the location
    this.search = function (text) {
        function searchWord(text, word) {
            return text.indexOf(word) >= 0;
        }
        words = text.split(" ");
        for (var i in words) {
            var word = words[i];
            if (!searchWord(self.name().toLowerCase(), word.toLowerCase()) && !searchWord(self.description().toLowerCase(), word.toLowerCase())) {
                // one of the words written by the user cannot be found in the name nor in the description
                return false;
            }
        }
        // all words were found in the name or the description
        return true;
    };
};

/**
 * This object stores the state and image url for a single category filter
 * The filter can be on true (matching locations will be displayed) or false (matching locations will be hidden)
 *
 * @param img url of the image associated to this category filter
 */
var CategoryFilter = function (img) {
    // state of this category filter
    this.state = ko.observable(true);
    // url of the image associated to this category filter
    this.imgSrc = ko.observable(img);
};

/**
 * This object stores the sate of one single ajax request. The state is stored as an observable(string). The string
 * can have the following values:
 * - no-results: the request has no results yet
 * - results: the request has completed successfully
 * - error: there was an error in the request
 */
var AjaxRequestState = function () {
    this.state = ko.observable('no-results');
};
AjaxRequestState.prototype.reset = function () {
    this.state('no-results');
};
AjaxRequestState.prototype.results = function () {
    this.state('results');
};
AjaxRequestState.prototype.error = function () {
    this.state('error');
};

/**
 * This object stores the results of one yelp request. It inherits from AjaxRequestState
 */
var YelpResults = function () {
    AjaxRequestState.call(this);
    // the string storing the score given by yelp to a business
    this.score = ko.observable('');
    // the yelp url of the business
    this.url = ko.observable('');
    // sets the yelp request results and sets the status to 'results'
    this.setResults = function (score, url) {
        this.results();
        this.score(score);
        this.url(url);
    };
};
YelpResults.prototype = Object.create(AjaxRequestState.prototype);

/**
 * This object stores the results of one wikipedia request. It inherits from AjaxRequestState
 */
var WikiResults = function () {
    AjaxRequestState.call(this);
    var self = this;
    // list of wikipedia articles of a place
    this.articles = ko.observableArray();
    // sets the wikpedia request results and sets the status to 'results'
    this.setResults = function (articleList) {
        this.articles.removeAll();
        this.results();
        articleList.forEach(function (article) {
            self.articles.push(article);
        });
    };
};
WikiResults.prototype = Object.create(AjaxRequestState.prototype);

/**
 * The application ViewModel object
 */
var ViewModel = function () {
    var self = this;

    // the full list of available locations. This array is populated at initialization time
    // and it does not ever change again
    this.locationList = ko.observableArray();
    // the full list of available locations. This array is populated at initialization time
    // and it does not ever change again
    this.appStatus = ko.observable('ok');
    // the location selected by the user. Upon change in this model, the map will display
    // an infowindow and some additional information will be retrieved form an external API
    this.selectedLocation = ko.observable(null);
    // stores the string written by the user to filter the provided locations
    // upon a change on it, the available locations are filtered by name and description
    this.searchString = ko.observable('');
    // stores the status of the 4 possible category filters
    // upon a change on any of them, the locations are filtered by category
    this.categoryFilters = ko.observable({
        museum: ko.observable(new CategoryFilter(filtersImages.museum)),
        restaurant: ko.observable(new CategoryFilter(filtersImages.restaurant)),
        bar: ko.observable(new CategoryFilter(filtersImages.bar)),
        theater: ko.observable(new CategoryFilter(filtersImages.theater))
    });
    // the results of the last yelp ajax request. Upon changes on it, several html components
    // become visible and show the contents of this object
    this.yelpResults = ko.observable(new YelpResults());
    // the results of the last wikipedia ajax request. Upon changes on it, several html components
    // become visible and show the contents of this object
    this.wikiResults = ko.observable(new WikiResults());

    // initialize google map and search for markers for each of the available locations
    initializeMap('map-canvas');
    addMarkersToLocations(populateLocationList, locationsError);

    // this function is passed as callback to the previous initialization method, and allows populating our observableArray of locations
    function populateLocationList(locations) {
        locations.forEach(function (location, index) {
            var request = {
                query: location.searchText
            };
            self.locationList.push(new Location(index, location));
        });
    }

    // this function is used to indicate that markers from google places api could not be retrieved due to some error
    function locationsError() {
        self.appStatus('error');
    }

    // changes the locations that are displayed to the user by filtering the locationList observable array
    // if fires upon changes in the searchString or the category filters observables
    this.searchLocations = ko.computed(function () {
        return ko.utils.arrayFilter(this.locationList(), function (location) {
            var display;
            if (self.searchString() === '') {
                display = self.categoryFilters()[location.category()]().state();
            } else {
                display = location.search(self.searchString()) && self.categoryFilters()[location.category()]().state();
            }
            if (display) {
                location.marker.setMap(map);
            } else {
                location.marker.setMap(null);
            }
            return display;
        });
    }, this);

    // toggles the state of one category filter
    this.toggleFilter = function (category) {
        self.categoryFilters()[category]().state(!self.categoryFilters()[category]().state());
    };

    // resets the selected location
    this.removeSelection = function () {
        self.selectedLocation(null);
    };

    // sets the selectedLocation to one of the available locations
    this.selectLocation = function (index) {
        if (self.selectedLocation() != null) {
            // close the previous selected location infowindow
            self.selectedLocation().infoWindow.close();
        }
        self.selectedLocation(self.locationList()[index]);
        var marker = self.selectedLocation().marker;
        self.selectedLocation().infoWindow.open(map, marker);
        // fire the marker annotation
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            // stop the marker animation
            marker.setAnimation(null);
        }, 1450);

    };

    // checks is the selected location should fire a yelp request
    this.selectedLocationInvokesYelp = ko.computed(function () {
        // all locations that have restaurant, bar or theater category fire a yelp request
        return self.selectedLocation() != null && (self.selectedLocation().category() === 'restaurant' || self.selectedLocation().category() === 'bar' || self.selectedLocation().category() === 'theater');
    }, this);

    // checks is the selected location should fire a wikipedia request
    this.selectedLocationInvokesWikipedia = ko.computed(function () {
        // all locations with museum category fire a wikipedia request
        return self.selectedLocation() != null && (self.selectedLocation().category() === 'museum');
    }, this);

    // if the selected location should fire a yelp request, fire it and notify the results to the yelpResults observable
    this.fireYelpRequest = ko.computed(function () {
        if (self.selectedLocationInvokesYelp()) {
            self.yelpResults().reset();
            yelpRequest(self.selectedLocation().yelpId(), self.yelpResults());
        }
    }, this);

    // if the selected location should fire a wikipedia request, fire it and notify the results to the wikiResults observable
    this.fireWikipediaRequest = ko.computed(function () {
        if (self.selectedLocationInvokesWikipedia()) {
            self.wikiResults().reset();
            wikiRequest(self.selectedLocation().name(), self.wikiResults());
        }
    }, this);
};

// the global ViewModel object is declared (used in the maps-helper.js code), and the bindings with the view are applied
var viewModel = new ViewModel();
ko.applyBindings(viewModel);

// Vanilla JS way to listen for resizing of the window and adjust map bounds
window.addEventListener('resize', function (e) {
    // Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
});


