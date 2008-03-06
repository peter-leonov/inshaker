var Model = {
	cocktail: null,
	recs: [], // recommendations
	
	init: function(name){
		this.cocktail = cocktails[name];
		
		var ingreds = this.cocktail.ingredients; 
		
		for(var i = 0; i < ingreds.length; i++){
			var rec = goods[ingreds[i][0]];
			if(rec && rec[0].name != ""){
				var obj = {};
				if(ingreds[i][0] == rec[0].name) obj["text"] = rec[0].name;
				else obj["text"] = ingreds[i][0] + " " + rec[0].name;
				
				obj["image"] = rec[0].name.htmlName() + ".png";
				this.recs.push(obj);
			}
		}
	}
}