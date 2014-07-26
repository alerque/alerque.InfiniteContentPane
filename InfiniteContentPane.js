define([
  "dojo/on",
  "dojo/Deferred",
  "dojo/dom-construct",
  "dojo/dom-geometry",
  "dojo/html",
  "dojo/parser",
  "dojox/layout/ContentPane",
	"dojo/_base/declare",
	"dojo/_base/lang"
], function(on, Deferred, domConstruct, domGeom, html, parser,
            ContentPane, declare, lang) {

// module:
//		alerque/InfiniteContentPane
// summary:
//		A layout widget for retrieving extra content on scroll so it never runs
//		out of something to show.

return declare("alerque.InfiniteContentPane", [ContentPane], {
  // fetcher should be something we can pass to dojo.Deferred to wait for
  // data to be returned
	fetcher: null,
  // hot zone that triggers a fetch needs to be fixed height, percentages would
  // make it funky as more content gets loaded it would get too big
	triggerHeight: 100,
  // How many threads to allow pending
	maxFetchers: 1,
	loadingMsg: '<p>Loading...</p>',

	_paneHeight: 0,
	_scrollHeight: 0,
  // Iterator showing how many times we've expanded. Might be useful to return
  // to our fetcher
	_fetcherCount: 0,
	_fetchersCount: 0,
  // a handle for our on scroll event so we can shut it off the workings if we
  // run out of data
	_connect: null,

	postCreate: function () {
    // Wire up scroll events to checking if we need more data
		this._connect = on(this.domNode, "scroll", lang.hitch(this, '_onScroll'));
    // Run a check on our data situation on instantiation
		this._calc();
		return this.inherited(arguments);
	},

	resize: function() {
		// if we got resized, recalculate our size and then simulate a scroll event
    // just to make sure we have the data we're supposted to
		this._calc();
		this._onScroll();
		return this.inherited(arguments);
	},

	_calc: function () {
		// TODO: do some math to make sure trigger zone is a sane size of pane
		this._paneHeight = domGeom.getMarginSize(this.domNode).h;
		this._scrollHeight = this.domNode['scrollHeight'];
	},

	_onScroll: function (event) {
		// Find our current position
		var bottomPos = this.domNode['scrollTop'] + this._paneHeight;

		// Do the math to see if the trigger zone area has scrolled into view
		if (bottomPos > (this._scrollHeight - this.triggerHeight)) {
			// As long as we aren't waiting on too much already, go fetch data
			if (this._fetchersCount < this.maxFetchers) {
				this._fetch();
			}
		}
	},

	_fetch: function () {
		// TODO: test that fetcher is a function? object? In any case don't bother
    // if we don't have one
		if (!this.fetcher) {
			return this._disable();
		}
		this._fetcherCount += 1;

		// Start a placeholder for content that we'll be fetching. Doing this early
    // lets us set a loading message and keeps content in order even if async
    // fetchers come back out of order.
		var wrapper = domConstruct.create('div', {
      'class': 'alerque-infinite-content',
      'innerHTML': this.loadingMsg
    });
		domConstruct.place(wrapper, this.domNode, 'last');

		this._fetchersCount++;

    // Instantiate a new fetcher
    var fetcher = this._runFetcher(this.fetcher, wrapper, this._fetcherCount);

    fetcher.then(lang.hitch(this, function(result) {
      // Scan for dojo declarative markup in new content
			if (this.parseOnLoad) {
				parser.parse(wrapper);
			}
			// Update our knowledge about ourselves now that we stuffed new data
			this._calc();
			this._fetchersCount--;
    }), lang.hitch(this, function(err){
      // If the fetcher is rejecting our request, unwire it from out widget
      return this._disable();
    }));
	},

  // Wrap the user supplied content generator funtion in a deferred object to
  // make it an async source no matter where the data is coming from
  _runFetcher: function(fetcher, wrapper, count) {
    var deferred = new Deferred();

    // Get content from the user supplied method
    var content = fetcher(count);

    // Load the content into the wrapper we already allocated
    html.set(wrapper, content);
    
    // If we get nothing back presume we've reached the end of the data
    if (!content.length) {
      deferred.reject();
    }

    // Let the pane know this data came back and it can try again form more
    // when it runs out
    deferred.resolve("success");

    return deferred.promise;
  },

	_disable: function() {
		// If we stop getting data, unwire the scroll event to save resources
    this._connect.remove();
	}

});

});
