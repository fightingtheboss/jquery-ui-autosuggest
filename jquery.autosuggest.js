/******************************************************************************
  Autosuggest jQuery Plugin

  Extends the jQuery UI Autocomplete widget to provide caching of responses and 
  bad queries, as well as category support for results.

  DEPENDENCIES
  * jQuery 1.4.2+
  * jQuery UI 1.8.7+ (Widget Factory + Autocomplete)
    https://github.com/jquery/jquery-ui/blob/1.8.7/ui/jquery.ui.autocomplete.js

  Author: Mina Mikhail (@fightingtheboss)
  Github: http://github.com/fightingtheboss

******************************************************************************/

(function( $ ) {
  $.widget( "ui.autosuggest", $.ui.autocomplete, {
    options: {
      showCategories: true
    },

    _initSource: function() {
      var self = this,
          array,
          url;

      this.element.data("autosuggest.cache", {
        responseCache: {},
        badQueries: []
      });

      if ( $.isArray(this.options.source) ) {
        array = this.options.source;
        this.source = function( request, response ) {
          response( $.ui.autocomplete.filter(array, request.term) );
        };
      } else if ( typeof this.options.source === "string" ) {
        url = this.options.source;
        this.source = function( request, response ) {
          if (self.xhr) {
            self.xhr.abort();
          }

          var elementData = this.element.data("autosuggest.cache");

          if ( request.term in elementData.responseCache ) {
            response( elementData.responseCache[ request.term ] );
            return;
          }

          if ( $.inArray( request.term, elementData.badQueries ) === -1 ) {
            self.xhr = $.ajax({
              url: url,
              data: request,
              dataType: "json",
              success: function( data, status, xhr ) {
                if ( xhr === self.xhr ) {
                  if ( data.length == 0 ) elementData.badQueries.push( request.term );
                  elementData.responseCache[ request.term ] = data;
                  response( data );
                }
                self.xhr = null;
              },
              error: function( xhr ) {
                if ( xhr === self.xhr ) {
                  response( [] );
                }
                self.xhr = null;
              }
            });
          }
        };
      } else {
        this.source = this.options.source;
      }
    },

    _renderMenu: function( ul, items ) {
      var self = this, currentCategory = "";

      $.each( items, function( index, item ) {
        if ( self.options.showCategories && item.category && item.category != currentCategory ) {
          ul.append( "<li class='ui-autocomplete-category'><h6 class='ui-autocomplete-category-title'>" + item.category + "</h6></li>" );
          currentCategory = item.category;
        }

        self._renderItem( ul, item );
      });
    }
  });
})( jQuery );