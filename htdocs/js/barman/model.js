;(function(){

var Papa = BarmensPage
var Me = Papa.Model

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
	
	setBarmanByName: function (name)
	{
		var barman = this.sources.barman.getByName(name)
		
		this.barman = barman
		this.view.modelChanged(barman)
	}
}

Object.extend(Me.prototype, myProto)

})();
