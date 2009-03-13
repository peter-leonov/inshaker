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
	this.popupStatusListener = null; // external
	
	this.lastShownIngred = "";
	this.cocktailName = $(this.NAME_ELEM) ? $(this.NAME_ELEM).innerHTML : null;
	this.addBtn = cssQuery(this.CLASS_ADD_BTN) ? cssQuery(this.CLASS_ADD_BTN)[0] : null;
	this.itemFromPopup = [];

	
    if(window.location.href.indexOf(this.INGRED_POPUP) > -1) link.close();
	var self = this;
	if(this.addBtn) this.addBtn.addEventListener('mousedown', function(e){
		self.eventListener.addCocktail(self.cocktailName);
	}, false);
	
	var dropTargetHeight = 70;
	var dragAnimation;
	$(this.ID_DROP_TARGET).style.height = dropTargetHeight + "px";
	
	$(this.ID_DROP_TARGET).onDrop = function(cocktailName){
		this.style.height = dropTargetHeight + "px";
		self.eventListener.addCocktail(cocktailName);
	};
	
	$(this.ID_DROP_TARGET).onDragEnd = function(){
		dragAnimation.stop();
		this.style.height = dropTargetHeight + "px";
	};
	
	$(this.ID_DROP_TARGET).onDragStart = function(element){
		var gap = 50;
		if(this.offsetHeight < element.offsetHeight+gap && this.style.display != "none") {
			dragAnimation = this.animate("easeInCubic", {height: element.offsetHeight+gap}, 0.15);
		}
	};
	
	$(this.ID_CONTENTS).onDrop = function(cocktailName){
		self.eventListener.addCocktail(cocktailName);
	};
	
	if($('order_link')) {
		$('order_link').addEventListener('mousedown', function(e){
			var name = Controller.getCocktailName(); // FIXME: this anti-pattern sucks
			if(name) self.eventListener.addCocktail(name);
			link.close();
		}, false);
	}
	
	if($('order_button')){
		$('order_button').addEventListener('click', function(e){
			if(!Calculator.checkSum("order")){
				alert("Минимальная сумма заказа составляет "+ Calculator.getMinSum("order") + ". Добавьте что-нибудь еще ;-)");
			} else window.location.href="/order.html";
		}, false);
	}
 
  this.initBarChanger = function(barName) {
    var editing = false
    var nodes  = { bill: $('b-bill'), 
                   name: cssQuery("#b-bill .b-title h1")[0], 
                   edit: cssQuery("#b-bill .b-title label")[0], 
                   tip:  cssQuery("#b-bill .b-title small")[0],
                   input:cssQuery("#b-bill .b-title input")[0] } 

    var styles = { editing: 'editing-bar-name', unnamed: 'unnamed' }

    if(nodes.name && nodes.edit) {
        nodes.name.addEventListener('click', function(e) {
          this.hide()
          nodes.bill.addClassName(styles.editing)
          nodes.edit.show()
          editing = true
          e.stopPropagation()
          retainFocus()
        }, false)
        
        function retainFocus(){ setTimeout(function(){
          nodes.input.focus()
          nodes.input.value = nodes.input.value
        }, 2) }

        nodes.input.addEventListener('keyup', function(e) {
          if(e.keyCode == self.KEY_ENTER) finishEditing()
        }, false)
  
        document.body.addEventListener('click', function(e){
          if(editing && e.target != nodes.input) finishEditing()
        }, false)

        function finishEditing(){
          nodes.edit.hide()
          nodes.bill.remClassName(styles.editing)
          nodes.name.remClassName(styles.unnamed)
          nodes.name.innerHTML = nodes.input.value || nodes.tip.innerHTML
          nodes.name.show()
          editing = false
          self.eventListener.setBarName(nodes.name.innerHTML)
        }

        function checkEmptiness(){ setTimeout(function(){ 
          nodes.tip.setVisible(!nodes.input.value.length)
        }, 1) }

        nodes.input.addEventListener('keypress', checkEmptiness, false)
        nodes.input.addEventListener('keydown', checkEmptiness, false)
        
        if(barName) {
            nodes.name.innerHTML = barName
            nodes.input.value    = barName
            nodes.tip.hide()
        } else {
            nodes.name.innerHTML = "Назови свой бар"
            nodes.name.addClassName(styles.unnamed)
        }
    }
  }
  	
	if($('call_barmen')){
		$('call_barmen').addEventListener('click', function(e){
			// if(!Calculator.checkSum("call_barmen")){
			//  alert("Минимальная сумма заказа составляет "+ Calculator.getMinSum("call_barmen") + ". Добавьте что-нибудь еще ;-)");
			// } else {
        window.location.href="/bars/moskva/inshaker.html";
      // }
		}, false);
	}
	
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
	
	$(this.INGRED_POPUP).show = function(){
		this.style.display = "block";
		if(self.popupStatusListener) self.popupStatusListener.popupShown();
	};
	
	$(this.INGRED_POPUP).hide = function(){
		this.style.display = "none";
		if(self.popupStatusListener) self.popupStatusListener.popupHidden();
	};
	
	/**
	 * Событие, поступающее от модели в случае ее изменения
	 * @param cartData - набор данных калькулятора
	 * @param init - true, если это первый проход по MVC
	 */
	this.modelChanged = function(cartData, init){ // model
		var barName = Storage.get('barName')
        this.renderCart(cartData);
		if(!init) this.eventListener.saveCartData(cartData); //save to storage
        else this.initBarChanger(barName)
	};
	
	this.renderCart = function(cartData){
		if(cartData.cocktails.length > 0) {
			$(this.ID_CONTENTS).style.display = "block";
			$(this.ID_TOTALS).style.display = "block";
			$(this.ID_DROP_TARGET).style.display = "none";
			
			var cocktailsParent = $(this.ID_COCKTAILS);
			var ingredsParent = $(this.ID_INGREDS);
			var sumParent = $(this.ID_SUM);
			
			var newCocktails = []
			for(var i = 0; i < cartData.cocktails.length; i++){
				var ingredElem = this._createCocktailElement(cartData.cocktails[i]);
				newCocktails.push(ingredElem)
			}
			// from util.js
			mergeNodes(cocktailsParent, newCocktails)
			
			var newIngredients = []
			var sum = 0;
		    
			var inames = []; for(var name in cartData.goods) inames.push(name); inames.sort(Ingredient.sortByGroups)
            for(var i = 0; i < inames.length; i++){
				var name = inames[i];
                var item = cartData.goods[name];
				var bottles = cartData.goods[name].bottles;
				for(var id in bottles){
					sum += Math.round(bottles[id].vol[1]*bottles[id].count,2);
					var ingredElem = this._createIngredientElement(item, bottles[id], name);
					newIngredients.push(ingredElem);
				}
			}
			// from util.js
			mergeIngredientsNodes(ingredsParent, newIngredients);
			sumParent.innerHTML = spaces(sum) + " р.";
			
			if(cartData.goods[this.lastShownIngred]) {
				this.renderPopup(cartData.goods[this.lastShownIngred], this.lastShownIngred);
			} 
		} else { // empty
			$(this.ID_CONTENTS).style.display = "none";
			$(this.ID_TOTALS).style.display = "none";
			$(this.ID_DROP_TARGET).style.display = "block";
		}
	};
	
	var _createCocktailElementCache = {};
	this._createCocktailElement = function(cocktailsItem){
		var cocktail = cocktailsItem[0];
		var quantity = cocktailsItem[1];
		
		var cacheKey = cocktail.name_eng;
		
		
		var li, input, txt;
		if (_createCocktailElementCache[cacheKey])
		{
			li = _createCocktailElementCache[cacheKey];
			input = li.childsCache.input;
			txt = li.childsCache.txt;
		}
		else
		{
			var self = this;
			
			li = _createCocktailElementCache[cacheKey] = document.createElement("li");
			
			var a = document.createElement("a");
			a.href = "/cocktails/"+cocktail.name_eng.htmlName()+".html";
			a.innerHTML = cocktail.name;
			li.appendChild(a);
			var label = document.createElement("label");
			input = document.createElement("input");
			input.type = "text";
			input.name = "portion";
			input.id = "input_" + cocktail.name_eng.htmlName();
			txt = document.createTextNode("");
			label.appendChild(input);
			label.appendChild(txt);
			li.appendChild(label);
			var button = document.createElement("button");
			button.className = "bt-del";
			button.title = "Удалить";
			button.innerHTML = "x";
			li.appendChild(button);
			
			li.childsCache = {input: input, txt: txt};
			
			button.addEventListener('mousedown', function(e){
				self.eventListener.deleteCocktail(cocktail);
			}, false);
			
			input.addEventListener('keyup', function(e){
				if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
					self.eventListener.cocktailQuantityChanged(cocktail, parseInt(this.value));
				}
			}, false);
		}
		
		if(input.value != quantity)
			input.value = quantity || "";
		txt.nodeValue = " " + quantity.plural("порция", "порции", "порций");
		
		return li;
	};
	
	var _createIngredientElementCache = {};
	this._createIngredientElement = function(item, bottle, name){
		var cacheKey = name + ':' + bottle.vol[0];
		var li;
		if(_createIngredientElementCache[cacheKey])
			li = _createIngredientElementCache[cacheKey];
		else
		{
			li = _createIngredientElementCache[cacheKey] = document.createElement("li");
			var a  = document.createElement("a");
			a.innerHTML = item.good.brand || name;
			li.appendChild(a);
			
			var b = document.createElement("b");
			b.innerHTML = bottle.vol[0] + " " + GoodHelper.pluralTxt(bottle.vol[0], item.good.unit);
			li.appendChild(b);
			
			var label = document.createElement("label");
			var input = document.createElement("input");
			input.type = "text";
			input.name = "portion";
            var txt = document.createTextNode("");
			label.appendChild(input);
			label.appendChild(txt);
			li.appendChild(label);
			
			var iNameInput = document.createElement("input");
			iNameInput.type = "hidden";
            iNameInput.name = "ingredName";
            iNameInput.value = name;
            label.appendChild(iNameInput);

            var button = document.createElement("button");
			button.title = "Инфо";
			button.hide();
			button.innerHTML = "i";
			li.appendChild(button);
			
			li.childsCache = {input: input, button: button, txt: txt, a: a};
		}
		
		with (li.childsCache)
		{
			// fires goodQuantityChanged
			input.onkeyup = function(e){
				if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
					var bottleId = bottle.vol[0];
					self.eventListener.goodQuantityChanged(name, bottleId, parseInt(this.value));
				}
			}
			
			a.onmousedown = function(e){
				self.renderPopup(item, name);
				link.open(self.INGRED_POPUP); 
				return false;
			}
			
			button.onmousedown =  function(e){
				self.renderPopup(item, name);
				link.open(self.INGRED_POPUP);
			}
			
			
			if (bottle.count != input.value)
				input.value = bottle.count;
			txt.nodeValue = " " + spaces(Math.round(bottle.vol[1]*bottle.count,2)) + " р."
			
			// red/green balloon
			if(bottle.diff){
				button.show()
				button.className = (bottle.diff > 0) ? "bt-more" : "bt-less";
			}
			else button.hide();
		}
		
		return li;
	};
	
	var _createPopupIngredientElementCache = {};
	this._createPopupIngredientElement = function(item, bottle, volume, name, bottleId){
		var cacheKey = name + ':' + volume;
		
		var dl;
		if (_createPopupIngredientElementCache[cacheKey])
			dl = _createPopupIngredientElementCache[cacheKey]
		else
		{
				dl         = document.createElement("dl");
			var dt         = document.createElement("dt");
			var img        = document.createElement("img");
			var a          = document.createElement("a");
			var dd         = document.createElement("dd");
			var strong     = document.createElement("strong");
			var inputQuant = document.createElement("input");
			
			_createPopupIngredientElementCache[cacheKey] = dl
			dl.childsCache = {img: img, inputQuant: inputQuant, a: a};
			
			img.alt = "Добавлен";
			img.style.height = "11px";
			img.style.width  = "14px";
			
			a.innerHTML      = GoodHelper.bottleTxt(name, item.good.unit, volume[0]) + volume[0] + " " + GoodHelper.pluralTxt(volume[0], item.good.unit);
			strong.innerHTML = volume[1] + " р.";
			
			inputQuant.type  = "text";
			// inputQuant.id = "inputQuant_"+name.trans().htmlName() + "_" + volume[0];
			
			dl.appendChild(dt);
			dt.appendChild(img);
			dt.appendChild(a);
			dl.appendChild(dd);
			dd.appendChild(strong);
			dd.appendChild(inputQuant);
			dd.appendChild(document.createTextNode(" шт."));
		}
		
		with (dl.childsCache)
		{
			a.onmousedown = function(e) {
				self.setPicture(name, item.good, volume);
			}
			
			inputQuant.onkeyup = function(e){
				if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
					if(item.bottles[bottleId]) {
						item.bottles[bottleId].count = this.value;
					} else { // новая бутылка
						var bottle = self.eventListener.needNewBottle(name, bottleId);
						bottle.count = this.value;
						log('new bottle')
						item.bottles[bottleId] = bottle;
					}
					self.renderPopup(item, name);
				}
			}
			
			img.src = bottle && bottle.count > 0 ? "/t/icon/checked.png" : "/t/border/f.png";
			var newValue = bottle ? bottle.count : 0;
			if (!inputQuant.value || newValue != inputQuant.value)
				inputQuant.value = newValue;
		}
		
		return dl;
	};
	
	this.setPicture = function(name, good, vol){
		$('good_picture').src = GoodHelper.goodPicSrc(name, good, vol);
	};
	
	this.renderPopup = function(item, name){
		this.itemFromPopup = [cloneObject(item), name];
		item = cloneObject(item);
		
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
		
		var volsNode = $('good_volumes');
		// volsNode.innerHTML = "";
		var summ = 0;
		var have = 0;
		
		var newIngredients = [];
		for(var i = 0; i < item.good.volumes.length; i++){
			if(item.good.volumes[i][2]) {
				var bottleId = item.good.volumes[i][0];
				var bottle = item.bottles[bottleId]
				var volume = item.good.volumes[i]
				var ingredElem = this._createPopupIngredientElement(item, bottle, volume, name, bottleId)
				newIngredients.push(ingredElem)
				
				var val = (bottle ? bottle.count : 0)
				if(val > 0) summ += volume[1] * val;
				
				if(bottle) have += volume[0] * bottle.count;
			}
		}
		mergeNodes(volsNode, newIngredients);
		
		$('good_summ').innerHTML = "<i>" + spaces(summ) + " р.</i>"
		$('good_needed_have').innerHTML = Math.round(have, 2) + " " + item.good.unit;
		$('good_needed').remClassName(item.dose  > have ? "more" : "less");
		$('good_needed').addClassName(item.dose <= have ? "more" : "less");
		this.lastShownIngred = name;
		
		$('order_note').hide();
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
