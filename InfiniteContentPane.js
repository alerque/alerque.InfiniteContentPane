// module:
//		alerque/InfiniteContentPane
// summary:
//		A layout widget for retrieving extra content on scroll so it never runs
//		out of something to show.

define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Deferred',
	'dojo/dom-construct',
	'dojo/dom-geometry',
	'dojo/html',
	'dojo/on',
	'dojo/parser',
	'dojo/when',
	'dojox/layout/ContentPane'
], function(declare, lang, Deferred, domConstruct, domGeometry, html, on,
			parser, when, ContentPane){
return declare('alerque.InfiniteContentPane', [ContentPane], {
	fetcher: null, // user supplied function that returns data
	triggerHeight: 100, // how close (in pixels) to the bottom or top to fetch
	loadingMsg: '<p>Loading...</p>',
	enableUp: false, // defaults to only expanding on scroll down

	_paneHeight: 0,
	_scrollHeight: 0,
	_totalFetchCount: 0,
	_connect: null,
	_disableUp: false,
	_disableDown: false,

	postCreate: function(){
		// Wire up scroll events to checking if we need more data
		this._connect =
			on.pausable(this.domNode, 'scroll', lang.hitch(this, '_onScroll'));
		this._disableUp = !this.enableUp;
		return this.inherited(arguments);
	},

	resize: function(){
		// If we got resized, recalculate our size and then simulate a scroll
		// event just to make sure we have the data we're supposted to, but
		// prioritize loading down then checking for up...
		when(this._onScroll(null, false), lang.hitch(this, '_onScroll', null, true));
		return this.inherited(arguments);
	},

	_calc: function(){
		// TODO: do some math to make sure trigger zone is a sane size of pane
		this._paneHeight = domGeometry.position(this.domNode).h;
		this._scrollHeight = this.domNode.scrollHeight;
	},

	_onScroll: function(event, recheck_direction) {
		this._connect.pause();
		var action = new Deferred();
		this._calc();
		// Find our current position
		var bottomPos = this.domNode.scrollTop + this._paneHeight;
		// Do the math to see if the trigger zone area has scrolled into view
		if(bottomPos > (this._scrollHeight - this.triggerHeight) && recheck_direction !== true) {
			action = when(this._fetch(false), lang.hitch(this, '_onScroll', null, false));
		} else if (
				this.enableUp &&
				recheck_direction !== false &&
				this.domNode.scrollTop < this.triggerHeight
			){
			action = when(this._fetch(true), lang.hitch(this, '_onScroll', null, true));
		} else {
			// If no loading actions were required, make sure the promise is resolved
			action.resolve();
		}
		return action.then(lang.hitch(this._connect, 'resume'));
	},

	_fetch: function(isUp){
		// TODO: test that fetcher is a function? object? In any case don't
		// bother if we don't have one
		if(!this.fetcher){
			return this._disable();
		}
		// If the fetcher has expressed a lack of content in a direction, don't
		// bother polling it again
		if ((isUp && this._disableUp) || (!isUp && this._disableDown)) {
			return this._disable(isUp);
		}

		// Start a placeholder for content that we'll be fetching. Doing this
		// early lets us set a loading message and keeps content in order even
		// if async fetchers come back out of order.
		var wrapper = domConstruct.create('div', {
			'class': 'alerque-infinite-content'
		});
		domConstruct.place(wrapper, this.domNode, isUp ? 'first' : 'last');
		this._setLoadingMessage(wrapper);

		// Instantiate a new fetcher
		var fetcher =
			this._runFetcher(this.fetcher, wrapper, this._totalFetchCount, isUp);

		fetcher.then(lang.hitch(this, function(result){
			// Set the content of the pane to whatever our defered object returns
			this._setFetchedContent(wrapper, result, isUp);
			if (result.length === 0) {
				return this._disable(isUp);
			}

			// Scan for dojo declarative markup in new content
			if(this.parseOnLoad){
				parser.parse(wrapper);
			}
			// Update our knowledge about ourselves now that we stuffed new data
			this._calc();
			this._totalFetchCount++;
			this._connect.resume();
		}), lang.hitch(this, function(err){
			// If the fetcher is rejecting our request unwire it from our widget
			// and remove the loading message
			this._setFetchedContent(wrapper, '', isUp);
			return this._disable(isUp);
		}));
		return fetcher;
	},

	// Wrap the user supplied content generator function in a deferred object to
	// make it an async source no matter where the data is coming from
	_runFetcher: function(fetcher, wrapper, count, isUp){
		// Get content from the user supplied method
		var fetched_content = fetcher(count, isUp);

		// Some fetchers might pass us a request or other promise object...
		if (typeof fetched_content == 'object') {
			return fetched_content;

		// ...otherwise make one so this happens asychronously
		} else {
			var deferred = new Deferred();

			// If we get nothing back presume we've reached the end of the data
			if(!fetched_content.length){
				deferred.reject();
			}

			// Return the data to the pane as the result of the a promise
			deferred.resolve(fetched_content);

			return deferred.promise;
		}
	},

	_setLoadingMessage: function(node){
		html.set(node, this.loadingMsg);
	},

	_setFetchedContent: function(node, fetched_content, isUp){
		var marker = this.domNode.scrollHeight;
		if (typeof fetched_content === "string") {
			html.set(node, fetched_content);
		}
		if(isUp){
			this.domNode.scrollTop += this.domNode.scrollHeight - marker;
		}
	},

	// If we stop getting data, unwire the scroll event to save resources
	_disable: function(isUp) {
		this._connect.resume();
		if (typeof isUp === "undefined") {
			this._connect.remove();
		} else if (isUp) {
			this._disableUp = true;
		} else {
			this._disableDown = true;
		}
		if (this._disableUp && this._disableDown) {
			this._connect.remove();
		}
	}

});
});
// vim:ts=4:noet:sw=4:tw=0:
