### alerque.InfiniteContentPane

(Formerly dojox.layout.InfiniteContentPane -- the move to an unused namespace
makes it easier to siteload into projects until such a time as it actually gets
included into the upstream dojox tree.)

An **infinite scrolling content pane** widget for the Dojo Toolkit inspired by
(but not copied from) Paul Irish's [Infinite Scroll jQeruy plugin][piis].

* Extends dojox.layout.ContentPane with scroll detection and callbacks for
  fetching, placing and parsing extended data.
* Uses user supplied function for the fetcher that can easily be wired up to
  xhr requests.
* Allows infinite scroll in either direction.
* Inteligently disables the widget when it runs out of data.
* Adjustable trigger zone height for optimal performance.

  [piis]: https://github.com/paulirish/infinite-scroll
