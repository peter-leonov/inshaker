/**
 * Общие функции для компонентов, работающих с товарами (уровень view)
 */
var GoodHelper = {
	PATH_VOLUMES : '/i/merchandise/volumes/',
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

    deSerializeCartData: function(cartData){
    	for(var i = 0; i < cartData.cocktails.length; i++){
				 // name -> cocktail
				var name = cartData.cocktails[i][0];
				cartData.cocktails[i][0] = cocktails[name];
			}
		for(ingred in cartData.goods) cartData.goods[ingred].good = goods[ingred][0];
        return cartData;
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
	
	/**
	 * Возвращает предполагаемое название емкости
	 * для заданного ингредиента
	 * @param ingred - название ингредиента
	 * @param unit - единица измерения ингредиента
	 */
	bottleTxt: function(ingred, unit){
		if(ingred == "Ред Булл") return "Банка ";
		if(unit == "л")          return "Бутылка ";
		else if(ingred == "Лед") return "Пакетик ";
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
		return this.PATH_VOLUMES + (good.brand ? good.brand.trans() : name.trans()) + "_" + vol[0].toFloatString().replace(".", "_") + "_big.png";
	},
	
	shortName: function(name){
		if(name == "Черносмородиновый ликер") return "Черносмородин. ликер";
		return name;
	}
};
