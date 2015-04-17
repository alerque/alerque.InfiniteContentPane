var profile = (function(){
  return {
    resourceTags: {
      test: function(filename) {
        return /\.html$/.test(filename);
      },
      copyOnly: function(filename) {
        return filename in {
          "package.json": true,
          "package.js": true
        };
      },
      amd: function(filename) {
        return /\.js$/.test(filename);
      }
    }
  };
})();
