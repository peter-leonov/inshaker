;(function(){

var Papa = GoodPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	},
	
	bind: function (sources)
	{
		this.sources = sources
	},
	
	setState: function (state)
	{
		this.state = state
		this.view.modelChanged(this.sources.good.getAll())
	}
}

Object.extend(Me.prototype, myProto)

})();