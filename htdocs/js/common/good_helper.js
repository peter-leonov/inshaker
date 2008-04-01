/**
 * Общие функции для компонентов, работающих с товарами (уровень view)
 */
var GoodHelper = {
	PATH_VOLUMES : '/i/merchandise/volumes/',
	
	/**
	 * Возвращает числительное для данного объема
	 * @param vol - значение объема
	 * @param unit - единица измерения
	 */
	pluralTxt: function(vol, unit){
		if(unit == "кубики") return vol.plural("кубик", "кубика", "кубиков");
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
};