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
	'dojox/layout/ContentPane'
], function(declare, lang, Deferred, domConstruct, domGeometry, html, on,
			parser, ContentPane){
return declare('alerque.InfiniteContentPane', [ContentPane], {
	fetcher: null, // user supplied function that returns data
	triggerHeight: 100, // how close (in pixel) to the bottom or top to fetch
	maxFetchers: 1, // how many pending fetcher threads to allow
	loadingMsg: '<p>Loading...</p>',
	enableUp: false, // defaults to only expanding on scroll down

	_paneHeight: 0,
	_scrollHeight: 0,
	_totalFetchCount: 0,
	_activeFetcherCount: 0,
	_connect: null,
	_heightMark: 0,

	postCreate: function(){
		// Wire up scroll events to checking if we need more data
		this._connect =
			on(this.domNode, 'scroll', lang.hitch(this, '_onScroll'));
		// Run a check on our data situation on instantiation
		this._calc();
		this._onScroll();
		return this.inherited(arguments);
	},

	resize: function(){
		// if we got resized, recalculate our size and then simulate a scroll
		// event just to make sure we have the data we're supposted to
		this._calc();
		this._onScroll();
		return this.inherited(arguments);
	},

	_calc: function(){
		// TODO: do some math to make sure trigger zone is a sane size of pane
		this._paneHeight = domGeometry.position(this.domNode).h;
		this._scrollHeight = this.domNode.scrollHeight;
	},

	_onScroll: function(event){
		// Find our current position
		var bottomPos = this.domNode.scrollTop + this._paneHeight;

		// Do the math to see if the trigger zone area has scrolled into view
		if(bottomPos > (this._scrollHeight - this.triggerHeight)){
			// As long as we aren't waiting on too much already, go fetch data
			if(this._activeFetcherCount < this.maxFetchers){
				this._fetch(false);
			}
		}

		if(this.enableUp){
			if(this.domNode.scrollTop < this.triggerHeight){
				this._fetch(true);
			}
		}
	},

	_fetch: function(isUp){
		// TODO: test that fetcher is a function? object? In any case don't
		// bother if we don't have one
		if(!this.fetcher){
			return this._disable();
		}

		// Start a placeholder for content that we'll be fetching. Doing this
		// early lets us set a loading message and keeps content in order even
		// if async fetchers come back out of order.
		var wrapper = domConstruct.create('div', {
			'class': 'alerque-infinite-content'
		});
		domConstruct.place(wrapper, this.domNode, isUp ? 'first' : 'last');
		this._setFetchedContent(wrapper, this.loadingMsg, isUp);


		// Instantiate a new fetcher
		var fetcher =
			this._runFetcher(this.fetcher, wrapper, this._totalFetchCount, isUp);

		fetcher.then(lang.hitch(this, function(result){
			this._setFetchedContent(wrapper, content, isUp);
			// Scan for dojo declarative markup in new content
			if(this.parseOnLoad){
				parser.parse(wrapper);
			}
			// Update our knowledge about ourselves now that we stuffed new data
			this._calc();
			this._activeFetcherCount--;
			this._totalFetchCount++;
		}), lang.hitch(this, function(err){
			// If the fetcher is rejecting our request unwire it from out widget
			return this._disable();
		}));
	},

	// Wrap the user supplied content generator funtion in a deferred object to
	// make it an async source no matter where the data is coming from
	_runFetcher: function(fetcher, wrapper, count, isUp){
		this._activeFetcherCount++;

		// Get content from the user supplied method
		var content = fetcher(count, isUp);

		// Some fetchers might pass us a request or other promise object...
		if (typeof content == 'object') {
			return content;

		// ...otherwise make one so this happens asychronously
		} else {
			var deferred = new Deferred();
			this._setFetchedContent(wrapper, content, isUp);

			// If we get nothing back presume we've reached the end of the data
			if(!content.length){
				deferred.reject();
			}

			// Let the pane know this data came back and it can try again form more
			// when it runs out
			deferred.resolve('success');

			return deferred.promise;
		}
	},

	_setFetchedContent: function(node, content, isUp){
		var marker = this.domNode.scrollHeight;
		html.set(node, content);
		if(isUp){
			this.domNode.scrollTop += this.domNode.scrollHeight - marker;
		}
	},

	_disable: function(){
		// If we stop getting data, unwire the scroll event to save resources
		this._connect.remove();
	}
});
});
// vim:ts=4:noet:sw=4:tw=0:
