;(function(){

var Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function ()
	{
		
	},
	
	setState: function (state)
	{
		this.state = state
	}
}

Object.extend(Me.prototype, myProto)

})();
