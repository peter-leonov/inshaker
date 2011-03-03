;(function(){

function Me ()
{
	
}

Me.prototype =
{
	partyNameGuessed: function (name)
	{
		this.model.setPartyName(name)
	}
}

Papa.Controller = Me

})();
