DB.Parties =
{
	db: null, // muszt be defined somewhere by calling initialize()
	
	initialize: function (db){
		this.db = db;
	},
	
	getByCity: function (name){
		return this.db[name];
	},
	
	cityExists: function(cityName){
		return this.db[cityName] ? true:false;
	},
	
	partyByCityAndName: function(city, name){
		if(!this.cityExists(city)) return null;
		else {
			var cityParties = this.db[city];
			for(var i = 0; i < cityParties.length; i++){
				if(cityParties[i].name == name) return cityParties[i];
			}
		}
		return null;
	}
}