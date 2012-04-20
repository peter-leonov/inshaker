;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (barman, neighbours)
	{
		this.renderBarmanCocktails(barman.cocktails)
		this.renderNextAndPrevBarmenLinks(neighbours)
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
	
	renderNextAndPrevBarmenLinks: function (neighbours)
	{
		this.nodes.prevBarman.href = neighbours.previous.pageHref()
		this.nodes.nextBarman.href = neighbours.next.pageHref()
	}
};

Papa.View = Me

})();
