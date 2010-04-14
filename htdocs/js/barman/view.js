;(function(){

var Papa = BarmensPage
var Me = Papa.View

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (barman)
	{
		this.renderBarmanCocktails(barman.cocktails)
		this.renderNextAndPrevBarmensLinks(barman)
	},
	
	findBarmanName: function ()
	{
		var name = this.nodes.barmanName.getAttribute('data-barman-name')
		this.controller.barmanNameFound(name)
	},
	
	renderBarmanCocktails: function (cocktails)
	{
		cocktails = cocktails.slice()
		cocktails.sort(function (a, b) { return a.name.localeCompare(b.name) })
		
		var tmp = document.createDocumentFragment()
		
		for (var i = 0, ii = cocktails.length; i < ii; i++)
		{
			var cocktail = cocktails[i]
			var li = cocktail.getPreviewNode()
			
			tmp.appendChild(li)
		}
		
		var cocktailList = this.nodes.cocktailList
		cocktailList.empty()
		cocktailList.appendChild(tmp)
	},
	
	renderNextAndPrevBarmensLinks: function (barman)
	{
		this.nodes.nextBarman.href = barman.next().pageHref()
		this.nodes.prevBarman.href = barman.prev().pageHref()
	}
};

Object.extend(Me.prototype, myProto)

})();
