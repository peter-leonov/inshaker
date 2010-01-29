;(function(){

var Papa = MatchingPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
		this.data = {}
	},
	
	bind: function (sources)
	{
		this.sources = sources
		this.data.allIngredients = this.sources.ingredient.getAll()
	},
	
	toggleIngredient: function (ingredient)
	{
		var selected = this.state.selected,
			name = ingredient.name
		if (selected[name])
			delete selected[name]
		else
			selected[name] = ingredient
		
		this.sendState()
	},
	
	setState: function (state)
	{
		this.state = state
		this.sendState()
	},
	
	sendState: function ()
	{
		var data = {selected: this.state.selected}
		this.view.modelChanged(data)
	},
	
	init: function ()
	{
		this.view.renderIngredientsField(this.data.allIngredients)
	}
}

Object.extend(Me.prototype, myProto)

})();