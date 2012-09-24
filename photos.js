/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
    		var favBtn = document.createElement('button');
			favBtn.onclick = function()
    		        {
			  if (checkCookie(this.imgName))
                          {
                            updateCookie(this.imgName,'N');
                            this.className = 'icon-heart-empty';
                          }
                          else
                          {
                            updateCookie(this.imgName,'Y');
                            this.className = 'icon-heart';
                          }
			};
			favBtn.imgName = img.src;
			if (checkCookie(img.src))
			  favBtn.className = 'icon-heart';
			else			
			  favBtn.className = 'icon-heart-empty';
			favBtn.style.width = '26px'
			elm.appendChild(favBtn);
            elm.appendChild(document.createElement('br'));            
            elm.className = 'photo';
            elm.appendChild(img);
            holder.appendChild(elm);
        };
    }

    function updateCookie(name, value)
    {
      var favs = getCookie('flkFavs');
      if (value == 'N'){
        var s = name+',';
        favs = favs.replace(s, '');
      }
      else
        favs += name+',';
      var date = new Date();
      date.setTime(date.getTime() + (90*24*60*60*1000));
      var expires = "; expires=" + date.toGMTString();
 
      var cookie = escape(value);
      document.cookie= "flkFavs=" + favs + expires + "; path=/";
    }
 
    function checkCookie(name)
    {
      var favs = getCookie('flkFavs');
      return (favs.indexOf(name) != -1)
    }
	  
    function getCookie(name)
    {
	  var allCookies = document.cookie.split(";");
	  
	  for (var i = 0; i < allCookies.length; i++)
		{
		var x = allCookies[i].substr(0, allCookies[i].indexOf("="));
		var y = allCookies[i].substr(allCookies[i].indexOf("=")+1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x == name)
		  return unescape(y);
		}
		
	  return '';  
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));
