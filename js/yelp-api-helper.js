/*******************************************************************************************/
/* This file provides helper methods for using the Yelp API                                */
/* The yelpRequest function fires an ajax request to Yelp, asking for a specific business  */
/*******************************************************************************************/

/**
 * Several constants used for the Yelp API requests
 */
var yelpData = {
    baseURL: 'http://api.yelp.com/v2/business/',
    key: 'SJqmnLV0HvIIeYfHAAUsyg',
    token: 'ZrKoq5KaQFyprUYcm4dhoYyikSZMt72R',
    keySecret: 'xepJy37Q9U_lzB131zKmEvkx8Js',
    tokenSecret: 'fadEjdlEYhU5r7WtQzZSkT-ZczE',
    timeout: 8000
};

/**
 * Fires a request to the yelp business API, asking for a specific business
 *
 * @param yelpId id of the yelp business
 * @param resultsObject object over which setResults function (upon success) or error function (upon error) shall be invoked
 */
function yelpRequest(yelpId, resultsObject) {
    /**
     * Generates a random number and returns it as a string for OAuthentication
     * @return {string}
     */
    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    // url for sending the ajax request
    var yelp_url = yelpData.baseURL + yelpId;

    // request parameters, including the authentication keys
    var parameters = {
        oauth_consumer_key: yelpData.key,
        oauth_token: yelpData.token,
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    // generates an authentication signature
    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, yelpData.keySecret, yelpData.tokenSecret);
    parameters.oauth_signature = encodedSignature;

    // request settings
    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        timeout: yelpData.timeout,  // we set a timeout of several seconds (I could not get the error function to be invoked otherwise)
        success: function (results) {
            resultsObject.setResults(results.rating, results.url);
        },
        error: function () {
            resultsObject.error();
        }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}