/**
 * Общие функции для компонентов, работающих с товарами (уровень view)
 */

Number.prototype.toFloatString = function(){
	if(this.toString() != parseInt(this)) return this.toString();
	return this + ".0";
}

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

    ingredientLink: function(ingred){
        return "/cocktails.html#state=byIngredients&ingredients=" + ingred;                
    },
     
	isBottled: function(good){
        if((good.volumes.length == 1) &&
            (good.unit == "шт") && (good.volumes[0][0] == 1)) return false;
        return true;
    },

    /**
	 * Возвращает числительное для данного объема
	 * @param vol - значение объема
	 * @param unit - единица измерения
	 */
	pluralTxt: function(vol, unit){
		if(unit == "кубики") return vol.plural("кубик", "кубика", "кубиков");
        if(unit == "штуки") return vol.plural("штука", "штуки", "штук");
        if(unit == "порция") return vol.plural("порция", "порции", "порций");
		return unit;
	},
	
    normalVolumeTxt: function(vol, unit){
        switch(unit){
            case "мл": if(vol >= 1000) { vol /= 1000; unit = "л";  }; break;
            case  "л": if(vol < 1)     { vol *= 1000; unit = "мл"; }; break;
              
            case "гр": if(vol >= 1000) { vol /= 1000; unit = "кг"; }; break;
            case "кг": if(vol < 1)     { vol *= 1000; unit = "гр"; }; break;
        }

        return vol + " " + unit;
    },

    normalVolumeTxtParsed: function(txt){
		var arr  = txt.match(/^(.+)\ (.+)/);
        return this.normalVolumeTxt(arr[1], arr[2]);
    },

	/**
	 * Возвращает предполагаемое название емкости
	 * для заданного ингредиента
	 * @param ingred - название ингредиента
	 * @param unit - единица измерения ингредиента
	 * @param {Number} vol - объем емкости
	 */
	bottleTxt: function(ingred, unit, vol){
		if(ingred == "Ред Булл") return "Банка ";
		if(ingred == "Кола") {
			if([0.33, 0.15].indexOf(vol) > -1) return "Банка ";
			return "Бутылка ";
		}
		if(unit == "л")     return "Бутылка ";
		if(ingred == "Лед") return "Пакетик ";
		return "";
	},
	
	/**
	 * Возвращает адрес картинки для товара по заданному
	 * названию ингредиента, объекту товара и элементу массива объемов товара
	 * @param name - название ингредиента
	 * @param good - объект товара
	 * @param vol - элемент массива объемов товара
	 */
	goodPicSrc: function(name, good, vol){
		if(!vol) { 
			var i = 0;
			while(!good.volumes[i][2]) i++;
			vol = good.volumes[i];
		}
		return good.getVolumeImage(vol)
	},
	
	getIngredText: function(name){
		var brand = Ingredient.getByName(name).brand || "";
		if(brand.indexOf(name) > -1) name = "";
		var gap = "";
		if(brand && name) gap = " ";
		return name + (brand ? gap + brand : "");
	},
	
	shortName: function(name){
		if(name == "Черносмородиновый ликер") return "Черносмородин. ликер";
		return name;
	}
};
