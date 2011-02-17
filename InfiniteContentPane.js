dojo.require("dijit.layout.ContentPane");
dojo.experimental("dojox.layout.InfiniteContentPane"); 

dojo.provide("dojox.layout.InfiniteContentPane");

dojo.declare("dojox.layout.InfiniteContentPane",
		[dijit.layout.ContentPane],
{
	fetcher: false,

    //buffer to initiate request while scrolling to make seemless.  
    bufferHeightPx: 0,
    containerHeight: 0,

    postCreate: function () {
        this.inherited(arguments);

        //if we use this we'll have to watch resize and reset it if the content pane is a %
        this.containerHeight = dojo.marginBox(this.domNode).h; //TODO: if height is all we need use fetcher that doesn't kill IE performance

        //make buffer size 10% of total height?
        this.bufferHeightPx = this.containerHeight * .10;
    },

	_onScroll: function() {
		console.log(this, arguments);
	}
});
