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
				this.cartData.cocktails.push([cocktails[name], 1]);
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
		var diff = quantity - this.optimalGoods[name].bottles[bottleId].count;
		this.cartData.goods[name].bottles[bottleId].count = quantity;
		this.cartData.goods[name].bottles[bottleId].diff = diff; // количество было изменено
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