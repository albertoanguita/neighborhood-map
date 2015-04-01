The NeighborhoodMap application shows a list of locations in a google maps, and allows the user to filter them
by writing text in a search box. The user can click on a location (in the list or in the map) to obtain more
detailed information.


LIST OF FILES
-------------
- index.html: html code for the application and entry to the app. Open in a browser to launch the application
- css/style.css: css style for the application
- img/*: icons used to represent the categories (also used in the map markers)
- js/script.js: main app file. Contains the ViewModel and the Model objects for this application
- js/locations-data.js: initial dataset for loading the locations in the app. Locations are hard-coded here
- js/maps-helper.js: helper functions for displaying the google maps in the page
- js/wiki-api-helper.js: helper functions for firing ajax request to the wikipedia api
- js/yelp-api-helper.js: helper functions for firing ajax request to the yelp api
- js/libs/knockout-3.2.0.js: knockout library

RUNNING THE APPLICATION
-----------------------
Download all files and open index.html in a browser


GENERAL FEATURES OF THE APPLICATION
-----------------------------------
- there is a set of hard-coded locations, obtained from locations-data.js. These locations contain several
fields such as name, description, category (out of four possible: museum, restaurant, bar, theater), etc

- upon initialization, the locations data are extended with data retrieved from the Google Places API. The
additional information are markers and infowindows for each location

- the user can type text in the top-left search box. The locations will be filtered by matching the inputted
text with the name and descriptions of the available locations. The match is done in a word-basis (search text
is divided in words, all words must be contained either in the name or in the description of the location)

- the user can also filter the categories that will be visible, by clicking on the images below the search box

- when a user clicks on a location (or its corresponding marker), it will become the selected location. Its
marker will bounce for a couple of seconds, and additional information about the location will be shown below
the location list. The information type depends on the location category: for museums, data from wikipedia is
retrieved. For the rest of categories, the score and link to yelp is retrieved

- errors accessing third party APIs (google maps, yelp, wikipedia) are properly treated. This can be tested
by modifying the urls of yelp and wikipedia (in yelp-api-helper.js amd wiki-api.helper.js) or adding an 11th
location in locations-data.js (produces an OVER_QUERY_LIMIT error)

DECLARED CLASSES FOR MODEL OBJECTS
----------------------------------
- Location: stores data about one single location (name, description, marker, etc)
- CategoryFilter: stores the state of one single category filter
- AjaxRequestState: stores the state of one ajax request (used for yelp requests and wikipedia requests)
- YelpResults: inherits from AjaxRequestState, and also stores the results from one Yelp request
- WikiResults: inherits from AjaxRequestState, and also stores the results from one Wikipedia request


MODEL OBJECTS CONTAINED IN THE VIEWMODEL
----------------------------------------
- locationList: the full list of available locations. This array is populated at initialization time
                and it does not ever change again
- appStatus: the status of the app, initialized with 'ok'. If changed to 'error' due to an error accessing
             the google maps api, an error message will be displayed
- selectedLocation: the location selected by the user. Upon change in this model, the map will display
                    an infowindow and some additional information will be retrieved form an external API
- searchString: stores the string written by the user to filter the provided locations
                upon a change on it, the available locations are filtered by name and description
- categoryFilters: stores the status of the 4 possible category filters
                   upon a change on any of them, the locations are filtered by category
- yelpResults: the results of the last yelp ajax request. Upon changes on it, several html components
               become visible and show the contents of this object
- wikiResults: the results of the last wikipedia ajax request. Upon changes on it, several html components
               become visible and show the contents of this object
