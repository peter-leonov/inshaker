;(function(){

var Papa = MyBar, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
	},
	
	renderCocktails : function(cocktails)
	{
		if(cocktails.length == 0) { this.renderIfCocktailsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = cocktails.length; i < l; i++)
			ul.appendChild(cocktails[i].getPreviewNode(false, true))

		with(this.nodes.cocktailsList) { empty(); appendChild(ul) }
	},
	
	renderIfCocktailsEmpty : function(label)
	{
		with(this.nodes.cocktailsList) { empty(); appendChild(Nct('div', 'empty', label)) }
	}
}

Object.extend(Me.prototype, myProto)

})();