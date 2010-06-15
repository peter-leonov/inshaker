;(function(){

var Papa = CombinatorPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var inco = this.inco = new IngredientedCocktailList()
		inco.bind({main: nodes.output})
		
		
		return this
	},
	
	renderCocktails: function (cocktails)
	{
		this.inco.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
