;(function(){

function Me ()
{
	this.state = {}
}

Me.prototype =
{
	setState: function (state)
	{
		this.state = state
		
		this.view.renderVideos(Video.getAll())
	}
}

Papa.Model = Me

})();
