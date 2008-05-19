function CalculatorView() {
	this.ID_COCKTAILS   = 'cart_cocktails';
	this.ID_INGREDS     = 'cart_ingredients';
	this.ID_SUM         = 'cart_sum';
	this.ID_CONTENTS    = 'cart_contents';
	this.ID_TOTALS      = 'cart_totals';
	this.ID_DROP_TARGET = 'cart_draghere';
	this.CLASS_ADD_BTN  = '.bt-want-slap';
	this.NAME_ELEM      = 'cocktail_name';
	
	this.INGRED_POPUP   = 'shop-cocktail';
	
	this.KEY_LEFT  = 37;
	this.KEY_RIGHT = 39;
	this.KEY_ENTER = 13;
	this.KEY_ESC   = 27;
	this.KEY_TAB   = 9;
	this.IGNORED_KEYS = [this.KEY_LEFT, this.KEY_RIGHT, this.KEY_ESC, this.KEY_ENTER, this.KEY_TAB];
	
	this.eventListener = null; // controller

	this.lastInputId = "";
	this.lastShownIngred = "";
	this.cocktailName = $(this.NAME_ELEM) ? $(this.NAME_ELEM).innerHTML : null;
	this.addBtn = cssQuery(this.CLASS_ADD_BTN) ? cssQuery(this.CLASS_ADD_BTN)[0] : null;
	this.itemFromPopup = [];
	
    if(window.location.href.indexOf(this.INGRED_POPUP) > -1) link.close();
	var self = this;
	if(this.addBtn) this.addBtn.addEventListener('mousedown', function(e){
		self.eventListener.addCocktail(self.cocktailName);
	}, false);
	
	$(this.ID_DROP_TARGET).onDrop = function(cocktailName){
		self.eventListener.addCocktail(cocktailName);
	};
	
	$(this.ID_CONTENTS).onDrop = function(cocktailName){
		self.eventListener.addCocktail(cocktailName);
	};
	
	$('good_cancel').addEventListener('mousedown', function(e){
		link.close();
	}, false);
	
	$('good_accept').addEventListener('mousedown', function(e){
		var item = self.itemFromPopup[0];
		var name = self.itemFromPopup[1];
		self.eventListener.goodItemChanged(item, name);
		link.close();
	}, false);
	
	cssQuery("#shop-cocktail .opacity")[0].addEventListener('click', function(e){
		link.close();
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
		if(cartData.cocktails.length > 0) {
			$(this.ID_CONTENTS).style.display = "block";
			$(this.ID_TOTALS).style.display = "block";
			$(this.ID_DROP_TARGET).style.display = "none";
			
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
				for(id in bottles){
					sum += Math.round(bottles[id].vol[1]*bottles[id].count,2);
					ingredsParent.appendChild(this._createIngredientElement(item, bottles[id], name));
				}
			}
			sumParent.innerHTML = spaces(sum) + " р.";
			
			if(cartData.goods[this.lastShownIngred]) {
				this.renderPopup(cartData.goods[this.lastShownIngred], this.lastShownIngred);
			} 
			
			if(this.lastInputId && $(this.lastInputId)) {
				putFocus($(this.lastInputId));
			}
		} else { // empty
			$(this.ID_CONTENTS).style.display = "none";
			$(this.ID_TOTALS).style.display = "none";
			$(this.ID_DROP_TARGET).style.display = "block";
		}
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
		b.innerHTML = bottle.vol[0] + " " + GoodHelper.pluralTxt(bottle.vol[0], item.good.unit);
		li.appendChild(a);
		li.appendChild(b);
		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "text";
		input.name = "portion";
		input.id = "input_"+name.trans().htmlName() + "_" + bottle.vol[0];
		input.value = bottle.count;
		var txt = document.createTextNode(" " + spaces(Math.round(bottle.vol[1]*bottle.count,2)) + " р.");
		label.appendChild(input);
		label.appendChild(txt);
		li.appendChild(label);
		if(bottle.diff) {
			var button = document.createElement("button");
			button.className = (bottle.diff > 0) ? "bt-more" : "bt-less";
			button.title = "Инфо";
			button.innerHTML = "i";
			button.addEventListener('mousedown', function(e){
				self.renderPopup(item, name);
				link.open(self.INGRED_POPUP);
			}, false);
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
			self.renderPopup(item, name);
			link.open(self.INGRED_POPUP); 
			return false;
		}, false);
		
		return li;
	};
	
	this.setPicture = function(name, good, vol){
		$('good_picture').src = GoodHelper.goodPicSrc(name, good, vol);
	};
	
	this.renderPopup = function(item, name){
		this.itemFromPopup = [cloneObject(item), name];
		
		$('good_needed').style.display = "block";
		$('good_summ').style.display   = "block";
		$('good_accept').style.display = "inline";
		
		$('good_name').innerHTML = item.good.brand || name;
		if(item.good.mark){ // branded
			$('good_composition').style.display = "block";
			$('good_mark').innerHTML = item.good.mark;
			$('good_ingredient').innerHTML = name;
		} else $('good_composition').style.display = "none";
		
		$('good_desc').innerHTML = item.good.desc;
		$('good_picture').src = GoodHelper.goodPicSrc(name, item.good); 
		$('good_needed_vol').innerHTML = Math.round(item.dose, 2) + " " +GoodHelper.pluralTxt(item.dose, item.good.unit);
		
		var volsNode = $('good_volumes'); volsNode.innerHTML = "";
		var summ = 0;
		var have = 0;
		
		for(var i = 0; i < item.good.volumes.length; i++){
			if(item.good.volumes[i][2]) {
				var bottleId = item.good.volumes[i][0];
				
				var dl         = document.createElement("dl");
				var dt         = document.createElement("dt");
				var img        = document.createElement("img");
				var a          = document.createElement("a");
				var dd         = document.createElement("dd");
				var strong     = document.createElement("strong");
				var inputQuant = document.createElement("input");

				
				if(item.bottles[bottleId] && item.bottles[bottleId].count > 0) {
					img.src = "/t/icon/checked.png";
				} else img.src = "/t/border/f.gif"; // blank
				img.alt = "Добавлен";
				img.style.height = "11px";
				img.style.width  = "14px";
				
				a.innerHTML      = GoodHelper.bottleTxt(name, item.good.unit, item.good.volumes[i][0]) + item.good.volumes[i][0] + " " + GoodHelper.pluralTxt(item.good.volumes[i][0], item.good.unit);
				a.addEventListener('mousedown', function(j) { return function(e) {
					self.setPicture(name, item.good, item.good.volumes[j]);
				}}(i), false);
				strong.innerHTML = item.good.volumes[i][1] + " р.";
				
				inputQuant.type  = "text";
				inputQuant.id = "inputQuant_"+name.trans().htmlName() + "_" + item.good.volumes[i][0];
				inputQuant.value = item.bottles[bottleId] ? item.bottles[bottleId].count : 0;
				if(inputQuant.value > 0)   summ += item.good.volumes[i][1] * inputQuant.value;
				if(item.bottles[bottleId]) have += item.good.volumes[i][0] * item.bottles[bottleId].count;
				
				inputQuant.addEventListener('keyup', function(iname, id, fieldId){ return function(e){
					if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
						var cloneItem = cloneObject(item);
						if(cloneItem.bottles[id]) {
							cloneItem.bottles[id].count = this.value;
						} else { // новая бутылка
							var bottle = self.eventListener.needNewBottle(iname, id);
							bottle.count = this.value;
							cloneItem.bottles[id] = bottle;
						}
						self.renderPopup(cloneItem, name);
						putFocus($(fieldId));
					}
				}}(name, bottleId, inputQuant.id), false);
            	
				dl.appendChild(dt);
				dt.appendChild(img);
				dt.appendChild(a);
				dl.appendChild(dd);
				dd.appendChild(strong);
				dd.appendChild(inputQuant);
				dd.appendChild(document.createTextNode(" шт."));
				volsNode.appendChild(dl);
			}
		}
		$('good_summ').innerHTML = "<i>" + spaces(summ) + " р.</i>"
		$('good_needed_have').innerHTML = Math.round(have, 2) + " " + item.good.unit;
		$('good_needed').remClassName(item.dose  > have ? "more" : "less");
		$('good_needed').addClassName(item.dose <= have ? "more" : "less");
		this.lastShownIngred = name;
	};
	
	this.checkKey = function(keyCode){
		if(this.IGNORED_KEYS.indexOf(keyCode) > -1) return false;
		return true;
	};
	
	this.validateNumeric = function(txt){
		if(txt.match(/^\d+$/)) return true;
		return false;
	};
};
