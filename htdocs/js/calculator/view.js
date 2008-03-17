function CalculatorView() {
	this.ID_COCKTAILS  = 'cart_cocktails';
	this.ID_INGREDS    = 'cart_ingredients';
	this.ID_SUM        = 'cart_sum';
	
	this.eventListener = null; // controller
	
	/**
	 * Приведение cartData в удобный вид и отображение в калькуляторе
	 */
	this.modelChanged = function(cartData){ // model
		this.renderCart(cartData);
	};
	
	this.renderCart = function(cartData){
		var cocktailsParent = $(this.ID_COCKTAILS);
		var ingredsParent = $(this.ID_INGREDS);
		var sumParent = $(this.ID_SUM);
		
		for(var i = 0; i < cartData.cocktails.length; i++){
			cocktailsParent.appendChild(this._createCocktailElement(cartData.cocktails[i]));
		}
		
		var sum = 0;
		for(name in cartData.goods){
			var item = cartData.goods[name];
			var bottles = cartData.goods[name].bottles;
			for(bottle in bottles){
				sum += bottles[bottle].vol[1]*bottles[bottle].count;
				ingredsParent.appendChild(this._createIngredientElement(item, bottles[bottle], name));
			}
		}
		sumParent.innerHTML = sum + " р.";
	};
	
	this._createCocktailElement = function(cocktailsItem){
		var cocktail = cocktailsItem[0];
		var quantity = cocktailsItem[1];
		
		var li = document.createElement("li");
		var a  = document.createElement("a");
		a.innerHTML = cocktail.name;
		li.appendChild(a);
		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "text";
		input.name = "portion";
		input.value = quantity || "";
		var txt = document.createTextNode(" порции");
		label.appendChild(input);
		label.appendChild(txt);
		li.appendChild(label);
		var button = document.createElement("button");
		button.className = "bt-del";
		button.title = "Удалить";
		button.innerHTML = "x";
		li.appendChild(button);
		return li;
	};
	
	this._createIngredientElement = function(item, bottle, name){
		var li = document.createElement("li");
		var a  = document.createElement("a");
		a.href = "#shop-cocktail";
		a.onclick = "link.open(this); return false";
		a.innerHTML = item.good.brand || name;
		var b  = document.createElement("b");
		b.innerHTML = bottle.vol[0] + " " + item.good.unit;
		li.appendChild(a);
		li.appendChild(b);
		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "text";
		input.name = "portion";
		input.value = bottle.count || "";
		var txt = document.createTextNode(" " + (bottle.vol[1]*bottle.count) + " р.");
		label.appendChild(input);
		label.appendChild(txt);
		li.appendChild(label);
		var button = document.createElement("button");
		button.className = "bt-info";
		button.title = "Инфо";
		button.innerHTML = "i";
		li.appendChild(button);
		return li;
	}
	
};