var Party = function(data){
	for (var k in data)
		this[k] = data[k]
};

Party.prototype = {
	
	constructor: Party,
	
	getImgSrc: function(postfix){
		return "/i/party/" + this.city.trans().htmlName() + "/" + this.bar.trans().htmlName() + "-" + this.name.trans().htmlName() + postfix;
	},
	
	getMiniImgSrc: function(){
		return this.getImgSrc("-mini.png");
	},
	
	getPageHref: function(){
		return "/parties.html#city="+encodeURIComponent(this.city)+"&party="+encodeURIComponent(this.name);
	}
}

Object.extend(Party,
{
	parties: [],
	
	initialize: function (db){
		for(var city in db) {
			for(var i = 0; i < db[city].length; i++){
				this.parties.push(new Party(db[city][i]));
			}
		}
	},
	
	getAllByCity: function (name){
		var res = [];
		for(var i = 0; i < this.parties.length; i++){
			if(this.parties[i].city == name) res.push(this.parties[i]);
		}
		return res;
	},
	
	cityExists: function(cityName){
		for(var i = 0; i < this.parties.length; i++){
			if(this.parties[i].city == cityName) return true;
		}
		return false;
	},
	
	getByCityName: function(city, name){
		if(!this.cityExists(city)) return null;
		else {
			var cityParties = this.getAllByCity(city);
			for(var i = 0; i < cityParties.length; i++){
				if(cityParties[i].name == name) return cityParties[i];
			}
		}
		return null;
	}
});

Party.initialize(<!--# include file="/db/parties.js" -->);