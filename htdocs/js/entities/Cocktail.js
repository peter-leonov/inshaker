Cocktail = function (data)
{
	for (var k in data) this[k] = data[k];
}

Cocktail.prototype =
{
    getRound: function() {
        return Cocktail.rounds[this.name];
    },

    getPreviewNode: function(dropTargets) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "/cocktails/" + this.name_eng.htmlName() + ".html";
		var img = document.createElement("img");
		img.src = "/i/cocktail/s/" + this.name_eng.htmlName() + ".png";
		if(dropTargets) new Draggable(img, this.name, dropTargets);
        var txt = document.createTextNode(this.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
       	return li;		
	},

    updateRound: function(node, show) {
        var round = this.getRound();
        if(round == 0) round = "Ok";
        else round = "+" + round;
        
        var mark = node.getElementsByClassName("round-mark")[0];
        
        if(!mark) {
            if(!show) return
            mark = document.createElement("div");
            mark.className = "round-mark";
            node.appendChild(mark);
        }
        mark.innerHTML = round;
        mark.setVisible(show)
    }
}

Object.extend(Cocktail,
{
    cocktails: [],
    ingredients: [],
    letters: [],
    names: [],
    methods: ["просто", 
              "в шейкере", 
              "в блендере", 
              "давят пестиком", 
              "укладывают слои", 
              "миксуют в стакане", 
              "не очень просто"],
    rounds: {},

    dictNames: {},
    dictLetters: {},
	dictMethods: {},

	initialize: function (db){
        for (var i = 0; i < this.methods.length; i++) this.dictMethods[this.methods[i]] = [];
		
		var ai = this.ingredients, seen = {}
		
		var i = 0;
		for (var k in db){
			var cocktail = new Cocktail(db[k]);
			this.names[i] = cocktail.name;
			this.cocktails[i] = this.processMethods(cocktail);
            			
            var nameWords = cocktail.name.split(" ").map(function(v){ return v.toLowerCase() }).sort();
            var nameEngWords = cocktail.name_eng.split(" ").map(function(v){ return v.toLowerCase() }).sort();
            this.dictNames[nameWords.join("") + nameEngWords.join("")] = i;
            
			var ci = cocktail.ingredients
			for (var j = 0; j < ci.length; j++)
			{
				var ingr = ci[j][0]
				if (!seen[ingr])
				{
					seen[ingr] = true
					ai.push(ingr)
				}
			}
			
			var letter = cocktail.name.substr(0,1).toLowerCase();
			if(this.letters.indexOf(letter) == -1) this.letters.push(letter);
            if(!this.dictLetters[letter]) this.dictLetters[letter] = [];
            this.dictLetters[letter].push(i);

            i++;
		}
		this.letters = this.letters.sort();
	},

    processMethods: function(cocktail){
        var itsMethods = {};
        for (var i = 0; i < this.methods.length; i++) itsMethods[this.methods[i]] = false;
        var itsTools = cocktail.tools;

        if(itsTools.indexOf("Шейкер") > -1)  itsMethods["в шейкере"] = true;
        if(itsTools.indexOf("Пестик") > -1)  itsMethods["давят пестиком"] = true;
        if(itsTools.indexOf("Блендер") > -1 || itsTools.indexOf("Коктейльный миксер") > -1) itsMethods["в блендере"] = true;
        if(itsTools.indexOf("Пестик") > -1)  itsMethods["давят пестиком"] = true;
        if(itsTools.indexOf("Стакан для смешивания") > -1) itsMethods["миксуют в стакане"] = true;
        if(itsTools.indexOf("Стопка") > -1 && itsTools.indexOf("Коктейльная ложка") > -1) itsMethods["укладывают слои"] = true;
        
        var numMethods = 0; for(var method in itsMethods) if(itsMethods[method]) numMethods++;

        if(numMethods > 1) cocktail.method = "не очень просто";
        else if(numMethods == 0) cocktail.method = "просто";
        else for(var method in itsMethods) if(itsMethods[method]) { cocktail.method = method; break; }
        
        return cocktail;
    },
	
    getAll: function(){
        return this.cocktails;
    },

	getByName: function (name){
		for(var i = 0; i < this.cocktails.length; i++){
			if(this.cocktails[i].name == name) return this.cocktails[i];
		}
	},
	
	getBySimilarName: function (name){
        var term = name.split(" ").map(function(v){ return v.toLowerCase() }).sort().join("");

        var res = [];
        for(var key in this.dictNames) {
            if (key.indexOf(term) > -1) res.push(this.cocktails[this.dictNames[key]])
        }
        return res;
	},
	
	getByHtmlName: function(htmlName){
		for(var i = 0; i < this.cocktails.length; i++){
			if(this.cocktails[i].name_eng.htmlName() == htmlName) return this.cocktails[i];
		}
	},
	
	getByLetter: function (letter){
        letter = letter.toLowerCase();

		var res = [];
        var cNums = this.dictLetters[letter];
    	
		for(var i = 0; i < cNums.length; i++){
            res[i] = this.cocktails[cNums[i]];
        }

        return res.sortedBy(this.nameSort);
	},
	
	getByTag: function (tag, set) {
		if(!set) set = this.cocktails;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	getByStrength: function(strength, set) {
		if(!set) set = this.cocktails;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},

    getByMethod: function(method, set) {
        if(!set) set = this.cocktails;
        var res = [];
        for(var i = 0; i < set.length; i++){
             if(set[i].method == method) {
                res.push(set[i]);
             }
        }
        return res;
    },
    
    getByIngredients: function(ingredients, set) {
        this.rounds = {};
		if(!set) set = this.cocktails;
		var res = [];
		for(var i = 0; i < set.length; i++) {
			var matches = 0;
			for(var j = 0; j < set[i].ingredients.length; j++) {
				for(var k = 0; k < ingredients.length; k++){
					if(set[i].ingredients[j][0] == ingredients[k]) matches++;
				}
			}
			if(matches > 0) res.push(set[i]);
		    this.rounds[set[i].name] = set[i].ingredients.length - matches;
        }
		return res.sort(this.roundSort).sort(this.lessIngredientsSort);
	},
	
	getByFilters: function(filters, states) {
		var res = [];
		var filtered = false;
		if(filters.name){
			return this.getBySimilarName(filters.name);
		}
		if(filters.letter){
			return this.getByLetter(filters.letter);
		}
		if(filters.tag) {
			res = this.getByTag(filters.tag);
			filtered = true;
		}
		if(filters.strength) {
			var to_filter = [];
			res = this.getByStrength(filters.strength, filtered ? res : null);
			filtered = true;
		}
        if(filters.method) {
            res = this.getByMethod(filters.method, filtered ? res: null);
            filtered = true;
        }
		if(filters.ingredients && filters.ingredients.length) {
            var to_filter = [];
			res = this.getByIngredients(filters.ingredients, filtered ? res : null);
			filtered = true;
		}
        
        if(!filtered) {
            if(filters.state == states.byName) {
                res = this.cocktails.shuffled();
            } else {
                res = this.cocktails.sortedBy(this.nameSort);
		    }
        }
        return res;
	},

    nameSort: function(a,b) {
        if(a.name > b.name) return 1;
	    else if(a.name == b.name) return 0;
	    else return -1;
    },
  
    lessIngredientsSort: function(a,b) {
        var ail = a.ingredients.length, bil = b.ingredients.length;

        if(ail > bil) return 1;
	    else if(ail == bil) return 0;
	    else return -1;
    },

    roundSort: function(a,b) {
        if (a.getRound() > b.getRound()) return 1;
        else if (a.getRound() == b.getRound()) return 0;
        else return -1;
    }
})

Cocktail.initialize(<!--# include file="/db/cocktails.js" -->)
Cocktail.tags = <!--# include file="/db/tags.js" -->
Cocktail.strengths = <!--# include file="/db/strengths.js" -->
