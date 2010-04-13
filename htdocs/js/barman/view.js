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
	
	modelChanged: function (data) {},
	
	renderBarmanCocktails: function (cocktails)
	{
		var tmp = document.createDocumentFragment()
		
		for (var i = 0, ii = cocktails.length; i < ii; i++)
		{
			var cocktail = cocktails[i]
			var li = Cocktail.getByName(cocktail).getPreviewNode()
			
			tmp.appendChild(li)
		}
		
		this.nodes.ajaxLoadingImage.hide()
		this.nodes.barmanCocktailsList.appendChild(tmp)
	},
	
	renderNextAndPrevBarmensLinks: function (barman)
	{
		this.nodes.nextBarman.href = barman.next().pageHref()
		this.nodes.prevBarman.href = barman.prev().pageHref()
	}
};

Object.extend(Me.prototype, myProto)

})();
