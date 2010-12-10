;(function(){

var Papa = MyBar, Me = Papa.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	searchQuerySubmit : function()
	{
		this.model.handleSearchQuery()
	}
}

Object.extend(Me.prototype, myProto)

})();
