;(function(){

var Papa = GoodPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		
	},
	
	bind: function (state)
	{
		this.model.setState(state)
	}
}

Object.extend(Me.prototype, myProto)

})();
