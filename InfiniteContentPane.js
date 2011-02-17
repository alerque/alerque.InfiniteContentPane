dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane"); 

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	_onScroll: function() {
		console.log(this, arguments);
	}
});
