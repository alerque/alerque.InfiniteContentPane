dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane"); 

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: false,

	_onScroll: function() {
		console.log(this, arguments);
	}
});
