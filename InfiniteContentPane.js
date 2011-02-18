dojo.require("dojo.parser");
dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane");

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: null, // dojo.Deferred given us for returning the next content
	triggerHeight: 100, // hot zone that triggers a fetch needs to be fixed height, percentages would make it funky as more content gets loaded it would get too big
	maxFetchers: 1, // How many threads to allow pending

	_paneHeight: 0,
	_scrollHeight: 0,
	_fetchCount: 0, // Iterator showing how many times we've expanded. Might be useful to return to our fetcher
	_connect: null, // a handle for our on scroll event so we can shut it off the workings if we run out of data
	_fetchersCount: 0,

	postCreate: function () {
		this._connect = this.connect(this.domNode, "onscroll", "_onScroll");

		this._calc();

		return this.inherited(arguments);
	},
	
	resize: function() {
		// if we got resized, recalculate our size and then simulate a scroll event
		this._calc();
		this._onScroll();
		return this.inherited(arguments);
	},

	_calc: function () {
		// TODO: do some match to make sure trigger zone is a reasonable size of pane?
		this._paneHeight = dojo._getMarginSize(this.domNode).h;
		this._scrollHeight = this.domNode['scrollHeight'];
	},

	_onScroll: function (/* Event */e) {
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
		this._fetchCount += 1;

		// Start a placeholder for content that we'll be fetching.
		// Doing this now let's us set a loading message and keeps
		// content in order as it comes back.
		var wrapper = dojo.create("div", {class: 'dojoxInfiniteContentPane', innerHTML: '<p>Loading...</p>'});
		dojo.place(wrapper, this.domNode, 'last');

		// Start up a deferred objet to handle data when it comes
		// back from our fetcher
		var deferred = new dojo.Deferred();
		this._fetchersCount++;
		deferred.then(dojo.hitch(this, function(data) {
			// If we get nothing back, presume we've reached the end of the possible data
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
		var ret = this.fetcher(dojo.hitch(this, deferred.callback), this._fetchCount);
		if (ret === false) {
			return this._disable();
		}
	},

	_disable: function() {
		// If we stop getting data, unwire the scroll event to save resources
		dojo.disconnect(this._connect[0]);
	}

});
