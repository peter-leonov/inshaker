;(function(){

var Papa = AllBarmensPage
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
	
	loadBarmen: function ()
	{
		var barmen = this.sources.barman.getAll()
		this.barmen = barmen
		this.view.modelChanged(barmen)
	}
}

Object.extend(Me.prototype, myProto)

})();