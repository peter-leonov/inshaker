$.onload
(
	function ()
	{
		// alert(133)
		
		new Programica.RollingImagesLite(cssQuery('.b-content .photos')[0], {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite($('recommendations'))
		new Programica.RollingImagesLite($('carte'), {animationType: 'easeInOutCubic'})
		
		setTimeout(function () { $.include('/js/compiled/maps.js') }, 1000)
		
		var barId = $('bar-id').innerHTML
		var cityName = $('city-name').innerHTML
		
		window.bar = Bars.getBarByCityId(cityName, barId)
		
		if (bar)
		{
			renderCocktails($('carte'), getCocktailsByNames(bar.cocktails), 3)
			renderCocktails($('recommendations'), getCocktailsByNames(bar.recommended), 1)
		}
		
		// more
		var showMore = cssQuery('.about .show-more')[0]
		var barMore  = cssQuery('.about .more')[0]
		
		barMore.maximaze = function () { this.animate('easeOutQuad', {height: this.scrollHeight}, 1) }
		barMore.minimize = function () { this.animate('easeOutQuad', {height: 1}, 1) }
		barMore.toggleHeight = function ()
		{
			if (this.isMaximazed)
			{
				this.minimize()
				this.isMaximazed = false
			}
			else
			{
				this.maximaze()
				this.isMaximazed = true
			}
		}
		
		function moreClick ()
		{
			barMore.toggleHeight()
		}
		
		showMore.addEventListener('click', moreClick, false)
	}
)

function mapsApiIsLoaded ()
{
	initMap($('map'), window.bar)
}

var AnimatedSizer =
{
	resize: function (node)
	{
		alert(node.scrollHeight)
	}
}

function initMap (node, bar)
{
	var map = new GMap2(node)
	map.addControl(new GSmallMapControl(), new GControlPosition(G_ANCHOR_BOTTOM_RIGHT))
	map.enableContinuousZoom()
	// map.enableScrollWheelZoom()
	
	var ll = new GLatLng(bar.point[0], bar.point[1])
	var zoom = 13
	
	map.setCenter(ll, zoom)
	
	function showPopup () { gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>'+bar.name+'</h2><p>'+bar.address+'</p></div>') }
	var gMarker = new GMarker(ll)
	map.addOverlay(gMarker)
	GEvent.addListener(gMarker, 'click', showPopup)
	showPopup()
}


function getCocktailsByNames (arr)
{
	var set = []
	for (var i = 0; i < arr.length; i++)
		set[i] = cocktails[arr[i]]
	return set
}

function renderCocktails (node, set, len)
{
	var parent = node.getElementsByClassName('surface')[0]
	parent.empty()
	for (var i = 0; i < set.length; i++)
	{
		if (i % len == 0)
		{
			var point = document.createElement('ul')
			point.className = 'point'
			parent.appendChild(point)
		}
		var cocktailNode = _createCocktailElement(set[i])
		point.appendChild(cocktailNode)
	}
	node.RollingImagesLite.sync()
}

function _createCocktailElement (cocktail)
{
	var li = document.createElement("li")
	var a = document.createElement("a")
	a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html"
	var img = document.createElement("img")
	img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png"
	var txt = document.createTextNode(cocktail.name)
	a.appendChild(img)
	a.appendChild(txt)
	li.appendChild(a)
	return li
}
