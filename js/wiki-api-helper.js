/*****************************************************************************/
// This file provides helper methods for using the wikipedia API
// The wikiRequest function fires an ajax request to wikipedia, asking for a
// list of articles related to a text search
/*****************************************************************************/

/**
 * Several constants used for the Yelp API requests
 */
var wikiData = {
    baseURL: 'http://en.wikipedia.org/w/api.php?format=json&action=opensearch&callback=wikiCallback',
    timeout: 8000
};

/**
 * Fires a request to the wikipedia API, asking for a list of articles related to a text search
 *
 * @param search text to search for
 * @param resultsObject object over which setResults function (upon success) or error function (upon error) shall be invoked
 */
function wikiRequest(search, resultsObject) {
    var wikipediaURL = wikiData.baseURL + "&search=" + search;

    // a timeout is set for detecting requests failures
    var wikiRequestTimeout = setTimeout(function () {
        resultsObject.error();
    }, wikiData.timeout);

    // fire the ajax request
    $.ajax(wikipediaURL, {dataType: "jsonp", success: function (response) {
        // take the list of retrieved articles from the response object
        var articleList = response[1];
        // generate a list with only article titles and urls
        var articleTitleAndURLList = [];
        for (var i = 0; i < articleList.length; i++) {
            var articleTitle = articleList[i];
            var articleURL = "http://en.wikipedia.org/wiki/" + articleTitle;
            articleTitleAndURLList.push({articleTitle: articleTitle, articleURL: articleURL});
        }
        // submit the generated article title and URL list to the resultsObject received
        resultsObject.setResults(articleTitleAndURLList);
        // clear the timeout for detecting errors
        clearTimeout(wikiRequestTimeout);
    }});

}