/******************************************************************************/
// This file stores the initial data to use in our app
// We use an array of locations with different fields (name, description...)
// We also store the set of possible categories for each location
// The category of a location affects the icon that the user sees, and allows
// filtering by category
/******************************************************************************/


/**
 * This array stores the initial information about the locations we want to show in the map
 * For each location, we store:
 * - name: name of the location (will be shown in the list view)
 * - searchText: text used to search for a marker of this location with Google Places
 * - category: the type of the location (possible values: 'museum', 'restaurant'. 'bar'. 'theater'
 * - description: a sentence that describes the location, to be included in the infowindow for the locaton marker
 * - yelpId: the id of the business in yelp (only for restaurants, bars and theaters)
 * @type {Array}
 */
var locations = [
    {
        name: 'Museo del Prado',
        searchText: 'museo nacional del prado, madrid',
        category: 'museum',
        description: "The Museo del Prado is the main Spanish national art museum, located in central Madrid"
    },
    {
        name: 'Txirimiri',
        searchText: 'txirimiri, humilladero 6, madrid',
        category: 'restaurant',
        description: "Small restaurant that serves 'pinchos' and 'tapas' of excellent quality and reasonable price",
        yelpId: 'txirimiri-madrid-2'
    },
    {
        name: 'Ene',
        searchText: 'ene restaurante, nuncio, madrid',
        category: 'bar',
        description: "Cocktail bar where any drink can be found. Includes lunch and dinner service",
        yelpId: 'ene-madrid'
    },
    {
        name: 'La Chocita del Loro',
        searchText: 'la chocita del loro, gran via, madrid',
        category: 'theater',
        description: "Centric theater that offers comedy monologues",
        yelpId: 'la-chocita-del-loro-madrid-3'
    },
    {
        name: 'Museo Reina Sofia',
        searchText: 'museo reina sofia, madrid',
        category: 'museum',
        description: "The Museo Nacional Centro de Arte Reina Sofía is Spain's national museum of 20th-century art. "
    },
    {
        name: 'Almendro 13',
        searchText: 'Almendro 13, 28005, madrid',
        category: 'restaurant',
        description: "Traditional restaurant that serves food from southern Spain regions",
        yelpId: 'taberna-almendro-13-madrid'
    },
    {
        name: 'Casa Parrondo',
        searchText: 'casa parrondo, 28013, madrid',
        category: 'restaurant',
        description: "Traditional tapas and food from the northern regions of Spain, serving Sidra",
        yelpId: 'casa-parrondo-madrid'
    },
    {
        name: 'La Fontana de Oro',
        searchText: 'la fontana de oro, 28012, madrid',
        category: 'bar',
        description: "Fun sports pub with an international students/expats population",
        yelpId: 'la-fontana-de-oro-madrid-2'
    },
    {
        name: 'Musashi',
        searchText: 'musashi, 28013, madrid',
        category: 'restaurant',
        description: "Small japanese restaurant service very good sushi at a low price",
        yelpId: 'musashi-madrid'
    },
    {
        name: 'Teatro Español',
        searchText: 'Teatro Español, 28012, madrid',
        category: 'theater',
        description: "XV century theater that hosts many important events",
        yelpId: 'teatro-espanol-madrid-2'
    }
    // UNCOMMENT TO PRODUCE AN OVER_QUERY_LIMIT ERROR WHEN REQUESTING MARKERS TO GOOGLE PLACES API
//    {
//        name: 'La Mordida',
//        searchText: 'la mordida de fuentes, 28013, madrid',
//        category: 'restaurant',
//        description: "Very nice mexican restaurant, also serving a wide variety of cocktails",
//        yelpId: 'la-mordida-madrid-3'
//    }
];

/**
 * This object stores the urls of the icons to use for each of the 4 possible categories
 *
 * @type {{museum: string, restaurant: string, bar: string, theater: string}}
 */
var filtersImages = {
    museum: "img/museum.png",
    restaurant: "img/restaurant.png",
    bar: "img/Hotel_icons-11-512.png",
    theater: "img/Icon_32-512.png"
};

/**
 * This method performs requests to the Google Places API in order to retrieve the appropriate markers for the initial locations
 * The locations object defined at the top of this file will be extended with this new data
 *
 * @param callback method that will be invoked once all the markers have been retrieved
 * @param error method that will be invoked if any of the Google Places API requests fails
 */
function addMarkersToLocations(callback, error) {
    // number of requests to make. We store this in order to detect when we have completed all requests
    var locationsLeft = locations.length;
    // service for submitting requests to Places
    var service = new google.maps.places.PlacesService(map);
    // iterate through all available locations
    locations.forEach(function (location, index) {
        // the request is build with the searchText field in the location
        var request = {
            query: location.searchText
        };

        service.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                // if the result is correct, the location is extended with a new marker and infowindow
                locations[index].markerData = createMapMarker(results[0], location.name, location.description, index, filtersImages[location.category]);
                locationsLeft--;
                if (locationsLeft === 0) {
                    // the callback must only be invoked once all requests have returned
                    // since requests are asynchronous, we must count the pending requests
                    // left and invoke the callback once all are finished
                    callback(locations);
                }
            } else {
                // error retrieving markers from Google Places
                error();
            }
        });
    });

}


