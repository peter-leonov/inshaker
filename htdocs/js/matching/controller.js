;(function(){

var Papa = MatchingPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function (state)
	{
		this.model.setState(state)
	}
}

Object.extend(Me.prototype, myProto)

})();