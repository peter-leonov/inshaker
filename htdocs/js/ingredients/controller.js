var Controller = {
	ALPHABETICAL   : 'top-alphabetical',
	CHOSEN_INGEREDS: 'chosen',
	CAN_PREPARE    : 'can_prepare',
	CAN_PREPARE_TXT: 'can_prepare_txt',
	HOW_MANY       : 'how_many',
	VIEW_COCKTAILS : 'view_cocktails',
	COLUMN_CLASS   : 'col',
	SELECTED_CLASS : 'now',
	DISABLED_CLASS : 'dis',
	
	// stabilization and positioning
	LEFT: true,
	RIGHT: false,
	COLUMNS: 5,
	GAP: 5,
	TRIES: 104,
	
	// selected ingredients
	selected: [],
	
	topCocktail    : null,
	numCanPrepare  : 0,
    
    // cached nodes
    nameNodes: [],
    markNodes: [],	
	
	init: function() {
		Model.init();
		Model.dataListener = this;
		this.renderIngredients(Model.ingredients);
		this.bindEvents();
	},
	
	bindEvents: function(){
		var self = this;
	 	$(this.ALPHABETICAL).addEventListener('click', function(e){
			self.ingredientClicked(e, true);
		}, false);
		
		$(this.VIEW_COCKTAILS).addEventListener('click', function(e){
			self.viewCocktailsClicked();
			e.preventDefault();
		}, false);
		
		$(this.CHOSEN_INGEREDS).addEventListener('click', function(e){
			self.ingredientClicked(e, false);
		}, false);
	},
	
	renderIngredients: function(ingredients){
		var parent = $(this.ALPHABETICAL);
		
		// creating columns
		var columns = [];
		for(var i = 0; i < this.COLUMNS; i++) {
			var div = document.createElement("div");
			div.className = this.COLUMN_CLASS;
			parent.appendChild(div);
			columns.push(div);
		}
		
		// finding unique letters
		var letters = Model.uniqueLetters();
		
		// creating divs with heading and ingredients
		var divs = {};
		for(var i = 0; i < letters.length; i++) {
			var ingreds  = Model.ingredientsOn(letters[i]).sort();
			var div      = document.createElement("div");
			var h3       = document.createElement("h3");
			h3.innerHTML = letters[i];
			div.appendChild(h3);
			for(var j = 0; j < ingreds.length; j++){
				var a = document.createElement("a");
				var name = document.createElement("span");
                name.className = "ingred-name";
                name.innerHTML = ingreds[j];
                var mark = document.createElement("span");
                mark.className = "round-mark";
				a.appendChild(name);
                a.appendChild(mark);
                div.appendChild(a);
                
                // Unnecessary caching
                this.nameNodes.push(name);
                this.markNodes.push(mark);
			}
			divs[letters[i]] = div;
		}
		
		var col_counts = [];
		for(var i = 0; i < columns.length; i++) col_counts[i] = 0; 
		
		// flusing all divs in the first column
		for(letter in divs){
			columns[0].appendChild(divs[letter]);
			col_counts[0] += divs[letter].childNodes.length;
		}
		
		// stabilizing columns
		var stabilized = false;
		var dir = this.LEFT;
		var i = 0;
		var all_cols = false;
		
		while(!stabilized) {
			var longest = this._findLongestIdx(col_counts);
			
			// change of direction
			if(longest == 0) dir = this.RIGHT;
			else if(longest == columns.length-1) dir = this.LEFT;
			
			if(dir == this.LEFT) {
				var toRem = columns[longest].firstChild;
				columns[longest].removeChild(toRem);
				columns[longest-1].appendChild(toRem);
				col_counts[longest]   -= toRem.childNodes.length;
				col_counts[longest-1] += toRem.childNodes.length;
			} else if(dir == this.RIGHT) {
				var toRem = columns[longest].lastChild;
				columns[longest].removeChild(toRem);
				columns[longest+1].insertBefore(toRem, columns[longest+1].firstChild);
				col_counts[longest]   -= toRem.childNodes.length;
				col_counts[longest+1] += toRem.childNodes.length;
			}
			
			var longest  = this._findLongestIdx(col_counts);
			var shortest = this._findShortestIdx(col_counts);
			
			all_cols = col_counts[col_counts.length-1] > 0;
			if((col_counts[longest] - col_counts[shortest] < this.GAP && all_cols) || i > this.TRIES) stabilized = true;
			if(i++ % 50 == 0)  this.GAP++;
		}
	},
	
	_findLongestIdx: function(arr){
		var longest = 0;
		for(var i = 1; i < arr.length; i++){
			if(arr[i] > arr[longest]) {
				longest = i;
			}
		}
		return longest;
	},
	
	_findShortestIdx: function(arr){
		var shortest = 0;
		for(var i = 1; i < arr.length; i++){
			if(arr[i] < arr[shortest]) {
				shortest = i;
			}
		}
		return shortest;
	},
	
	viewCocktailsClicked: function(){
		if(this.numCanPrepare > 1){
			window.location.href = "/cocktails.html#ingredients=" + this.selected.join(",");
		} else {
			window.location.href = "/cocktails/" + this.topCocktail.name_eng.htmlName() + ".html";
		}
	},
	
	ingredientClicked: function(e, fromAlphabetical){
		var a = e.target 
        var name = "", el = null;
        if(fromAlphabetical) { 
            el = (a.className == "ingred-name") ? a : cssQuery(".ingred-name", a)[0];
            if(el) name = el.innerHTML; else return;
        } else {
            el = (a.className == "selected-ingred") ? a : (a.parentNode.className == "selected-ingred" ? a.parentNode : null); 
            if(el) name = el.innerHTML.beforeTag(); else return;
        }

		var idx = -1;
		if((idx = this.selected.indexOf(name)) == -1){
			this.selected.push(name);
		} else {
			this.selected.splice(idx, 1);
		}
		this.selectedListChanged();
	},
	
	selectedListChanged: function(){
		if(this.selected.length > 0) {
			$(this.CHOSEN_INGEREDS).innerHTML = "<strong>Вы выбрали:</strong>  ";
		} else $(this.CHOSEN_INGEREDS).innerHTML = "<strong>Выберите ингредиенты</strong>";
		for(var i = 0; i < this.selected.length; i++){
			var span = document.createElement("span");
			span.innerHTML = this.selected[i];
			var del = document.createElement("a");
			span.appendChild(del);
            span.className = "selected-ingred";
			$(this.CHOSEN_INGEREDS).appendChild(span);
			if(i < this.selected.length - 1){
				$(this.CHOSEN_INGEREDS).appendChild(document.createTextNode(", "));
			}
		}
		var nodes = cssQuery(".ingred-name", $(this.ALPHABETICAL));
		for(var i = 0; i < nodes.length; i++){
			if(this.selected.indexOf(nodes[i].innerHTML) > -1) {
				nodes[i].parentNode.addClassName(this.SELECTED_CLASS);
			} else {
				nodes[i].parentNode.remClassName(this.SELECTED_CLASS);
			}
		}
		Model.selectedListChanged(this.selected);
	},
	
    updateRounds: function(rounds, show) {
		for(var i = 0; i < this.nameNodes.length; i++){
            Ingredient.getByName(this.nameNodes[i].innerHTML).updateRound(this.markNodes[i], show);
		}
    },

	updateCount: function(num, top, selectedNum){
		this.topCocktail = top;
		this.numCanPrepare = num;
		
		if(this.numCanPrepare > 0){
			$(this.CAN_PREPARE).style.display = "block";
 			var txt = "";
			if(this.numCanPrepare > 1) {
				txt += this.numCanPrepare + " ";
				txt += this.numCanPrepare.plural("коктейля", "коктейлей", "коктейлей") +".";
				$(this.VIEW_COCKTAILS).value = "Посмотреть коктейли";
			} else {
				txt = this.topCocktail.name;
				$(this.VIEW_COCKTAILS).value = "Посмотреть коктейль";
			}
			$(this.HOW_MANY).innerHTML = txt;
            $(this.CAN_PREPARE_TXT).innerHTML = selectedNum.plural("Входит", "Входят", "Входят") + " в состав";
		} else {
			$(this.CAN_PREPARE).style.display = "none";
		}
	}
}
