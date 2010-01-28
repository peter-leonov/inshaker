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
	
	setState: function (state)
	{
		this.state = state
		
		this.view.modelChanged({ingredients: this.data.allIngredients, selected: []})
	}
}

Object.extend(Me.prototype, myProto)

})();