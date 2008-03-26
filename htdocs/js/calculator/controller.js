function CalculatorController(model, view) {
	this.CART_COOKIE = 'cart',
	
	this.eventListener = model;
	view.eventListener = this;
	
	this.initialize = function(){
		if(Cookie.get(this.CART_COOKIE)){
			this.eventListener.initialize(JSON.parse(Cookie.get(this.CART_COOKIE)));
		} else this.eventListener.initialize(null);
	};
	
	this.addCocktail = function(name){
		this.eventListener.addCocktail(name);
	}
	
	this.deleteCocktail = function(cocktail){
		this.eventListener.deleteCocktail(cocktail);
	};
	
	this.cocktailQuantityChanged = function(cocktail, quantity){
		this.eventListener.cocktailQuantityChanged(cocktail, quantity);
	};
	
	this.goodQuantityChanged = function(name, bottleId, quantity){
		this.eventListener.goodQuantityChanged(name, bottleId, quantity);
	}
	
	this.goodItemChanged = function(item, name){
		this.eventListener.goodItemChanged(item, name);
	}
	
	/**
	 * Сериализация набора данных калькулятора и сохранение его в cookie
	 */
	this.saveCartData = function(cartData){
		var cd = cloneObject(cartData);
		for(var i = 0; i < cd.cocktails.length; i++){
			// cocktail -> name
			cd.cocktails[i][0] = cd.cocktails[i][0].name;
		}
		for(ingred in cd.goods){
			cd.goods[ingred].good = null;
		}
		Cookie.set(this.CART_COOKIE, JSON.stringify(cd));
	}
	
	// для синхронности
	this.initialize();
};