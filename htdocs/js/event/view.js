{(function(){

var doc = document
var N = function (name) { return doc.createElement(name) }
var T = function (text) { return doc.createTextNode(text) }

EventPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		
		// cssQuery('.programica-rolling-images').forEach(function (v) { new Programica.RollingImagesLite(v, {animationType: 'easeOutQuad'}) })
	},
	
	start: function ()
	{
		var name = this.nodes.name.innerHTML
		this.owner.controller.setEventName(name)
	},
	
	modelChanged: function (event)
	{
		this.renderOtherSponsors(event.others)
		this.renderRating(event.rating)
	},
	
	renderOtherSponsors: function (sponsorsSet)
	{
		var root = this.nodes.sponsorsOthersContent
		root.empty()
		
		var main = N('dl')
		root.appendChild(main)
		
		var tabs = []
		var buttons = []
		
		for (var i = 0; i < sponsorsSet.length; i++)
		{
			var part = sponsorsSet[i]
			var dt = N('dt')
			var a = N('a')
			a.appendChild(T(part.name.replace(/\s+/g, ' ')))
			dt.appendChild(a)
			
			var dd = N('dd')
			
			var node = this.createOtherSponsorNode(part.logos)
			dd.appendChild(node)
			
			main.appendChild(dt)
			main.appendChild(T(' '))
			main.appendChild(dd)
			main.appendChild(T(' '))
			
			buttons.push(dt)
			tabs.push(dd)
			
			new Programica.RollingImagesLite(node, {animationType: 'easeOutQuad'})
			dd.hide = function () { this.style.visibility = 'hidden' }
			dd.show = function () { this.style.visibility = 'visible' }
		}
		
		var spacer = N('dt')
		spacer.className = 'spacer'
		spacer.appendChild(T(' '))
		main.appendChild(spacer)
		
		Switcher.bind(main, buttons, tabs)
		main.select(0)
	},
	
	createOtherSponsorNode: function (logosSet)
	{
		var main = N('div')
		main.className = 'programica-rolling-images'
		
		var prev = N('a')
		prev.className = 'prev'
		var next = N('a')
		next.className = 'next'
		
		var viewport = N('div')
		viewport.className = 'viewport'
		
		var surface = N('ul')
		surface.className = 'surface'
		viewport.appendChild(surface)
		
		for (var i = 0; i < logosSet.length; i++)
		{
			var logo = logosSet[i]
			
			if (i % 5 == 0)
			{
				var point = N('li')
				point.className = 'point'
			}
			
			var a = N('a')
			a.href = logo.href
			point.appendChild(a)
			point.appendChild(T(' '))
			
			var img = N('img')
			a.appendChild(img)
			img.src = '/i/event/logo-' + logo.src + '.png'
			
			
			if (i % 5 == 4)
				point.appendChild(N('b')).appendChild(T(' '))
			
			surface.appendChild(point)
		}
		
		main.appendChild(prev)
		main.appendChild(next)
		main.appendChild(viewport)
		
		return main
	},
	
	renderRating: function (rating)
	{
		var main = this.nodes.rating
		
		var sorted = Object.keys(rating).sort(function (a, b) { return rating[b] - rating[a] })
		
		var max = rating[sorted[0]]
		var min = rating[sorted[sorted.length-1]]
		
		var padding = String(max).length * 7.5
		var k = max && min ? ((175 - padding) / (max - min + 1)  * 100) / 100 : 1
		log((max - min), k, padding)
		
		for (var i = 0; i < sorted.length; i++)
		{
			var name = sorted[i]
			var count = rating[name]
			
			var dt = N('dt')
			dt.appendChild(T(name))
			
			var dd = N('dd')
			var width = String(Math.floor((count - min + 1) * k) + padding)
			dd.animate('easeInOutQuad', {width: [padding, width]}, 1)
			dd.appendChild(T(count))
			
			main.appendChild(dt)
			main.appendChild(dd)
		}
	}
}


})()}