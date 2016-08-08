jQuery(function($) {

$( window ).load(function() {
  prettyPrint();
  updateSocialLinks();
  initPostStubs();
  checkForCopyright();
  initializeLightbox();
});

//$(".post-content").fitVids();

$('#social-sidebar').mouseover(function() {
$('svg').find('#svg-button-facebook').stop()
  .animate({'stroke-dashoffset': 0}, 1000)
  .css({'fill': '#3b5998', 'transition': 'fill 0.5s'});
$('svg').find('#svg-button-twitter').stop()
  .animate({'stroke-dashoffset': 0}, 1000)
  .css({'fill': '#55acee', 'transition': 'fill 0.5s'});
$('svg').find('#svg-button-google').stop()
  .animate({'stroke-dashoffset': 0}, 1000)
  .css({'fill': '#dc4e41', 'transition': 'fill 0.5s'});
$('svg').find('#svg-button-linkedin').stop()
  .animate({'stroke-dashoffset': 0}, 1000)
  .css({'fill': '#007ab9', 'transition': 'fill 0.5s'});
$('svg').find('#svg-button-email').stop()
  .animate({'stroke-dashoffset': 0}, 1000)
  .css({'fill': '#c83737', 'transition': 'fill 0.5s'});
}); $('#social-sidebar').mouseout(function() {
$('svg').find('.svg-button').stop()
  .animate({'stroke-dashoffset': 900}, 1000)
  .css({'fill': '#b3b3b3', 'transition': 'fill 0.5s'});
});
// Optional, Hiding sidebar
// $('.share-button-in').hide();
// $('#social-sidebar').mouseover(function() {
//   $('.share-button-out').hide();
//   $('.share-button-in').show();
// }); $('#social-sidebar').mouseout(function() {
//   $('.share-button-out').delay( 150 ).show();
//   $('.share-button-in').delay( 150 ).hide();
// });



/** ============================
 *  `To The Top` Link
 */

$('.js-jump-top').on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({'scrollTop': 0});
});


/** ============================
 *  Hide Page Header on Scroll
 */

var didScroll;
var lastScrollTop = 0;
var delta = 2;
var navbarHeight = $('header').outerHeight();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();
    
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('#headerGradient').hide();
        $('header').removeClass('nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
//       $('#headerGradient').delay( 150 ).fadeIn( 100 );
            $('header').removeClass('nav-up').addClass('nav-down');
        $('#headerGradient').show();
        }

    }
    
    lastScrollTop = st;
}


/** ============================
 *  Site Search
 */

var searchField = $("#search-field").ghostHunter({
    results     : ".container-search",
    rss         : "rss.xml",
    //Enable the "search as you type" by uncommenting the following line
    onKeyUp   : true,
    result_template     : '<ol class="search-list"><div class="post-stub"><div><div class="post-stub-content"><time datetime="{{pubDate}}">{{pubDate}}</time>' +
                            '<h4>{{title}}</h4><p>{{description}}</p><a class="js-ajax-link" title="{{title}} | {{@blog.title}}" href="{{link}}">Continue Reading</a>' +
                            '</div></div></div></ol><hr class="post-loop">',
    info_template       : "<div class='title-spacer' style=''>&nbsp;</div><div class='search-header'><h2 class='search-title'>Site Search</h2><p>Found: {{amount}} post(s), searching for <b><span id='searching-for'></span></b></p></div><hr class='post-loop'>",
    tail_template   : "<p class='search-return-link'><a href='#' id='return-to-page'>Return to Previous Page</a></p>",
});

$('#search-field').val('');
$('section.container-search').hide();
$('section.container-search').prop('visible', false);

$('#search-field').keyup(function() {
    if( $(this).val() ) {

		if($('section.container-post').is(":visible")){
			if($('section.latest-post').is(":visible")){
				console.log('Hid: latest-post')
				$('section.container-search').prop('replaced-latest-post', true);
			} else {
				console.log('Hid: post-index')
				$('section.container-search').prop('replaced-latest-post', false);
			}
		}

        $('section.container-post').fadeOut(300, function() {
           $('section.container-search').fadeIn(300);
           $('section.container-search').prop('visible', true);
           initPostStubs();
        });
         $('#searching-for').text($(this).val());
         $('#return-to-page').click(function() {
            $('#search-field').val('');
            $('#search-field').focusout();
        });

    }
});


$('#search-field').focusout(function() {
    if( ! $(this).val() ) {
    	console.log('Search field is: focus-out')
		if($('section.container-search').prop('replaced-latest-post')){
			console.log('Fade-In: latest-post')
			$('section.container-search').fadeOut(300, function() {
				$(this).prop('visible', false);
				$('.latest-post').fadeIn(300);
			});
		} else {
			console.log('Fade-In: post-index')
			$('section.container-search').fadeOut(300, function() {
				$(this).prop('visible', false);
				$('section.post-index').fadeIn(300);
			});
		}
    }
});

function clearResults() {
    searchField.clear();
}

$('#searchsubmit').click(function() {
    $('#search-field').keyup();
});



/** ============================
 *  AJAX Navigation
 */

var History = window.History;
var loading = false;
var showIndex = false;
var $ajaxContainer = $('#container-ajax');
var $latestPost = $('.latest-post');
var $postIndex = $('section.post-index');

// Initially hide the index and show the latest post
$latestPost.show();
$postIndex.hide();

// Show the index if the url has "page" in it (a simple
// way of checking if we're on a paginated page.)
if (window.location.pathname.indexOf('page') === 1 || window.location.pathname.indexOf('tag') === 1) {
    console.log('Called Pagination Test')
    $latestPost.hide();
    $postIndex.show();
}

// Check if history is enabled for the browser
if ( ! History.enabled) {
    return false;
}

History.Adapter.bind(window, 'statechange', function() {
    var State = History.getState();
        console.log('Called History.Adapter')

    // Get the requested url and replace the current content
    // with the loaded content
    $.get(State.url, function(result) {
        console.log('Called History.Adapter, URL loaded, processing.')
        var $html = $(result);
        var $newContent = $('#container-ajax', $html).contents();

        // Set the title to the requested urls document title
        document.title = $html.filter('title').text();

        $('html, body').animate({'scrollTop': 0});

        $ajaxContainer.fadeOut(500, function() {
            $latestPost = $newContent.filter('.latest-post');
            $postIndex = $newContent.filter('section.post-index');

            if (showIndex === true) {
                $latestPost.hide();
            } else {
                $latestPost.show();
                $postIndex.hide();
            }

            // Re run fitvid.js
            //$newContent.fitVids();

            $ajaxContainer.html($newContent);
            $ajaxContainer.fadeIn(500);

            NProgress.done();

            loading = false;
            showIndex = false;
            /* Add on's */
            prettyPrint();
            updateSocialLinks();
            initPostStubs();
            checkForCopyright();
            $latestPost = $('.latest-post');
            $postIndex = $('section.post-index');
        });
    }).fail(function() {
        // Request fail
        console.log('Called History.Adapter, FAILED, attempting reload.')
        NProgress.done();
        location.reload();
    });
});

//Attach handler for ajax requests

$('body').on('click', '.js-ajax-link, .pagination a, .post-tags a, .post-header a', function(e) {
    ajaxClick( $(this), e );
});

// Handle hyperlink ajax requests
function ajaxClick(thisObj, eObj) {
    eObj.preventDefault();
    console.log('Called ajaxClick ' + thisObj)
    $('#right-sidebar-copyright').fadeOut(300);
    $('#search-field').val('');

    if (loading === false) {
        var currentState = History.getState();
        var url = thisObj.attr('href');
        var title = thisObj.attr('title') || null;

        //if url is missing http or the domain, correct it
    if (url.indexOf("http", 0) === -1) {
      console.log('Current URL missing http: ' + url)
      if (url.search("chadsheets.com") === -1) {
        url = "http://chadsheets.com" + url;
      } else {
        url = "http://" + url;
      }
    }

        //if url starts with http:// and currentState.url starts with
        // https://, replace the protocol in url
        if (url.indexOf("http://", 0) === 0)
        {
            var urlNoProt = url.replace(/.*?:\/\//g, "");
            var curProt = currentState.url.split("/")[0];
            url = curProt + "//" + urlNoProt;
        }
        
        // If the requested url is not the current states url push
        // the new state and make the ajax call.
        if (url.replace(/\/$/, "") !== currentState.url.replace(/\/$/, "")) {
            console.log('Changing URL Parameters because: ' + url.replace(/\/$/, "") + '!=' + currentState.url.replace(/\/$/, ""))
            loading = true;

            // Check if we need to show the post index after we've
            // loaded the new content
            if (thisObj.hasClass('js-show-index') || thisObj.parent('.pagination').length > 0) {
                 console.log('has class js-show-index')
                showIndex = true;
            }

            NProgress.start();

            History.pushState({}, title, url);
        } else {
            // Swap in the latest post or post index as needed

            if ($('section.container-search').prop('visible')) {
					if($('section.container-search').prop('replaced-latest-post')){
						$('section.container-search').fadeOut(300, function() {
							$(this).prop('visible', false);
							$('.latest-post').fadeIn(300);
						});
					} else {
						$('section.container-search').fadeOut(300, function() {
							$(this).prop('visible', false);
							$('section.post-index').fadeIn(300);
						});
					}
            }


            if (thisObj.hasClass('js-show-index')) {
                console.log('Same url, link contained js-show-index')
                console.log($())
                console.log($latestPost)
                $('html, body').animate({'scrollTop': 0});

                NProgress.start();

                $latestPost.fadeOut(300, function() {
                    $postIndex.fadeIn(300);
                    NProgress.done();
                });
            } else {
                console.log('Same url, link missing js-show-index')
                console.log($())
                console.log($latestPost)
                $('html, body').animate({'scrollTop': 0});

                NProgress.start();

                $postIndex.fadeOut(300, function() {
                    $latestPost.fadeIn(300);
                    NProgress.done();
                });
            }
        }
    }
}



/**
 * Functions needed after each ajax reload
 */

function updateSocialLinks() {
  $('#facebook-share-button, #facebook-share-button-tail').attr("href", "https://facebook.com/sharer/sharer.php?u=http%3A%2F%2Fchadsheets.com" + window.location.pathname.replace(/\//g,"%2F"));
  $('#google-share-button, #google-share-button-tail').attr("href", "https://plus.google.com/share?url=http%3A%2F%2Fchadsheets.com" + window.location.pathname.replace(/\//g,"%2F"));
  $('#twitter-share-button, #twitter-share-button-tail').attr("href", "https://twitter.com/intent/tweet/?text=" + document.title.replace(/ /g,"%20") + ";&url=http%3A%2F%2Fchadsheets.com" + window.location.pathname.replace(/\//g,"%2F"));
  $('#linkedin-share-button, #linkedin-share-button-tail').attr("href", "https://www.linkedin.com/shareArticle?mini=true&url=http%3A%2F%2Fchadsheets.com" + window.location.pathname.replace(/\//g,"%2F") + "&title=" + document.title.replace(/ /g,"%20") + "&summary=" + document.title.replace(/ /g,"%20") + "&source=http%3A%2F%2Fchadsheets.com");
  $('#email-share-button, #email-share-button-tail').attr("href", "mailto:?to=&body=Check out this article: " + document.title.replace(/ /g,"%20") + " http%3A%2F%2Fchadsheets.com" + window.location.pathname.replace(/\//g,"%2F") + ",&subject=Thought you would be interested in this site");
}

function initPostStubs() {
    $('.post-stub-content').mouseover(function() {
      $(this).css('cursor','pointer')
      $(this).attr('href', $(this).find("a:first").attr("href"))
      $(this).parent().parent().css('border-left', '2px solid #417a97')
      $(this).click(function(e){ ajaxClick( $(this), e ) })
    }); $('.post-stub-content').mouseout(function() {
      $(this).parent().parent().css('border-left', '2px solid #FFFFFF')
    });
    $('.post-stub-tag-img').mouseover(function() {
      $(this).css('cursor','pointer')
      $(this).attr('href', $(this).find("a:first").attr("href"))
      $(this).parent().parent().css('border-right', '2px solid #417a97')
      $(this).click(function(e){ ajaxClick( $(this), e ) })
    }); $('.post-stub-tag-img').mouseout(function() {
      $(this).parent().parent().css('border-right', '2px solid #FFFFFF')
    });
}

function checkForCopyright() {
  if ( $('img.image-copyright').length ) {
    if( $('img.image-copyright').data('copyright-holder') ) {
      $('#image-description').html('Photo &copy;');
      $('#image-description').attr('href', 'https://creativecommons.org/licenses/by-sa/2.0/');
      $('#image-attribution').text($('img.image-copyright').data('copyright-holder'));
    } else {
      $('#image-description').text('Photo from');
      $('#image-description').attr('href', $('img.image-copyright').data('url'));
      $('#image-attribution').text($('img.image-copyright').data('image-attribution'));
    }
    $('#image-attribution').attr('href', $('img.image-copyright').data('url'));
    $('#right-sidebar-copyright').fadeIn(300);
  }
}

function initializeLightbox() {
    lightbox.option({
      'disableScrolling': true,
      'positionFromTop': 75,
      'resizeDuration': 500,
      'wrapAround': true
    })
}

/**
 * GitHub style code box. Registers a language handler for YAML.
 * @author ribrdb
 */

PR['registerLangHandler'](
  PR['createSimpleLexer'](
    [
      [PR['PR_PUNCTUATION'], /^[:|>?]+/, null, ':|>?'],
      [PR['PR_DECLARATION'],  /^%(?:YAML|TAG)[^#\r\n]+/, null, '%'],
      [PR['PR_TYPE'], /^[&]\S+/, null, '&'],
      [PR['PR_TYPE'], /^!\S*/, null, '!'],
      [PR['PR_STRING'], /^"(?:[^\\"]|\\.)*(?:"|$)/, null, '"'],
      [PR['PR_STRING'], /^'(?:[^']|'')*(?:'|$)/, null, "'"],
      [PR['PR_COMMENT'], /^#[^\r\n]*/, null, '#'],
      [PR['PR_PLAIN'], /^\s+/, null, ' \t\r\n']
    ],
    [
      [PR['PR_DECLARATION'], /^(?:---|\.\.\.)(?:[\r\n]|$)/],
      [PR['PR_PUNCTUATION'], /^-/],
      [PR['PR_KEYWORD'], /^[\w-]+:[ \r\n]/],
      [PR['PR_PLAIN'], /^\w+/]
]), ['yaml', 'yml']);


});
