var GoodHelper = {
    CART : 'cart',

    serializeCartData: function(cd) {
        for(var i = 0; i < cd.cocktails.length; i++){
			// cocktail -> name
			cd.cocktails[i][0] = cd.cocktails[i][0].name;
		}
		for(ingred in cd.goods){
			cd.goods[ingred].good = null;
		}
        return cd;
    },

	deSerializeCartData: function (cartData)
	{
		var dataCocktails = cartData.cocktails,
			cocktails = []
		for (var i = 0; i < dataCocktails.length; i++)
		{
			var cocktail = Cocktail.getByName(dataCocktails[i][0])
			if (cocktail)
				cocktails.push([cocktail, dataCocktails[i][1]])
		}
		
		var gds = {}
		for (var name in cartData.goods)
		{
			var good = Ingredient.getByName(name)
			if (good)
			{
				gds[name] = cartData.goods[name]
				gds[name].good = good
			}
		}
		
		return {cocktails: cocktails, goods: gds}
    },

    normalVolumeTxt: function(vol, unit){
        switch(unit){
            case "мл": if(vol >= 1000) { vol /= 1000; unit = "л";  }; break;
            case  "л": if(vol < 1)     { vol *= 1000; unit = "мл"; }; break;
              
            case "г": if(vol >= 1000) { vol /= 1000; unit = "кг"; }; break;
            case "кг": if(vol < 1)     { vol *= 1000; unit = "г"; }; break;
        }

        return vol + " " + unit;
    }
};
