;(function(){

function noop () {  }

Array.prototype.without = function(index) {
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(i != index) tmp.push(this[i]);
	}
	return tmp;
}


self.DataFilter = {
	good_paths: [],
	
	/**
	 * Подбор товаров и их емкостей под коктейли
	 * @param goods - хэш товаров
	 * @param cocktailsAndQuant - массив вида [[<cocktail1>, <quantity1>], [<cocktail2>, <quantity2>]]
	 * @return хэш (ключ - ингредиент), включающий для каждого эл-та товар, дозировку, бутылки
	 */
	goodsByCocktails: function (goods, cocktailsAndQuant)
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
				
				var ingredient = goods[name]
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
	},
	
	countOptimal: function(max_vol, volumes){
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
	},
	
	bottleByIngredientAndVolume: function(goods, ingred, vol){
		var res = {};
		var volumes = goods[ingred].volumes;
		for(var i = 0; i < volumes.length; i++){
			if(volumes[i][0] == vol) {
				res.vol = volumes[i];
				break;
			}
		}
		return res;
	},
	
	/**
	 * Нахождение подходящей емкости по заданному объему
	 * @param volumes массив объемов вида [<емкость>, <цена>, <наличие>]
	 * @param dose объем, под который ищем емкость
	 * @return volume элемент массива объемов
	 */
	findClosestVol: function(volumes, dose){
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
}

})();