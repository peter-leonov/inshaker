$.onload
(
	function ()
	{
		// alert(133)
		
		new Programica.RollingImagesLite(cssQuery('.b-content .photos')[0], {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite($('recommendations'))
		new Programica.RollingImagesLite($('carte'), {animationType: 'easeInOutCubic'})
		
		
		
		var barId = $('bar-id').innerHTML
		var cityName = $('city-name').innerHTML
		
		var bar = Bars.getBarByCityId(cityName, barId)
		
		if (bar)
		{
			initMap($('map'), bar)
			
			
			var cocktailsSet = []
			for (var i = 0; i < bar.cocktails.length; i++)
			{
				cocktailsSet[i] = cocktails[bar.cocktails[i]]
			}
			
			var carteNode = $('carte')
			renderCocktails(carteNode.getElementsByClassName('surface')[0], cocktailsSet)
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

function renderCocktails (parent, set)
{
	parent.empty()
	for (var i = 0; i < set.length; i++)
	{
		var cocktailNode = _createCocktailElement(set[i])
		parent.appendChild(cocktailNode)
	}
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
