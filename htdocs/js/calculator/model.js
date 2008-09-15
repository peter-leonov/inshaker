function CalculatorModel(view){
	this.cartData = {};
	
	this.optimalGoods = {};
	
	this.dataListeners = {
		listeners: [view],
		modelChanged: function(cartData, dontSave){
			for(var i = 0; i < this.listeners.length; i++){
				this.listeners[i].modelChanged(cartData, dontSave);
			}
		}
	};
	
	this.getCartSum = function(){
		var sum = 0;
		for(var name in this.cartData.goods){
			var bottles = this.cartData.goods[name].bottles;
			for(var id in bottles){
				sum += Math.round(bottles[id].vol[1]*bottles[id].count,2);
			}
		}
		return sum;
	};
	
	this.addDataListener = function(listener){
		this.dataListeners.listeners.push(listener);
	};
	
	this.initialize = function(cartData) {
		// десериализация полученного от контроллера набора
		if(cartData) {	
			this.cartData = GoodHelper.deSerializeCartData(cartData);
		} else {
			this.cartData = {};
			this.cartData.cocktails = [];
			this.cartData.goods = {};
		}		
		this.optimalGoods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
		this.dataListeners.modelChanged(this.cartData, true);
	};
	
	this.addCocktail = function(name){
		if(Cocktail.getByName(name)) {
			var cs = this.cartData.cocktails;
			var found = false;
			for(var i = 0; i < cs.length; i++) if(cs[i][0] == Cocktail.getByName(name)) found = true;
			if(!found){
				this.cartData.cocktails.push([Cocktail.getByName(name), 10]); // сразу 10
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
				this.optimalGoods = cloneObject(this.cartData.goods);
				this.dataListeners.modelChanged(this.cartData);
			}
		}
	};
	
	this.deleteCocktail = function(cocktail){
		var cs = this.cartData.cocktails;
		for(var i = 0; i < cs.length; i++){
			if(cs[i][0] == cocktail){
				this.cartData.cocktails.splice(i,1);
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
				this.optimalGoods = cloneObject(this.cartData.goods);
				this.dataListeners.modelChanged(this.cartData);
				break;
			}
		}
	};
	
	this.goodQuantityChanged = function(name, bottleId, quantity){
		var bottle = null;
		if(this.cartData.goods[name].bottles[bottleId]){
			bottle = this.cartData.goods[name].bottles[bottleId];
		} else { // дополнительная бутылка
			bottle = DataFilter.bottleByIngredientAndVolume(goods, name, bottleId);
			this.cartData.goods[name].bottles[bottleId] = bottle;
		}
		if(quantity == 0 && (lengthOf(this.cartData.goods[name].bottles) > 1)) {
			delete this.cartData.goods[name].bottles[bottleId];
		} else bottle.count = quantity;
		this.countDiffs(name);
		this.dataListeners.modelChanged(this.cartData);
	};
	
	/**
	 * Высчитываем недостаточность или избыточность объема напитка, 
	 * отвечающего данному ингредиенту и проставляем значок "больше" или "меньше"
	 * той бутылке, чей объем лучше покрывает разницу
	 * @param name - название ингредиента
	 */
	this.countDiffs = function(name) {
		var bottles = this.cartData.goods[name].bottles;
		var sum_vol = 0;
		var vol_arr = []; // массив всех объемов
		for(id in bottles){
			sum_vol += bottles[id].vol[0] * bottles[id].count;
			vol_arr.push(bottles[id].vol);
			delete bottles[id].diff;
		}
		var diff = sum_vol - this.cartData.goods[name].dose;
		var vol = DataFilter.findClosestVol(vol_arr, Math.abs(diff));
		var target = this.cartData.goods[name].bottles[vol[0]];
		if(diff < 0 || Math.abs(diff) >= target.vol[0]) target.diff = diff;
	};
	
	/**
	 * Полностью меняются данные о напитке данного ингредиента
	 * (например, сразу о нескольких бутылках)
	 * @param item - элемент хэша cartData.goods с ключом name
	 * @param name - название ингредиента, так же - ключ в хэше cartData.goods
	 */
	this.goodItemChanged = function(item, name){
		for(id in item.bottles){
			if(item.bottles[id].count == 0 && (lengthOf(item.bottles) > 1)){
				delete item.bottles[id];
			}
		}
		this.cartData.goods[name] = item;
		this.countDiffs(name);
		this.dataListeners.modelChanged(this.cartData);
	};
	
	this.getNewBottle = function(name, bottleId){
		return DataFilter.bottleByIngredientAndVolume(goods, name, bottleId);
	};
	
	/**
	 * Поменялось количество коктейля в калькуляторе
	 * @param cocktail - коктейль, элемент глобального хэша коктейлей
	 * @param quantity - новое количество
	 */
	this.cocktailQuantityChanged = function(cocktail, quantity){
		var cs = this.cartData.cocktails;
		for(var i = 0; i < cs.length; i++){
			if((cs[i][0] == cocktail) && (cs[i][1] != quantity)) {
				this.cartData.cocktails[i][1] = quantity;
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
				this.optimalGoods = cloneObject(this.cartData.goods);
				this.dataListeners.modelChanged(this.cartData);
				break;
			}
		}
	};
	
	this.isIngredientPresent = function(name){
		return this.cartData.goods[name];
	};
};
