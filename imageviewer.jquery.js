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
        var $this = args.el;
        var settings = $this.data('imageViewer');
        
        if ($.browser.msie) {
            if (args.action == 'show') args.targetEl.show();
            else if (args.action == 'hideremove') args.targetEl.remove();
            else args.targetEl.hide();
            if ($.isFunction(args.callbackFn)) args.callbackFn.call(this);
        } else {
            if (args.action == 'show') {
                args.targetEl.fadeIn(300, function() {
                    if ($.isFunction(args.callbackFn)) args.callbackFn.call(this);
                });
            } else if (args.action == 'hideremove') {
                args.targetEl.fadeOut(200, function() {
                    args.targetEl.remove();
                    if ($.isFunction(args.callbackFn)) args.callbackFn.call(this);
                });
            } else {
                args.targetEl.fadeOut(200, function() {
                    if ($.isFunction(args.callbackFn)) args.callbackFn.call(this);
                });
            }
        }

    };
    


    var setAsSelected = function(args) {
        var $this = args.el,
            settings = $this.data('imageViewer'),
            $imageThumbs = args.selectorThumbs;
        
        $imageThumbs.parents('li').removeClass('selected');
        args.thumbEl.parents('li').addClass('selected');
    };



    var switchImage = function(args) {
        var $this = args.el,
            settings = $this.data('imageViewer');

        settings.largeImageWrapper.css({ height : $('img:first', settings.largeImageWrapper).innerHeight() }); // So the imageWrapper doesn't collapse when image is removed.

        $(new Image())
            .load(function() {
                var newImage = this;
                $(newImage).hide();
                settings.largeImageWrapper.append(newImage);

                imageTransition({
                    el : $this,
                    targetEl : $('img:first', settings.largeImageWrapper),
                    action : 'hideremove',
                    callbackFn : function() {
                        var nWidth = $(newImage).innerWidth();
                        var nHeight = $(newImage).innerHeight();
                        if (settings.largeImageWrapper.innerHeight() != nHeight) settings.largeImageWrapper.animate({ 'height' : nHeight }, 350, function() { imageTransition({ el : $this, targetEl : $(newImage), action : 'show' }); });
                        else imageTransition({ el : $this, targetEl : $(newImage), action : 'show' });
                    } });
                
            })
            .attr({
                src : args.largeImageSrc,
                alt : args.largeImageAlt
            });
    };
    


    // Public
    var methods = {
        
        init : function(options) {
            return this.each(function() {

                var settings = {
                    largeImageWrapper   : 'figure',
                    imageThumbs         : 'li img',
                    cycle               : true
                };

                if (options) $.extend(settings, options);
                
                settings.largeImageWrapper  = $(settings.largeImageWrapper, this);
                var $this           = $(this),
                    $imageThumbs    = $(settings.imageThumbs, this),
                    $firstThumb     = $imageThumbs.first();

                $this.data('imageViewer', settings);

                // Attach event handling to control links
                $this.find('.jiv-next, .jiv-previous, .jiv-first, .jiv-last').bind('click.imageViewer', function(e) {
                    e.preventDefault();
                    var action = $(this).attr('class');
                    if (action == 'jiv-next') methods.loadNext.call($this);
                    if (action == 'jiv-previous') methods.loadPrevious.call($this);
                    if (action == 'jiv-first') methods.loadFirst.call($this);
                    if (action == 'jiv-last') methods.loadLast.call($this);
                });


                // load first image
                if (settings.largeImageWrapper.is(':empty')) settings.largeImageWrapper.append('<img src="" alt="">');
                methods.loadFirst.call($this);


                // Attach event handling to thumbnails
                $imageThumbs.parent('a').bind('click.imageViewer focus.imageViewer', function(e) {
                    e.preventDefault();
                    var $thumbEl = $(this).find('img');
                    if ($thumbEl.parents('li').hasClass('selected')) return false;

                    setAsSelected({
                        el : $this,
                        selectorThumbs : $imageThumbs,
                        thumbEl : $thumbEl
                    });

                    switchImage({
                        el : $this,
                        largeImageSrc : $thumbEl.parent('a').attr('href'),
                        largeImageAlt : ($thumbEl.attr('alt') == '') ? $thumbEl.attr('alt') : ''
                    });
                    
                    settings.current = $thumbEl;
                });

            });
        },



        loadNext : function() {
            return this.each(function() {
                var $this = $(this),
                    settings = $this.data('imageViewer'),
                    $imageThumbs = $(settings.imageThumbs, this),
                    $thumbEl;
                    
                $imageThumbs.each(function(i,e) {
                    if ($(this).is(settings.current)) $thumbEl = $($imageThumbs[i + 1]);
                });

                if (($thumbEl.length <= 0) && settings.cycle) {
                    methods.loadFirst.call($this);
                    return false;
                }

                setAsSelected({
                    el : $this,
                    selectorThumbs : $imageThumbs,
                    thumbEl : $thumbEl
                });

                switchImage({
                    el : $this,
                    largeImageSrc : $thumbEl.parent('a').attr('href'),
                    largeImageAlt : ($thumbEl.attr('alt') == '') ? $thumbEl.attr('alt') : ''
                });

                settings.current = $thumbEl;
            });            
        },



        loadPrevious : function() {
            return this.each(function() {
                var $this = $(this),
                    settings = $this.data('imageViewer'),
                    $imageThumbs = $(settings.imageThumbs, this),
                    $thumbEl;
                
                $imageThumbs.each(function(i,e) {
                    if ($(this).is(settings.current)) $thumbEl = $($imageThumbs[i - 1]);
                });

                if (($thumbEl.length <= 0) && settings.cycle) {
                    methods.loadLast.call($this);
                    return false;
                }
                
                setAsSelected({
                    el : $this,
                    selectorThumbs : $imageThumbs,
                    thumbEl : $thumbEl
                });

                switchImage({
                    el : $this,
                    largeImageSrc : $thumbEl.parent('a').attr('href'),
                    largeImageAlt : ($thumbEl.attr('alt') == '') ? $thumbEl.attr('alt') : ''
                });
                
                settings.current = $thumbEl;
            });
        },



        loadFirst : function() {
            return this.each(function() {
                var $this = $(this),
                    settings = $this.data('imageViewer'),
                    $imageThumbs = $(settings.imageThumbs, this),
                    $thumbEl = $imageThumbs.first();
                
                console.log('loadFirst');
                
                setAsSelected({
                    el : $this,
                    selectorThumbs : $imageThumbs,
                    thumbEl : $thumbEl
                });
    
                switchImage({
                    el : $this,
                    largeImageSrc : $thumbEl.parent('a').attr('href'),
                    largeImageAlt : ($thumbEl.attr('alt') == '') ? $thumbEl.attr('alt') : ''
                });
                
                settings.current = $thumbEl;
            });
        },



        loadLast : function() {
            return this.each(function() {
                var $this = $(this),
                    settings = $this.data('imageViewer'),
                    $imageThumbs = $(settings.imageThumbs, this),
                    $thumbEl = $imageThumbs.last();
                
                console.log('loadLast');
                
                setAsSelected({
                    el : $this,
                    selectorThumbs : $imageThumbs,
                    thumbEl : $thumbEl
                });
    
                switchImage({
                    el : $this,
                    largeImageSrc : $thumbEl.parent('a').attr('href'),
                    largeImageAlt : ($thumbEl.attr('alt') == '') ? $thumbEl.attr('alt') : ''
                });
                
                settings.current = $thumbEl;
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