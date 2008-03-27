var DataFilter = {
	good_paths: [],
	
	/**
	 * Подбор товаров и их емкостей под коктейли
	 * @param goods - хэш товаров
	 * @param cocktailsAndQuant - массив вида [[<cocktail1>, <quantity1>], [<cocktail2>, <quantity2>]]
	 * @return хэш (ключ - ингредиент), включающий для каждого эл-та товар, дозировку, бутылки
	 */
	goodsByCocktails: function(goods, cocktailsAndQuant){
		var res = {};
		for(var i = 0; i < cocktailsAndQuant.length; i++){
			var cocktail = cocktailsAndQuant[i][0];
			var quantity = cocktailsAndQuant[i][1];
			for(var j = 0; j < cocktail.ingredients.length; j++){
				
				var ingred = cocktail.ingredients[j][0];
				
				if(goods[ingred]) {
					var dose = this._parseDose(goods[ingred][0].unit, cocktail.ingredients[j][1]);
					if(!res[ingred]) {
						res[ingred] = {};
						res[ingred].good = goods[ingred][0];
						res[ingred].bottles = {};
						res[ingred].dose = 0;
					}
					res[ingred].dose += dose*quantity;
				}
			}
		}
		
		// предлагаем бутылки
		for(ingred in res){
			var dose = res[ingred].dose;
			var vols = res[ingred].good.volumes;
			this.good_paths = [];
			// console.time('rec '+ingred);
			for(var i = 0; i < vols.length; i++){
				this.walk([vols[i]], vols[i][0], vols, dose);
			}
			// console.timeEnd('rec '+ingred);
			// console.time('cheap '+ingred);
			res[ingred].bottles = this.getCheapestSet(this.good_paths);
			// console.timeEnd('cheap '+ingred);
		}
		return res;
	},
	
	getCheapestSet: function(paths){
		var largestSumm = 0;
		for(var i = 0; i < paths.length; i++){
			var currSumm = 0;
			for(var j = 0; j < paths[i].length; j++) currSumm += paths[i][j][1];
			if(currSumm > largestSumm) largestSumm = currSumm;
		}
		var cheapestSumm = largestSumm;
		var cheapestIdx = -1;
		for(var i = 0; i < paths.length; i++){
			var currSumm = 0;
			for(var j = 0; j < paths[i].length; j++) currSumm += paths[i][j][1];
			if(currSumm <= cheapestSumm) {
				cheapestSumm = currSumm;
				cheapestIdx  = i;
			}
		}
		var cheapestPath = paths[cheapestIdx];
		var bottles = {};
		for(var i = 0; i < cheapestPath.length; i++){
			var id = cheapestPath[i][0];
			if(bottles[id]) bottles[id].count++;
			else {
				bottles[id] = {};
				bottles[id].vol = cheapestPath[i];
				bottles[id].count = 1;
			}
		}
		return bottles;
	},
		
	walk: function(path, summ, volumes, dose){
		if(summ >= dose) this.good_paths.push(path);
		else {
			for(var i = 0; i < volumes.length; i++){
				var curr_summ = summ + volumes[i][0];
				this.walk(path.concat([volumes[i]]), curr_summ, volumes, dose);
			}
		}
	},
	
	bottleByIngredientAndVolume: function(goods, ingred, vol){
		var res = {};
		var volumes = goods[ingred][0].volumes;
		for(var i = 0; i < volumes.length; i++){
			if(volumes[i][0] == vol) {
				res.vol = volumes[i];
				break;
			}
		}
		return res;
	},
	
	relatedCocktails: function(set, cocktail, howMany) {
		var res = [];
		var ingreds = [];
		var possibleSets = [];
		
		for(var i = 0; i < cocktail.ingredients.length; i++) {
			ingreds.push(cocktail.ingredients[i][0]);
		}
		possibleSets.push([].concat(ingreds));
		
		while(ingreds.length > 1) {
			var spliced = ingreds.length-1;
			while(spliced >= 0){
				possibleSets.push(ingreds.without(spliced));
				spliced--;
			}
			ingreds.splice(ingreds.length-1, 1);
		}
		
		for(var i = 0; i < possibleSets.length; i++){
			var cocktails = this.cocktailsByIngredients(set, possibleSets[i]);
			cocktails.splice(cocktails.indexOf(cocktail), 1);
			res = res.concat(cocktails.sort(this.nameSort));
			if(res.uniq().length >= howMany) break;
		}
		return res.uniq().slice(0, howMany);
	},
	
	suitableIngredients: function(set, list){
		var res = [];
		var cocktails = this.cocktailsByIngredients(set, list);
		for(var i = 0; i < cocktails.length; i++){
			for(var j = 0; j < cocktails[i].ingredients.length; j++){
				res.push(cocktails[i].ingredients[j][0]);
			}
		}
		return [cocktails.length, res.uniq(), cocktails[0]];
	},
	
	ingredientsByLetter: function(set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].match(reg)){
				res.push(set[i]);
			}
		}
		return res;		
	},
		
	cocktailsByLetter: function (set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].name.match(reg)){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByTag: function (set, tag) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByStrength: function(set, strength) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByIngredients: function(set, ingredients) {
		var res = [];
		for(var i = 0; i < set.length; i++) {
			var good = 0;
			for(var j = 0; j < set[i].ingredients.length; j++) {
				for(var k = 0; k < ingredients.length; k++){
					if(set[i].ingredients[j][0] == ingredients[k]) good++;
				}
			}
			if(good == ingredients.length) res.push(set[i]);
		}
		return res;
	},
	
	nameSort: function(a, b){
		if(a.name > b.name) return 1;
		else if(a.name == b.name) return 0;
		else return -1;
	},
	
	/**
	 * Нормализация объема относительно заданной единицы
	 * @param normUnit - заданная единица (напр., "л")
	 * @param txt - текст объема (напр., "15 мл")
	 * @return нормализованное значение (напр., 0.015)
	 */
	_parseDose: function(normUnit, txt){
		var arr = txt.match(/^(.+)\ (.+)/);
		var vol = arr[1];
		var unit = arr[2];
		if(unit == "мл" && normUnit == "л") return vol/1000;
		else if((unit.indexOf("кубик") > -1) && normUnit == "кубиков") return parseInt(vol);
		else if(unit == "шт" && normUnit == "шт") return this._parseDecimal(vol);
		else if(unit == "капли" && normUnit == "л") return vol/40000;
		else if(unit == normUnit) return parseFloat(vol);
	},
	
	/**
	 * Парсинг значений объема, заданных в виде дробей
	 * @param volume - например, "1/2"
	 * @return число типа float наподобие 0.5
	 */
	_parseDecimal: function(volume){
		if(volume.indexOf("/") > -1) return eval(volume);
		else return parseFloat(volume);
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