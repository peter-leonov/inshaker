;(function(){

var Papa = MyBar, Me = Papa.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	cocktailQuerySubmit : function(query)
	{
		this.model.handleCocktailQuery(query)
	},
	
	ingrQuerySubmit : function(query)
	{
		this.model.handleIngrQuery(query)
	}
}

Object.extend(Me.prototype, myProto)

})();
