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
    },

	_onScroll: function() {
		console.log(this, arguments);
	}
});
