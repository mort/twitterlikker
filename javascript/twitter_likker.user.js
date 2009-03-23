// ==UserScript==
// @name Twitter Likker
// @namespace http://thehyperrealists.com/works/twitterlikker
// @description A basic 'like' functionality for Twitter
// @include http://twitter.com/home
// @author  mort (manuel@simplelogica.net)  
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @version 0.1
// ==/UserScript==
 
var base_url = 'http://0.0.0.0:4567';
var endpoint = base_url+'/likings';
var styles_url = base_url+'/external.css'
var me = $.trim($('p#me_name').text());
var me_likings = [];


$(function() {
  
    var permalinks = [];
		
		// Collect tweet's permalinks
    $("li.status a.entry-date").each(function(i){

			// Use this loop to create the wrapper
			var container = $(this).parent();		 
     	var status_id = _getStatusIdFromPermalink(this.href);     
			var wrapper = $('<div></div>').attr('id','twitterlikker_wrapper_'+status_id).attr('class','twitterlikker_wrapper');
    	wrapper.appendTo(container);
  
  		permalinks.push(escape(this.href));
		});
		
		// Ask the mothership about current likings
		findLikings(permalinks.join(','));
		
		 // Attach like links
		 $("li.status a.entry-date").each(function(i){
				 attachLikeLink(this); 
		 });
		
		attachStyles();
		
});

function attachLikeLink(t) {
     var permalink = t.href;
     var status_id = _getStatusIdFromPermalink(permalink);
		 var wrapper = $('#twitterlikker_wrapper_'+status_id);
		
		 $('<a>Like</a>').attr('class','liking like').attr('id','liking_'+status_id).attr('href','#').bind("click", function(e){
				createLike(permalink);
				return false;
      }).appendTo(wrapper);
}

function attachUnlikeLink(t){
	var permalink = t.href;
	var status_id = _getStatusIdFromPermalink(permalink);
	var wrapper = $('#twitterlikker_wrapper_'+status_id);
		
	$('<a>Unlike</a>').attr('class','liking unlike').attr('id','liking_'+status_id).attr('href','#').bind("click", function(e){
		removeLike(permalink);
		return false;
   }).appendTo(wrapper);
}


function createLike(permalink){
	
	GM_xmlhttpRequest({
	  method:"POST",
	  url:endpoint,
	  data: 'who='+me+'&permalink='+escape(permalink),
	  headers:{
	    "Content-Type": 'application/x-www-form-urlencoded'
	  },
	  onload:function(response) {
		  if (response.status == 201) {
				var permalink = eval('('+response.responseText+')');
				var status_id = _getStatusIdFromPermalink(permalink);
				$('a#liking_'+status_id).replaceWith("<span>You like this</span>");
			}
	    
	  }
	});
	
}

function removeLike(permalink){
	
	GM_xmlhttpRequest({
	  method:"DELETE",
	  url:endpoint,
	  data: 'who='+me+'&permalink='+escape(permalink),
	  headers:{
	    "Content-Type": 'application/x-www-form-urlencoded'
	  },
	  onload:function(response) {
		  var status_id = _getStatusIdFromPermalink(permalink);
      $('a#liking_'+status_id).replaceWith("<span>Don't you like this anymore? You volatile thing!</span>");
	    attachLikeLink( $('a#liking_'+status_id).parent());
	  }
	});
	
}

function findLikings(permalinks) {
	GM_xmlhttpRequest({
    method:"GET",
	  url:endpoint+'?p='+permalinks,
		onload:function(response) {
			var l = '';
			if (response.responseText != '') {
				l = eval("("+response.responseText+")");
				$("li.status a.entry-date").each(function(i){
					var me_likes_this = false;
					var s = '';
					var current = this.href;
					var users_array = l[current];

					if (typeof(users_array) != 'undefined') {	
						var indexofme = $.inArray(me,users_array)
						if (indexofme != -1) {
							users_array[indexofme] = 'you';
							me_likes_this = true;
						}

						var total = users_array.length;
						s += users_array.join(', ');
						j = ((total == 1 && users_array[0] != 'you')) ? 'likes' : 'like';
						s += ' '+j+' this';

						var p = $('<p class="likings_count">'+s+'</p>');

						p.appendTo($(this).parent());

						var statusId = _getStatusIdFromPermalink(this.href);
						if (me_likes_this == true) {
							$('a#liking_'+statusId).hide();
						}

					} // Cierre if

					}); // Cierre each
			}
		} // Cierre onload
				
	}); // Cierre xmlhttprequest
	
} // Cierre función

function attachStyles() {
	var link = window.document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = styles_url;
	$("HEAD")[0].appendChild(link);
}


function _getStatusIdFromPermalink(permalink) {
	return permalink.split('/').pop();
}
