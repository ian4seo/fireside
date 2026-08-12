
  Brando = new function()
  {

    $ = jQuery;

    this.init = function() {

        Brando.fadeLoader();

        Brando.toggleElements();

        /**
         * Search Toggle
         */
        $('body').on('click', '.custom-search-submit',function(e) {
          if(window.innerWidth > 1024) {

            $('.custom-search-wrap').toggleClass('hidden-search');
            $('.custom-search-wrap').toggleClass('show-search');
            
            // Focus search
            setTimeout(function() { $('.custom-search-wrap .search-container input[type="text"]').focus() }, 100);
          }
        });

        $('body').on('click', '.search-close',function() {
          $('.custom-search-wrap').toggleClass('hidden-search');
          $('.custom-search-wrap').toggleClass('show-search');
        });

        /**
         * Scroll Arrows
         * Html example
         * <div class="scroll-arrow pointer" data-target=".content-area"></div>
         */
        $('.scroll-arrow').on('click', function() {
          var target = $(this).data('target');
          $('html, body').animate({
                scrollTop: $(target).offset().top - 81
            }, 600);
        });

    };

    /**
     * Fades out a div that is fixed overtop of the entire site on page load.
     * Used as a visual effect. Runs after all of the images have been loaded
     */
    this.fadeLoader = function() {
        $('#preloader').remove();
        $('body').css({'overflow':'visible'});
    }

    this.toggleElements = function() {
      var changeHappened = false;
      var windowWidth = window.innerWidth;

      /*Initial*/
      if(windowWidth <= "767") {
        changeHappened = true;

      }

      /*On Resize*/
      $(window).resize( function() {
        windowWidth = window.innerWidth;

        if(windowWidth <= "767") {
          if(changeHappened == false) {
            changeHappened = true;

          }
        }
        else {
          if(changeHappened == true) {
            changeHappened = false;
            console.log('here');
            $('.collection-filters').css('display', '');

          }
        }
      });

    }
}

jQuery(function(){Brando.init()});
