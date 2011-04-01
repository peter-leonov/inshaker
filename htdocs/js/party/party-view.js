;(function(){

function Me ()
{
	this.nodes = {}
	this.cache = {cocktailCounts: [], cocktailUnits: []}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.bindEvents()
		
		return this
	},
	
	bindEvents: function ()
	{
		var nodes = this.nodes
		
		function getNumberValue (v)
		{
			// to string
			v = '' + v
			// clean up all non-digital chars
			v = v.replace(/[^0-9\-]+/g, '')
			// convert to number base 10
			v = parseInt(v, 10)
			// convert NaN to 0
			v = isNaN(v) ? 0 : v
			
			return v
		}
		
		function keypress (e)
		{
			// setTimeout(function () { getNumberValue(nodes.count.value) }, 1)
		}
		
		function blur (e)
		{
			var target = e.target
			target.value = getNumberValue(target.value)
		}
		
		
		nodes.peopleCount.addEventListener('keypress', keypress, false)
		nodes.peopleCount.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		document.addEventListener('blur', blur, true)
	},
	
	renderCocktails: function (source)
	{
		var root = this.nodes.cocktails,
			cache = this.cache,
			counts = cache.cocktailCounts, units = cache.cocktailUnits
		
		for (var i = 0, il = source.length; i < il; i++)
		{
			var s = source[i]
			
			var item = Nc('li', 'portion')
			
			var cocktail = s.cocktail.getLinkNodeBig()
			item.appendChild(cocktail)
			
			var control = Nc('div', 'control')
			item.appendChild(control)
			
			var count = Nc('input', 'count')
			control.appendChild(count)
			counts[i] = count
			
			var unit = Nct('span', 'unit', ' ')
			control.appendChild(unit)
			units[i] = unit.firstChild
			
			root.appendChild(item)
		}
	},
	
	updateCocktails: function (data)
	{
		var cache = this.cache,
			counts = cache.cocktailCounts, units = cache.cocktailUnits
		
		for (var i = 0, il = counts.length; i < il; i++)
		{
			var v = data[i]
			counts[i].value = v
			units[i].nodeValue = v.plural('порция', 'порции', 'порций')
		}
	},
	
	updatePeopleCount: function (count)
	{
		this.nodes.peopleCount.value = count
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();
