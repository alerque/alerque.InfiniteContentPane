dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane");

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: null, // dojo.Deferred given us for returning the next content
	triggerZoneSize: 100, // hot zone that triggers a fetch needs to be fixed height, percentages would make it funky as more content gets loaded it would get too big
	fetchCount: 0, // Iterator showing how many times we've expanded. Might be useful to return to our fetcher

	_paneHeight: 0, // this is private because it can't be set externally, it's just the size we read ourselves to be
	_scrollHeight: 0,
	_connect: null, // a handle for our on scroll event so we can shut it off the workings if we run out of data

	postCreate: function () {
		this._connect = this.connect(this.domNode, "onscroll", "_onScroll");

		this._calc();

		// TODO: Connect an onresize function to our parent pane to _calc and _onScroll

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
		if (bottomPos > (this._scrollHeight - this.triggerZoneSize)) {
			// If so tell tigger our fetch method to go get more data
			this._fetch();
		}

		// TODO: set timeout so we don't fire to often?
		// TODO: disconnect scroll notifier until we get previous data?
	},

	_fetch: function () {
		this.fetchCount += 1;

		// TODO: show loading content?

		// Wire up the fetcher we were given to our internal data handler.
		// The retun value of the fetchers fetch function should indicate
		// if we should keep scrolling or call it quits.
		var ret = this.fetcher(dojo.hitch(this, this._fetcherCallback), this.fetchCount);
		if (ret === false) {
			return this._disable();
		}
	},

	_fetcherCallback: function (data) {
		// If we get nothing back, presume we've reached the end of the possible data
		if (!data.length) {
			return this._disable();
		}

		// TODO: trigger parser if parseOnLoad is true

		// Append stuff comming in from the fetcher to the pane
		dojo.place(data, this.domNode, 'last');

		// Update our knowledge about ourselves now that we stuffed new data
		this._calc();

		// TODO: reactivate scroll watcher if suspended above
	},

	_disable: function() {
		// If we stop getting data, unwire the scroll event to save resources
		dojo.disconnect(this._connect[0]);
	}

});
