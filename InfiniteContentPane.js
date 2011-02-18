dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane"); 

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: false, // dojo.Deferred given us for returning the next content
	triggerZoneSize: 100, // hot zone that triggers a fetch needs to be fixed height, percentages would make it funky as more content gets loaded it would get too big
	fetchCount: 0, // Iterator showing how many times we've expanded. Might be useful to return to our fetcher

    containerHeight: 0,

    postCreate: function () {
        this.inherited(arguments);

        this.containerHeight = dojo._getMarginSize(this.domNode).h; // Note used private function _getMarginSize instead of maginBox because all we need is h and this is nicer to IE

		var connect = this.connect(this.domNode, "onscroll", "_onScroll");
    },

	_onScroll: function() {
		console.log(this, arguments);

		// test if trigger zone visiable
		
		// set timeout so we don't fire to often?

		// notify our fetcher that we need data. pass back count? or position data?

	 	// disconnect scroll notifier until we get previous data?
	},

	_fetcherCallback: function() {
		console.log(this, arguments);
		// handle data comming in from the fether, dojo.place(this.domNode, $incomingdata, last)?
		
		// reactivate scroll watcher if suspended above
	}
});
