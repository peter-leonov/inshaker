;(function(){

var Papa = CombinatorPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	},
	
	bind: function (ds)
	{
		this.ds = ds
	},
	
	setState: function (state)
	{
		this.state = state
	}
}

Object.extend(Me.prototype, myProto)

})();