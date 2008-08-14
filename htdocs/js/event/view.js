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
		this.renderOtherSponsorNode(event.others['Организаторы'])
	},
	
	renderOtherSponsorNode: function (logosSet)
	{
		var node = this.createOtherSponsorNode(logosSet)
		
		this.nodes.destination.appendChild(node)
		new Programica.RollingImagesLite(node, {animationType: 'easeOutQuad'})
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
	}
}

})()}