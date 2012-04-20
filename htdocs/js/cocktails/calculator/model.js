Array.prototype.without = function(index) {
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(i != index) tmp.push(this[i]);
	}
	return tmp;
}

function CalculatorModel(view){
	
	this.cartData = {};
	
	this.dataListeners = {
		listeners: [view],
		modelChanged: function(cartData, dontSave){
			for(var i = 0; i < this.listeners.length; i++){
				this.listeners[i].modelChanged(cartData, dontSave);
			}
		}
	};
	
	this.getCartSum = function(){
		var sum = 0;
		for(var name in this.cartData.goods){
			var bottles = this.cartData.goods[name].bottles;
			for(var id in bottles){
				sum += Math.roundPrecision(bottles[id].vol[1]*bottles[id].count,2);
			}
		}
		return sum;
	};
	
	this.addDataListener = function(listener){
		this.dataListeners.listeners.push(listener);
	};
	
	this.initialize = function(cartData) {
		// десериализация полученного от контроллера набора
		if(cartData) {	
			this.cartData = Calculator.deSerializeCartData(cartData);
		} else {
			this.cartData = {};
			this.cartData.cocktails = [];
			this.cartData.goods = {};
		}
		
		this.dataListeners.modelChanged(this.cartData, true);
	};
	
	this.addCocktail = function(name){
		var cocktail = Cocktail.getByName(name)
		Statistics.cocktailAddedToCalculator(cocktail)
		if(cocktail) {
			var cs = this.cartData.cocktails;
			var found = false;
			for(var i = 0; i < cs.length; i++) if(cs[i][0] == cocktail) found = cs[i];
			var cartCount = (cocktail.cart && cocktail.cart.count) || 10
			if (found) {
				found[1] += cartCount
			} else {
				cs.push([cocktail, cartCount]);
			}
			// Оптимизируем весь набор по емкостям
			this.cartData.goods = this.goodsByCocktails(this.cartData.cocktails);
			this.dataListeners.modelChanged(this.cartData);
		}
	};
	
	this.deleteCocktail = function(cocktail){
		var cs = this.cartData.cocktails;
		for(var i = 0; i < cs.length; i++){
			if(cs[i][0] == cocktail){
				this.cartData.cocktails.splice(i,1);
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = this.goodsByCocktails(this.cartData.cocktails);
				this.dataListeners.modelChanged(this.cartData);
				break;
			}
		}
	};
	
	this.goodQuantityChanged = function(name, bottleId, quantity){
		var bottle = null;
		if(this.cartData.goods[name].bottles[bottleId]){
			bottle = this.cartData.goods[name].bottles[bottleId];
		} else { // дополнительная бутылка
			bottle = this.bottleByIngredientAndVolume(name, bottleId);
			this.cartData.goods[name].bottles[bottleId] = bottle;
		}
		if(quantity == 0 && (Object.keysCount(this.cartData.goods[name].bottles) > 1)) {
			delete this.cartData.goods[name].bottles[bottleId];
		} else bottle.count = quantity;
		this.countDiffs(name);
		this.dataListeners.modelChanged(this.cartData);
	};
	
	/**
	 * Высчитываем недостаточность или избыточность объема напитка, 
	 * отвечающего данному ингредиенту и проставляем значок "больше" или "меньше"
	 * той бутылке, чей объем лучше покрывает разницу
	 * @param name - название ингредиента
	 */
	this.countDiffs = function(name) {
		var bottles = this.cartData.goods[name].bottles;
		var sum_vol = 0;
		var vol_arr = []; // массив всех объемов
		for(id in bottles){
			sum_vol += bottles[id].vol[0] * bottles[id].count;
			vol_arr.push(bottles[id].vol);
			delete bottles[id].diff;
		}
		var diff = sum_vol - this.cartData.goods[name].dose;
		var vol = this.findClosestVol(vol_arr, Math.abs(diff));
		var target = this.cartData.goods[name].bottles[vol[0]];
		if(diff < 0 || Math.abs(diff) >= target.vol[0]) target.diff = diff;
	};
	
	/**
	 * Полностью меняются данные о напитке данного ингредиента
	 * (например, сразу о нескольких бутылках)
	 * @param item - элемент хэша cartData.goods с ключом name
	 * @param name - название ингредиента, так же - ключ в хэше cartData.goods
	 */
	this.goodItemChanged = function(item, name){
		for(id in item.bottles){
			if(item.bottles[id].count == 0 && (Object.keysCount(item.bottles) > 1)){
				delete item.bottles[id];
			}
		}
		this.cartData.goods[name] = item;
		this.countDiffs(name);
		this.dataListeners.modelChanged(this.cartData);
	};
	
	this.getNewBottle = function(name, bottleId){
		return this.bottleByIngredientAndVolume(name, bottleId);
	};

    this.getItemFromCart = function(name){
        return this.cartData.goods[name];
    };
	
	/**
	 * Поменялось количество коктейля в калькуляторе
	 * @param cocktail - коктейль, элемент глобального хэша коктейлей
	 * @param quantity - новое количество
	 */
	this.cocktailQuantityChanged = function(cocktail, quantity){
		var cs = this.cartData.cocktails;
		for(var i = 0; i < cs.length; i++){
			if((cs[i][0] == cocktail) && (cs[i][1] != quantity)) {
				this.cartData.cocktails[i][1] = quantity;
				// Оптимизируем весь набор по емкостям
				this.cartData.goods = this.goodsByCocktails(this.cartData.cocktails);
				this.dataListeners.modelChanged(this.cartData);
				break;
			}
		}
	};
	
	this.isIngredientPresent = function(name){
		return this.cartData.goods[name];
	};
	
	
	this.goodsByCocktails = function (cocktailsAndQuant)
	{
		var res = {}
		
		for (var i = 0, il = cocktailsAndQuant.length; i < il; i++)
		{
			var item = cocktailsAndQuant[i],
				cocktail = item[0],
				quantity = item[1]
			
			var parts = Ingredient.mergeIngredientSets(cocktail.ingredients, cocktail.garnish)
			
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var part = parts[j],
					name = part[0],
					dose = part[1],
					unit = part[2]
				
				var ingredient = Ingredient.getByName(name)
				if (!ingredient)
					continue
				
				var sum = res[name]
				if (sum)
					sum.dose += dose * quantity
				else
				{
					res[name] =
					{
						good: ingredient,
						bottles: null,
						dose: dose * quantity
					}
				}
			}
		}
		
		// calculate bottles
		for (var name in res)
		{
			var item = res[name]
			item.bottles = this.countOptimal(item.dose, item.good.volumes)
		}
		
		return res;
	}
	
	function noop () {  }
	
	this.countOptimal = function(max_vol, volumes){
		var vols = [], costs = [];
		var j = 0;
		for(var i = 0; i < volumes.length; i++) {
			if(volumes[i][2]) {
				vols[j] = volumes[i][0];
				costs[j] = volumes[i][1];
				j++;
			}
		}
		
		var vol_index = 0,
		vols_length = vols.length,
		biggest = vols[0],
		
		// calculating long tail
		tail = max_vol % (biggest * 2),
		big_bottles_count = Math.round((max_vol - tail) / biggest),
		
		stack = [],
		min = Infinity,
		the_one = [],
		answer = {}
		
		function walk (summ_vol, summ_cost, vols_length, vols, costs)
		{
			for (var i = 0; i < vols_length; i++)
			{
				var cost = costs[i],
				vol = vols[i],
				now_cost = summ_cost + cost,
				now_vol = summ_vol + vol
				
				if (now_cost >= min)
					continue
				
				stack[stack.length] = vol
				if (now_vol >= tail)
				{
					min = now_cost
					the_one = stack.slice()
					// console.info(now_vol, now_cost, stack.slice())
				}
				else
					walk(now_vol, now_cost, vols_length, vols, costs)
				stack.length--
			}
		}
		
		if (tail)
			walk(0, 0, vols_length, vols, costs)
		
		for (var i = 0; i < the_one.length; i++)
			if (answer[the_one[i]]){
				answer[the_one[i]].count++;
			} else {
				answer[the_one[i]] = {};
				answer[the_one[i]].count = 1;
			}
		
		if (big_bottles_count)
		{
			if (answer[biggest]) {
				answer[biggest].count += big_bottles_count;
			} else {
				answer[biggest] = {};
				answer[biggest].count = big_bottles_count;
			}
		}
		
		for(var i = 0; i < volumes.length; i++){
			noop() // for FF <= 3.5.2 with jit on
			var volume = volumes[i], val = volume[0]
			if(answer[val])
				answer[val].vol = volume;
		}
		
		return answer
	}
	
	this.bottleByIngredientAndVolume = function(ingred, vol){
		var res = {};
		var volumes = Ingredient.getByName(ingred).volumes;
		for(var i = 0; i < volumes.length; i++){
			if(volumes[i][0] == vol) {
				res.vol = volumes[i];
				break;
			}
		}
		return res;
	}
	
	this.findClosestVol = function(volumes, dose){
		var closest_idx = 0;
		for(var i = 0; i < volumes.length; i++) {
			if((volumes[i][0] > volumes[closest_idx][0]) && volumes[i][2]) closest_idx = i;
		}
		for(var i = 0; i < volumes.length; i++){
			if(volumes[i][2]) { // в наличии
				var gap = volumes[i][0] - dose;
				var closestGap = volumes[closest_idx][0] - dose;
				if((gap >= 0) && (gap < closestGap)) closest_idx = i;
			}
		}
		return volumes[closest_idx];
	}
};
