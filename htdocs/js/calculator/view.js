function CalculatorView() {
	this.ID_COCKTAILS  = 'cart_cocktails';
	this.ID_INGREDS    = 'cart_ingredients';
	this.ID_SUM        = 'cart_sum';
	this.CLASS_ADD_BTN = '.bt-want-slap';
	this.NAME_ELEM     = 'cocktail_name';
	
	this.PATH_VOLUMES = '/i/merchandise/volumes/';
	
	this.KEY_LEFT  = 37;
	this.KEY_RIGHT = 39;
	this.KEY_ENTER = 13;
	this.KEY_ESC   = 27;
	this.KEY_TAB   = 9;
	this.IGNORED_KEYS = [this.KEY_LEFT, this.KEY_RIGHT, this.KEY_ESC, this.KEY_ENTER, this.KEY_TAB];
	
	this.eventListener = null; // controller
	this.lastInputId = "";
	this.cocktailName = $(this.NAME_ELEM) ? $(this.NAME_ELEM).innerHTML : null;
	this.addBtn = cssQuery(this.CLASS_ADD_BTN) ? cssQuery(this.CLASS_ADD_BTN)[0] : null;
	
	var self = this;
	if(this.addBtn) this.addBtn.addEventListener('mousedown', function(e){
		self.eventListener.addCocktail(self.cocktailName);
	}, false);
	
	/**
	 * Событие, поступающее от модели в случае ее изменения
	 * @param cartData - набор данных калькулятора
	 * @param dontSave - true, если не нужно сохранять состояние (напр., при первичной загрузке)
	 */
	this.modelChanged = function(cartData, dontSave){ // model
		this.renderCart(cartData);
		if(!dontSave) this.eventListener.saveCartData(cartData); //save to cookies
	};
	
	this.renderCart = function(cartData){
		var cocktailsParent = $(this.ID_COCKTAILS);
		var ingredsParent = $(this.ID_INGREDS);
		var sumParent = $(this.ID_SUM);
		
		// Clean up
		cocktailsParent.innerHTML = "";
		ingredsParent.innerHTML = "";
		
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
		if(this.lastInputId && $(this.lastInputId)) $(this.lastInputId).focus();
	};
	
	this._createCocktailElement = function(cocktailsItem){
		var self = this;
		var cocktail = cocktailsItem[0];
		var quantity = cocktailsItem[1];
		
		var li = document.createElement("li");
		var a  = document.createElement("a");
		a.href = "/cocktails/"+cocktail.name_eng.htmlName()+".html";
		a.innerHTML = cocktail.name;
		li.appendChild(a);
		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "text";
		input.name = "portion";
		input.id = "input_" + cocktail.name_eng.htmlName();
		input.value = quantity || "";
		var txt = document.createTextNode(" " + quantity.plural("порцию", "порции", "порций"));
		label.appendChild(input);
		label.appendChild(txt);
		li.appendChild(label);
		var button = document.createElement("button");
		button.className = "bt-del";
		button.title = "Удалить";
		button.innerHTML = "x";
		li.appendChild(button);
		
		button.addEventListener('mousedown', function(e){
			self.eventListener.deleteCocktail(cocktail);
		}, false);
		
		input.addEventListener('keyup', function(e){
			if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
				self.lastInputId = this.id;
				self.eventListener.cocktailQuantityChanged(cocktail, parseInt(this.value));
			}
		}, false);
		return li;
	};
	
	this._createIngredientElement = function(item, bottle, name){
		var li = document.createElement("li");
		var a  = document.createElement("a");		
		a.innerHTML = item.good.brand || name;
		var b  = document.createElement("b");
		b.innerHTML = bottle.vol[0] + " " + this._tryPlural(bottle.vol[0], item.good.unit);
		li.appendChild(a);
		li.appendChild(b);
		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "text";
		input.name = "portion";
		input.id = "input_"+name.trans().htmlName();
		input.value = bottle.count;
		var txt = document.createTextNode(" " + (bottle.vol[1]*bottle.count) + " р.");
		label.appendChild(input);
		label.appendChild(txt);
		li.appendChild(label);
		if(bottle.diff) {
			var button = document.createElement("button");
			button.className = (bottle.diff > 0) ? "bt-more" : "bt-less";
			button.title = "Инфо";
			button.innerHTML = "i";
			li.appendChild(button);
		}
		
		input.addEventListener('keyup', function(e){
			if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
				self.lastInputId = this.id;
				var bottleId = bottle.vol[0];
				self.eventListener.goodQuantityChanged(name, bottleId, parseInt(this.value));
			}
		}, false);
		
		a.addEventListener('mousedown', function(e){
			self.preparePopup(item, name);
			link.open("shop-cocktail"); 
			return false;
		}, false);
		
		return li;
	};
	
	this.preparePopup = function(item, name){
		$('good_name').innerHTML = item.good.brand;
		$('good_brand').innerHTML = item.good.brand;
		$('good_ingredient').innerHTML = name;
		$('good_picture').src = this._getGoodPicSrc(item.good); 
		$('good_needed_vol').innerHTML = item.dose + " " +item.good.unit;
		
		var volsNode = $('good_volumes'); volsNode.innerHTML = "";
		var summ = 0;
		for(var i = 0; i < item.good.volumes.length; i++){
			var bottleId = item.good.volumes[i][0];
			
			var dl         = document.createElement("dl");
			var dt         = document.createElement("dt");
			var input      = document.createElement("input");
			var a          = document.createElement("a");
			var dd         = document.createElement("dd");
			var strong     = document.createElement("strong");
			var inputQuant = document.createElement("input");

			input.type = "checkbox";
			if(item.bottles[bottleId])   input.checked = true;
			if(!item.good.volumes[i][2]) input.disabled = "disabled";
			
			a.innerHTML      = item.good.volumes[i][0] + " " + item.good.unit;
			strong.innerHTML = item.good.volumes[i][1] + " р.";
			
			inputQuant.type  = "text";
			inputQuant.value = item.bottles[bottleId] ? item.bottles[bottleId].count : 0;
			if(inputQuant.value > 0) summ += inputQuant.value * item.good.volumes[i][1];

			dl.appendChild(dt);
			dt.appendChild(input);
			dt.appendChild(a);
			dl.appendChild(dd);
			dd.appendChild(strong);
			dd.appendChild(inputQuant);
			dd.appendChild(document.createTextNode(" шт."));
			volsNode.appendChild(dl);
		}
		$('good_summ').innerHTML = "Итого: " + summ + " р."
	};
	
	this.checkKey = function(keyCode){
		if(this.IGNORED_KEYS.indexOf(keyCode) > -1) return false;
		return true;
	};
	
	this.validateNumeric = function(txt){
		if(txt.match(/^\d+$/)) return true;
		return false;
	};
	
	this._tryPlural = function(vol, unit){
		if(unit == "кубики") return vol.plural("кубик", "кубика", "кубиков");
		return unit;
	};
	
	this._getGoodPicSrc = function(good){
		return this.PATH_VOLUMES + good.brand.trans() + "_" + good.volumes[0][0].toString().replace(".", "_") + "_big.png";
	}
};