function spaces(num){
	var letters = (num + "").split("");
	var res = letters.splice(0, letters.length % 3).concat([" "]);
	while(letters.length > 0) {
		res = res.concat(letters.splice(0, 3));
		if(letters.length > 0) res = res.concat([" "]);
	}
	return res.join("");
}

function validateNumeric(txt){
	if(txt.match(/^\d+$/)) return true;
	return false;
};

/**
 * This function merges nodes from parentNode with nodes given in nodesArray.
 * It deletes nodes those aren't in nodesArray, appends noes those are'n in parentNode
 * and doesn't touch nodes those are in both parentNode and nodesArray
 * @param parentNode - destination node for merging result
 * @param nodesArray - new state of parentNode that could be made
 */

function mergeNodes(parentNode, nodesArray)
{
	for (var i = 0; i < nodesArray.length; i++) {
        if (nodesArray[i].parentNode != parentNode)
			parentNode.appendChild(nodesArray[i]);
    }
	
    var childs = Array.copy(parentNode.childNodes);
    for (var i = 0, il = childs.length; i < il; i++)
    {
        var node = childs[i]
        if (node && nodesArray.indexOf(node) < 0) {
            parentNode.removeChild(node)
        }
    }
}

function mergeIngredientsNodes(parentNode, nodesArray)
{
    var presentIngreds = cssQuery("li", parentNode).map(function(e){ return [e, Ingredient.getByName(e.getElementsByTagName("input")[1].value)]})
    
    for (var i = 0; i < nodesArray.length; i++)
		if (nodesArray[i].parentNode != parentNode)
		    insertChild(presentIngreds, parentNode, nodesArray[i]);
	
	var childs = Array.copy(parentNode.childNodes);
	for (var i = 0, il = childs.length; i < il; i++)
	{
		var node = childs[i]
		if (node && nodesArray.indexOf(node) < 0)
			parentNode.removeChild(node)
	}
}

function insertChild(presentIngreds, parentNode, node)
{
    var insertedIngredient = Ingredient.getByName(node.getElementsByTagName("input")[1].value)
    var closestGap = Infinity
    var closestNode = null
    var sGap = null // signed

    for(var i = 0; i < presentIngreds.length; i++)
    {
        sGap = presentIngreds[i][1].listOrder() - insertedIngredient.listOrder()
        var gap = Math.abs(sGap)
        if(gap < closestGap)
        {
            closestGap = gap
            closestNode = presentIngreds[i][0] 
        }
    }
    if(sGap < 0) parentNode.insertBefore(node, closestNode)
    else if(closestNode) insertAfter(node, closestNode)
    else parentNode.appendChild(node)
}

function insertAfter(new_node, existing_node) 
{
    if (existing_node.nextSibling) 
        existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling)
    else existing_node.parentNode.appendChild(new_node)
}



function CalculatorView() {
	this.ID_COCKTAILS   = 'cart_cocktails';
	this.ID_INGREDS     = 'cart_ingredients';
	this.ID_SUM         = 'cart_sum';
	this.ID_CONTENTS    = 'cart_contents';
	this.ID_TOTALS      = 'cart_totals';
	this.ID_DROP_TARGET = 'cart_draghere';
	this.ID_PRINT_PLAN  = 'print_plan';
	this.ID_PRINT_PLAN_INACTIVE  = 'print_plan_inactive';
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

	
	var self = this;
	if(this.addBtn) this.addBtn.addEventListener('mousedown', function(e){
		self.eventListener.addCocktail(self.cocktailName);
	}, false);
	
	var dropTarget = $(this.ID_DROP_TARGET);
	var dragAnimation;
	
	$(this.ID_DROP_TARGET).onDrop = function(cocktailName){
		self.eventListener.addCocktail(cocktailName);
		return true;
	};
	
	$(this.ID_DROP_TARGET).onDragEnd = function(){
		dragAnimation.stop();
		this.style.height = ''
	};
	
	$(this.ID_DROP_TARGET).onDragStart = function(element){
		var h = element.offsetHeight + 50
		if (h < 100)
			h = 100
		dragAnimation = this.animate("easeInCubic", {height: [dropTarget.offsetHeight, h]}, 0.15);
	};
	
	$(this.ID_CONTENTS).onDrop = function(cocktailName){
		self.eventListener.addCocktail(cocktailName);
	};
	
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
		$(self.INGRED_POPUP).hide();
	}, false);
	
	$('good_accept').addEventListener('mousedown', function(e){
		var item = self.itemFromPopup[0];
		var name = self.itemFromPopup[1];
		self.eventListener.goodItemChanged(item, name);
		$(self.INGRED_POPUP).hide();
	}, false);
	
	cssQuery("#shop-cocktail .opacity")[0].addEventListener('click', function(e){
		$(self.INGRED_POPUP).hide();
	}, false);

    document.documentElement.addEventListener('keyup', function(e){
        if(e.keyCode == self.KEY_ESC) $(self.INGRED_POPUP).hide();
    }, false);
	
	$(this.INGRED_POPUP).show = function(){
		this.style.display = "block";
		if(self.popupStatusListener) self.popupStatusListener.popupShown();
	};
	
	$(this.INGRED_POPUP).hide = function(){
		this.style.display = "none";
		if(self.popupStatusListener) self.popupStatusListener.popupHidden();
	};

    this.showPopup = function(ingred){
        $(this.INGRED_POPUP).show();
        this.renderPopup(this.eventListener.getItemFromCart(ingred), ingred);
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
			$(this.ID_PRINT_PLAN).style.display = "inline";
			$(this.ID_PRINT_PLAN_INACTIVE).style.display = "none";
			$(this.ID_DROP_TARGET).style.display = "none";
			
			var cocktailsParent = $(this.ID_COCKTAILS);
			var ingredsParent = $(this.ID_INGREDS);
			var sumParent = $(this.ID_SUM);
			
			var newCocktails = []
			for(var i = 0; i < cartData.cocktails.length; i++){
				var ingredElem = this._createCocktailElement(cartData.cocktails[i]);
				newCocktails.push(ingredElem)
			}
			mergeNodes(cocktailsParent, newCocktails)
			
			var newIngredients = []
			var sum = 0;
			var inames = []; for(var name in cartData.goods) inames.push(name); //inames.sort(Ingredient.sortByGroups)
            for(var i = 0; i < inames.length; i++){
				var name = inames[i];
                var item = cartData.goods[name];
				var bottles = cartData.goods[name].bottles;
				for(var id in bottles){
					sum += bottles[id].vol[1] * bottles[id].count;
					var ingredElem = this._createIngredientElement(item, bottles[id], name);
					newIngredients.push(ingredElem);
				}
			}
			sum = Math.roundPrecision(sum,2)
			mergeIngredientsNodes(ingredsParent, newIngredients);
			sumParent.innerHTML = spaces(sum) + " р.";
			
			if(cartData.goods[this.lastShownIngred]) {
				this.renderPopup(cartData.goods[this.lastShownIngred], this.lastShownIngred);
			} 
		} else { // empty
			$(this.ID_CONTENTS).style.display = "none";
			$(this.ID_TOTALS).style.display = "none";
			$(this.ID_PRINT_PLAN).style.display = "none";
			$(this.ID_PRINT_PLAN_INACTIVE).style.display = "inline";
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
			button.innerHTML = "×";
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
			b.innerHTML = GoodHelper.normalVolumeTxt(bottle.vol[0], item.good.unit);
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
			input.addEventListener('keyup', function(e){
				if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
					var bottleId = bottle.vol[0];
					self.eventListener.goodQuantityChanged(name, bottleId, parseInt(this.value));
				}
			}, false);
			
			a.onmousedown = function(e){
				self.renderPopup(item, name);
				$(self.INGRED_POPUP).show(); 
				return false;
			}
			
			button.onmousedown =  function(e){
				self.renderPopup(item, name);
				$(self.INGRED_POPUP).show();
			}
			
			
			if (bottle.count != input.value)
				input.value = bottle.count;
			txt.nodeValue = " " + spaces(Math.roundPrecision(bottle.vol[1]*bottle.count,2)) + " р."
			
			// red/green balloon
			if(bottle.diff){
				button.show()
				if (bottle.diff > 0) {
					button.className = "bt-more";
					button.title = "много";
				} else {
					button.className = "bt-less";
					button.title = "мало";
				}
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
			var icon       = document.createElement("i");
			var a          = document.createElement("a");
			var dd         = document.createElement("dd");
			var strong     = document.createElement("strong");
			var inputQuant = document.createElement("input");
			
			_createPopupIngredientElementCache[cacheKey] = dl
			dl.childsCache = {icon: icon, inputQuant: inputQuant, a: a};
			
			icon.className = 'icon'
			
			a.innerHTML      = GoodHelper.bottleTxt(name, item.good.unit, volume[0]) + GoodHelper.normalVolumeTxt(volume[0], item.good.unit);
			strong.innerHTML = volume[1] + " р.";
			
			inputQuant.type  = "text";
			// inputQuant.id = "inputQuant_"+name.trans().htmlName() + "_" + volume[0];
			
			dl.appendChild(dt);
			dt.appendChild(icon);
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
			
			inputQuant.addEventListener('keyup', function(e){
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
			}, false);
			
			bottle && bottle.count > 0 ? dl.remClassName('empty') : dl.addClassName('empty');
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
            $('good_mark').href = Good.ingredientsLinkByMark(item.good.mark);
			$('good_mark').innerHTML = item.good.mark;
            var clicker = function(e) {
                window.location.href = this.href;
                window.location.reload();
            }
            $('good_mark').addEventListener('click', clicker, false);
			$('good_ingredient').innerHTML = name;
			$('good_ingredient').href = GoodHelper.ingredientLink(name);
            $('good_ingredient').addEventListener('click', clicker, false);
		} else $('good_composition').style.display = "none";
		
		$('good_desc').innerHTML = item.good.desc;
		$('good_picture').src = GoodHelper.goodPicSrc(name, item.good); 
		$('good_needed_vol').innerHTML = GoodHelper.normalVolumeTxt(Math.roundPrecision(item.dose, 2), item.good.unit);
		
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
		$('good_needed_have').innerHTML = GoodHelper.normalVolumeTxt(Math.roundPrecision(have, 2), item.good.unit);
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
