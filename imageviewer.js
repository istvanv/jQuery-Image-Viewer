/**
 * @author Istvan Vincze
 * 
 * <div class="image-viewer">
 *  <ul>
 *      <li><a href="/images/image1.jpg"><img src="/images/thumbs/image1.jpg" alt="Alt text"></a></li>
 *  </ul>
 *  <figure></figure>
 * </div>
 * 
 * 
 */

(function($) {

    // Private
    var imageTransition = function(args) {

        if ($.browser.msie) {
            if (args['action'] == 'show') args['targetEl'].show();
            else if (args['action'] == 'hideremove') args['targetEl'].remove();
            else args['targetEl'].hide();
            if ($.isFunction(args['callbackFn'])) args['callbackFn'].call(this);
        } else {
            if (args['action'] == 'show') {
                args['targetEl'].fadeIn(300, function() {
                    if ($.isFunction(args['callbackFn'])) args['callbackFn'].call(this);
                });
            } else if (args['action'] == 'hideremove') {
                args['targetEl'].fadeOut(200, function() {
                    args['targetEl'].remove();
                    if ($.isFunction(args['callbackFn'])) args['callbackFn'].call(this);
                });
            } else {
                args['targetEl'].fadeOut(200, function() {
                    if ($.isFunction(args['callbackFn'])) args['callbackFn'].call(this);
                });
            }
        }

    };


    var setAsSelected = function(args) {
        args['selectorThumbs'].parents('li').removeClass('selected');
        args['thumbEl'].parents('li').addClass('selected');
    };


    // Public
    var methods = {
        
        init : function(options) {

            return this.each(function() {

                var settings = {
                    largeImageWrapper   : 'figure',
                    imageThumbs         : 'li img'
                };

                if (options) $.extend(settings, options);

                var $this               = $(this);
                var $largeImageWrapper  = $(settings.largeImageWrapper, this);
                var $imageThumbs        = $(settings.imageThumbs, this);
                var $firstThumb         = $imageThumbs.first();

                setAsSelected({ selectorThumbs : $imageThumbs, thumbEl : $firstThumb });

                if ($largeImageWrapper.is(':empty')) {
                    $largeImageWrapper.append('<img src="'+$firstThumb.parent('a').attr('href')+'" alt="'+$firstThumb.attr('alt')+'">');
                    //$firstThumb.parent('a').focus();
                }

                $imageThumbs.parent('a').bind('click.imageViewer focus.imageViewer', function(e) {

                    e.preventDefault();
 
                    var $thumbEl = $(this).find('img');
                    if ($thumbEl.parents('li').hasClass('selected')) return false;

                    setAsSelected({ selectorThumbs : $imageThumbs, thumbEl : $thumbEl });
                    $largeImageWrapper.css({ height : $('img:first', $largeImageWrapper).innerHeight() }); // So the imageWrapper doesn't collapse when image is removed.

                    var $largeImageSrc  = $thumbEl.parent('a').attr('href');
                    var largeImageAlt   = $thumbEl.attr('alt');
                    largeImageAlt       = (largeImageAlt == '') ? $largeImageSrc.split('/').pop() : largeImageAlt;

                    $(new Image())
                        .load(function() {
                            var newImage = this;
                            $(newImage).hide();
                            $largeImageWrapper.append(newImage);
            
                            imageTransition({ targetEl : $('img:first', $largeImageWrapper), action : 'hideremove', callbackFn : function() {
                                var nWidth = $(newImage).innerWidth();
                                var nHeight = $(newImage).innerHeight();
                                if ($largeImageWrapper.innerHeight() != nHeight) $largeImageWrapper.animate({ 'height' : nHeight }, 350, function() { imageTransition({ targetEl : $(newImage), action : 'show' }); });
                                else imageTransition({ targetEl : $(newImage), action : 'show' });
                            } });
                            
                        })
                        .attr({ src : $largeImageSrc, alt : largeImageAlt });
    
                });

            });

        }

    };


    // Plugin
    $.fn.imageViewer = function(method) {

        if ( methods[method] ) {
          return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methods.method === 'object' || ! method ) {
          return methods.init.apply( this, arguments );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery.imageViewer' );
        }  

    };

})(jQuery);