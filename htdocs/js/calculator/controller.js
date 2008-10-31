function CalculatorController(model, view) {
	this.eventListener = model;
	view.eventListener = this;
  
	this.initialize = function(){
		var self = this;
		Storage.init(function(){
			//if(!checkDbRevision()) Storage.clear(); // util.js
			if(Storage.get(GoodHelper.CART)){
				self.eventListener.initialize(Object.parse(Storage.get(GoodHelper.CART)));
			} else self.eventListener.initialize(null);
		});
	};

  this.setBarName = function(name){
    Storage.put('barName', name)
  };
	
	this.addCocktail = function(name){
		this.eventListener.addCocktail(name);
	};
	
	this.deleteCocktail = function(cocktail){
		this.eventListener.deleteCocktail(cocktail);
	};
	
	this.cocktailQuantityChanged = function(cocktail, quantity){
		this.eventListener.cocktailQuantityChanged(cocktail, quantity);
	};
	
	this.goodQuantityChanged = function(name, bottleId, quantity){
		this.eventListener.goodQuantityChanged(name, bottleId, quantity);
	};
	
	this.goodItemChanged = function(item, name){
		this.eventListener.goodItemChanged(item, name);
	};
	
	/**
	 * Сериализация набора данных калькулятора и сохранение
	 */
	this.saveCartData = function(cartData){
		var cd = cloneObject(cartData);
	    cd = GoodHelper.serializeCartData(cd);	
		Storage.put(GoodHelper.CART, Object.stringify(cd));
	};
	
	this.needNewBottle = function(name, bottleId){
		return this.eventListener.getNewBottle(name, bottleId);
	};
	
	// для синхронности
	this.initialize();
};
