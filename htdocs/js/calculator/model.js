function CalculatorModel(view){
	this.dataListener = view;
	this.cartData = {};
	
	this.optimalGoods = {};
	
	this.initialize = function(cartData) {
		// десериализация полученного от контроллера набора
		if(cartData) {
			for(var i = 0; i < cartData.cocktails.length; i++){
				 // name -> cocktail
				var name = cartData.cocktails[i][0];
				cartData.cocktails[i][0] = cocktails[name];
			}
			for(ingred in cartData.goods) cartData.goods[ingred].good = goods[ingred][0];
			this.cartData = cartData;
		} else {
			this.cartData = {};
			this.cartData.cocktails = [];
			this.cartData.goods = {};
		}
		this.optimalGoods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
		this.dataListener.modelChanged(this.cartData, true);
	};
	
	this.addCocktail = function(name){
		if(cocktails[name]) {
			var cs = this.cartData.cocktails;
			var found = false;
			for(var i = 0; i < cs.length; i++) if(cs[i][0] == cocktails[name]) found = true;
			if(!found){
				this.cartData.cocktails.push([cocktails[name], 10]); // сразу 10
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
				this.optimalGoods = cloneObject(this.cartData.goods);
				this.dataListener.modelChanged(this.cartData);
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
				this.dataListener.modelChanged(this.cartData);
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
		if(quantity == 0) {
			delete this.cartData.goods[name].bottles[bottleId];
		} else bottle.count = quantity;
		
		var bottles = this.cartData.goods[name].bottles;
		var sum_vol = 0;
		var vol_arr = []; // массив всех объемов
		for(id in bottles){
			sum_vol += bottles[id].vol[0] * bottles[id].count;
			vol_arr.push(bottles[id].vol);
			delete bottles[id].diff;
		}
		var diff = sum_vol - this.cartData.goods[name].dose;
		// кому бы поставить значок "больше" или меньше?
		// тому, чей объем наиболее близок к diff
		var vol = DataFilter.findClosestVol(vol_arr, Math.abs(diff));
		var target = this.cartData.goods[name].bottles[vol[0]];
		// в случае небольшого перебора (до 1 целой емкости) знак ставить не надо
		if(diff < 0 || Math.abs(diff) >= target.vol[0]) target.diff = diff; 

		this.dataListener.modelChanged(this.cartData);
	};
	
	this.cocktailQuantityChanged = function(cocktail, quantity){
		var cs = this.cartData.cocktails;
		for(var i = 0; i < cs.length; i++){
			if((cs[i][0] == cocktail) && (cs[i][1] != quantity)) {
				this.cartData.cocktails[i][1] = quantity;
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
				this.optimalGoods = cloneObject(this.cartData.goods);
				this.dataListener.modelChanged(this.cartData);
				break;
			}
		}
	}
};