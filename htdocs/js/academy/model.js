;(function(){

var Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	setState: function (state)
	{
		this.state = state
		
		this.view.renderVideos(Video.getAll())
	}
}

Object.extend(Me.prototype, myProto)

})();
