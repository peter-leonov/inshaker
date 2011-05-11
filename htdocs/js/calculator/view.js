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

function mergeNodes(parent, nodes)
{
	var focused, children = Array.copy(parent.childNodes)
	for (var i = 0; i < children.length; i++)
	{
		var child = children[i]
		if (child.focused)
			focused = child
		else
			parent.removeChild(child)
	}
	
	var i = 0
	if (focused)
	{
		for (; i < nodes.length; i++)
		{
			var node = nodes[i]
			if (node == focused)
			{
				i++
				break
			}
			parent.insertBefore(node, focused)
		}
	}
	
	for (; i < nodes.length; i++)
	{
		var node = nodes[i]
		if (node == focused)
			break
		parent.appendChild(node)
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
	
	this.KEY_LEFT  = 37;
	this.KEY_RIGHT = 39;
	this.KEY_ENTER = 13;
	this.KEY_ESC   = 27;
	this.KEY_TAB   = 9;
	this.IGNORED_KEYS = [this.KEY_LEFT, this.KEY_RIGHT, this.KEY_ESC, this.KEY_ENTER, this.KEY_TAB];
	
	this.eventListener = null; // controller
	
	this.lastShownIngred = "";
	this.cocktailName = $(this.NAME_ELEM) ? $(this.NAME_ELEM).innerHTML : null;
	this.addBtn = $$(this.CLASS_ADD_BTN) ? $$(this.CLASS_ADD_BTN)[0] : null;

	
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
  
	if($('call_barmen')){
		$('call_barmen').addEventListener('click', function(e){
			// if(!Calculator.checkSum("call_barmen")){
			//  alert("Минимальная сумма заказа составляет "+ Calculator.getMinSum("call_barmen") + ". Добавьте что-нибудь еще ;-)");
			// } else {
        window.location.href="/bars/moskva/inshaker.html";
      // }
		}, false);
	}
	
	/**
	 * Событие, поступающее от модели в случае ее изменения
	 * @param cartData - набор данных калькулятора
	 * @param init - true, если это первый проход по MVC
	 */
	this.modelChanged = function(cartData, init){ // model
		var barName = clientStorage.get('barName')
		this.renderCart(cartData);
		if(!init) this.eventListener.saveCartData(cartData); //save to storage
	};
	
	this.renderCart = function(cartData){
		// FIXME: dirty fix for too early call for renderCart()
		if (!$(this.ID_CONTENTS).style)
			return
		
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
			
			var newIngredients = [], sum = 0, items = []
			for (var name in cartData.goods)
				items.push(cartData.goods[name])
			
			var compareByGroup = Ingredient.compareByGroup
			items.sort(function (a, b) { return compareByGroup(a.good, b.good) })
			for(var i = 0; i < items.length; i++)
			{
				var item = items[i],
					bottles = item.bottles
				
				for (var id in bottles)
				{
					var bottle = bottles[id]
					sum += bottle.vol[1] * bottle.count
					newIngredients.push(this._createIngredientElement(item, bottle, item.good.name))
				}
			}
			sum = Math.roundPrecision(sum,2)
			mergeNodes(ingredsParent, newIngredients);
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
			input.addEventListener('focus', function (e) { li.focused = true }, false)
			input.addEventListener('blur', function (e) { li.focused = false }, false)
		}
		
		if(input.value != quantity)
			input.value = quantity || "";
		var plurals = (cocktail.cart && cocktail.cart.plural) || ['порция', 'порции', 'порций']
		txt.nodeValue = " " + quantity.plural.apply(quantity, plurals);
		
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
			
			// fires goodQuantityChanged
			input.addEventListener('keyup', function(e){
				if(self.checkKey(e.keyCode) && self.validateNumeric(this.value)) {
					var bottleId = bottle.vol[0];
					self.eventListener.goodQuantityChanged(name, bottleId, parseInt(this.value));
				}
			}, false)
			
			function showPopup (e)
			{
				alert(name)
			}
			a.addEventListener('click', showPopup, false)
			button.addEventListener('click', showPopup, false)
			
			input.addEventListener('focus', function (e) { li.focused = true }, false)
			input.addEventListener('blur', function (e) { li.focused = false }, false)
			
			li.childsCache = {input: input, button: button, txt: txt, a: a};
		}
		
		var childsCache = li.childsCache,
			input = childsCache.input,
			button = childsCache.button,
			txt = childsCache.txt,
			a = childsCache.a
		
		{
			
			
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
			
			_createPopupIngredientElementCache[cacheKey] = dl
			
			icon.className = 'icon'
			
			a.innerHTML      = GoodHelper.bottleTxt(name, item.good.unit, volume[0]) + GoodHelper.normalVolumeTxt(volume[0], item.good.unit);
			strong.innerHTML = volume[1] + " р.";
			
			
			dl.appendChild(dt);
			dt.appendChild(icon);
			dt.appendChild(a);
			dl.appendChild(dd);
			dd.appendChild(strong);
		}
		
		return dl;
	};
	
	this.renderPopup = function(item, name){
		Statistics.ingredientPopupOpened(Ingredient.getByName(name))
		
		var good = Good.getBySellName(name)[0]
		
		$('good_name').innerHTML = item.good.brand || name;
		if(item.good.mark){ // branded
			$('good_composition').style.display = "block";
            $('good_mark').href = Ingredient.ingredientsLinkByMark(item.good.mark);
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
		
		if (good)
		{
			$('good_buy').parentNode.show()
			$('good_buy').href = good.getHref()
			$('good_buy').innerHTML = good.name
		}
		else
			$('good_buy').parentNode.hide()
		
		$('good_desc').innerHTML = item.good.about;
		$('good_picture').src = item.good.getMainImageSrc()
		
		var summ = 0;
		var have = 0;
		
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
