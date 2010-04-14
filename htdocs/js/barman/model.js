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
		var Barman = this.sources.barman
		
		var barman = Barman.getByName(name)
		this.barman = barman
		
		var neighbours = Barman.getPrevNext(barman)
		this.view.modelChanged(barman, neighbours)
	}
}

Object.extend(Me.prototype, myProto)

})();
