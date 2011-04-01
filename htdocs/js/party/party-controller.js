;(function(){

function Me ()
{
	
}

Me.prototype =
{
	partyNameGuessed: function (name)
	{
		this.model.setPartyName(name)
	},
	
	peopleCountChanged: function (v)
	{
		this.model.setPeaopleCount(v)
	}
}

Papa.Controller = Me

})();
