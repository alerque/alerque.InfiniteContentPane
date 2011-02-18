dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane"); 

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: false, // dojo.Deferred given us for returning the next content
	triggerZoneSize: 100, // hot zone that triggers a fetch needs to be fixed height, percentages would make it funky as more content gets loaded it would get too big
	fetchCount: 0, // Iterator showing how many times we've expanded. Might be useful to return to our fetcher

    _paneHeight: 0, // this is private because it can't be set externally, it's just the size we read ourselves to be
	_scrollHeight: 0,

    postCreate: function () {
		this.connect(this.domNode, "onscroll", "_onScroll");

		this._calc();

		// Connect an onresize function to our parent pane to _calc and _onScroll

        return this.inherited(arguments);
    },

	_calc: function() {
        this._paneHeight = dojo._getMarginSize(this.domNode).h;
		this._scrollHeight = this.domNode['scrollHeight'];
	},

	_onScroll: function(/* Event */e) {
		var bottomPos = this.domNode['scrollTop'] + this._paneHeight;

		if (bottomPos > (this._scrollHeight - this.triggerZoneSize)) {
			this._fetcherCallback();
		}

		// Find our current position

		// test if trigger zone visiable
		
		// set timeout so we don't fire to often?

		// notify our fetcher that we need data. pass back count? or position data?

	 	// disconnect scroll notifier until we get previous data?
	},

	_fetcherCallback: function() {
		console.log("Need to fetch more data!");

		// handle data comming in from the fether, dojo.place(this.domNode, $incomingdata, last)?
		var demo = dojo.create("p", {innerHTML: 'demo more data'})
		dojo.place(demo, this.domNode, 'last');
		
		// Update our knowledge about ourselves now that we stuffed new data
		this._calc();

		// reactivate scroll watcher if suspended above
	}
});
