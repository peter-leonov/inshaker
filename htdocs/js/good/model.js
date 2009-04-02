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
	
	selectGoodByName: function (name)
	{
		var Good = this.sources.good
		
		this.view.renderPreviews(Good.getAll())
		this.view.selectGood(Good.getByName(name))
	}
}

Object.extend(Me.prototype, myProto)

})();