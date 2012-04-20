function CalculatorController(model, view) {
	this.eventListener = model;
	view.eventListener = this;
  
	this.initialize = function(){
		var self = this;
		clientStorage.ready(function(){
			if(clientStorage.get(Calculator.CART)){
				self.eventListener.initialize(JSON.parse(clientStorage.get(Calculator.CART)));
			} else self.eventListener.initialize(null);
		});
	};

  this.setBarName = function(name){
    clientStorage.set('barName', name)
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
	this.saveCartData = function(cartData)
	{
		var cd = Calculator.serializeCartData(cartData)
		clientStorage.set(Calculator.CART, JSON.stringify(cd))
	};
	
	this.needNewBottle = function(name, bottleId){
		return this.eventListener.getNewBottle(name, bottleId);
	};
	
    this.getItemFromCart = function(name){
        return this.eventListener.getItemFromCart(name);
    };

	// для синхронности
	this.initialize();
};
