define([
	"dojo",
	"dijit",
  "dojo/on",
  "dojo/dom-geometry",
  "dojox/layout/ContentPane",
	"dojo/_base/declare",
], function(dojo, dijit, on, domGeom, ContentPane, declare) {

// module:
//		alerque/InfiniteContentPane
// summary:
//		A layout widget for retrieving extra content on scroll so it never runs
//		out of something to show.

return declare("alerque.InfiniteContentPane", [ContentPane], {
  // fetcher should be a dojo.Deferred object that can return data on command
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
		this._connect = on(this.domNode, "scroll", this._onScroll);
    // Run a check on our data situation on instantiation
		this._calc();
		return this.inherited(arguments);
	},

	resize: function() {
		// if we got resized, recalculate our size and then simulate a scroll event
    // just te make sure we have the data we're supposted to
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

		// Start a placeholder for content that we'll be fetching.
		// Doing this now let's us set a loading message and keeps
		// content in order as it comes back.
		var wrapper = dojo.create('div',
      {'class': 'dojoxInfiniteContentPane', 'innerHTML': this.loadingMsg});
		dojo.place(wrapper, this.domNode, 'last');

		// Start up a deferred objet to handle data when it comes
		// back from our fetcher
		var deferred = new dojo.Deferred();
		this._fetchersCount++;
		deferred.then(dojo.hitch(this, function(data) {
			// TODO: Test xhr status instead? What if it's not an xhr?
			// If we get nothing back, presume we've reached the end of the
      // possible data
			if (!data.length) {
				return this._disable();
			}

			wrapper.innerHTML = data;

			if (this.parseOnLoad) {
				dojo.parser.parse(wrapper);
			}

			// Update our knowledge about ourselves now that we stuffed new data
			this._calc();
			this._fetchersCount--;

			// TODO: reactivate scroll watcher if suspended above
		}));

		// Wire up the the deferred handle we just made to a new instance
		// of the fetcher we were given. The value should indicate whether
		// there is a possibility of more data or not.
		var ret = this.fetcher(dojo.hitch(this, deferred.callback),
                           this._fetcherCount);
		if (ret === false) {
			return this._disable();
		}
	},

	_disable: function() {
		// If we stop getting data, unwire the scroll event to save resources
    this._connect.remove();
	}

});

});
