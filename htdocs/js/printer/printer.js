var Printer = {
    ID_COCKTAILS_NUM  : 'cocktails_num',
    ID_COCKTAILS_LIST : 'cocktails_list',
    ID_INGREDS_LIST   : 'ingredients_list',
    ID_TOOLS_LIST     : 'tools_list',
    ID_RECEIPT        : 'receipt',
    
    ID_COCKTAIL_NAME  : 'cocktail_name',
    ID_COCKTAIL_IMG   : 'cocktail_img',
    ID_INGREDS_IMGS   : 'cocktail_ingreds',

    IMG_COCKTAIL_PRFX : '/i/cocktail/b/',
    IMG_INGRED_PRFX   : '/i/merchandise/ingredients/',
    IMG_MARKER        : '/t/print/li.gif',

    wannaPrint: false,
    cartData : {},

    init: function(context, param) {
		var self = this;
		Storage.init(function(){
			if(self[context+"Init"]) self[context+"Init"](param);
		});
    },


    preloadImages: function(){
        var img = new Image();
        var self = this;
        img.src = this.IMG_MARKER;
        img.onload = function(e){
            if(self.wannaPrint) setTimeout("print()", 500);
        }
    },

    cocktailInit: function(param){
        this.preloadImages();
        var cocktail = null;
        for(name in cocktails) {
            if(cocktails[name].name_eng.htmlName() == param) {
                cocktail = cocktails[name];
                break;
            }
        }
  		this.renderCocktail(cocktail);
    },  

	renderCocktail: function(cocktail){
	   var receiptRoot   = $(this.ID_RECEIPT);
       var ingredsRoot   = $(this.ID_INGREDS_LIST);
       var toolsRoot     = $(this.ID_TOOLS_LIST);
       var imgsRoot      = $(this.ID_INGREDS_IMGS);

       document.title = "InShaker √  " + cocktail.name;
       $(this.ID_COCKTAIL_NAME).innerHTML = cocktail.name;
       $(this.ID_COCKTAIL_IMG).src = this.IMG_COCKTAIL_PRFX + cocktail.name_eng.htmlName() + ".png";     
       for(var i = 0; i < cocktail.receipt.length; i++){
            receiptRoot.appendChild(this.createReceiptElement(cocktail.receipt[i]));
       }

       for(var i = 0; i < cocktail.ingredients.length; i++){
           var last = (i == (cocktail.ingredients.length - 1));
           ingredsRoot.appendChild(this.createIngredPairElement(cocktail.ingredients[i], last));
       }

       for(var i = 0; i < cocktail.tools.length; i++){
           var last = (i == (cocktail.tools.length - 1));
           toolsRoot.appendChild(this.createToolElement(cocktail.tools[i], last));
       }

       var imgCounter = 0;
       for(var i = 0; i < cocktail.ingredients.length; i++) {
            var img = this.createIngredImage(cocktail.ingredients[i][0]);
            imgsRoot.appendChild(img);
            img.onload = function(e){
                imgCounter++;
                if(imgCounter == cocktail.ingredients.length) print();
            }
       }
	},

    cartInit: function(){
        if(Storage.get(GoodHelper.CART)){
            this.preloadImages();
            this.cartData = Storage.get(GoodHelper.CART);
            this.cartData = GoodHelper.deSerializeCartData(JSON.parse(this.cartData));
            this.renderCartData(this.cartData);
            this.wannaPrint = true;
        } else {
            alert("ERROR: Unable to obtain cartData");
        }
    },

    renderCartData: function(cartData){
        var cocktailsRoot = $(this.ID_COCKTAILS_LIST);
        var ingredsRoot   = $(this.ID_INGREDS_LIST);
        var toolsRoot     = $(this.ID_TOOLS_LIST); 

        var cNum = 0;
        for(var i = 0; i < cartData.cocktails.length; i++){
            var cocktail = cartData.cocktails[i][0];
            var quantity = cartData.cocktails[i][1];
            cNum += quantity;
            
            var last = (i == (cartData.cocktails.length-1));
            cocktailsRoot.appendChild(this.createCocktailElement(cocktail, quantity, last));
        }
        var numTxt = "";
        if(cNum > 1) numTxt = cNum + " " + cNum.plural("коктейль", "коктейля", "коктейлей");
        $(this.ID_COCKTAILS_NUM).innerHTML = numTxt;
        
        var i = 0; 
        var l = lengthOf(cartData.goods);
        for(name in cartData.goods){
			var bottles = cartData.goods[name].bottles;
			var j = 0;
            for(id in bottles){
                var last = (i == (l-1)) && (j == (lengthOf(bottles)-1)); 
				ingredsRoot.appendChild(this.createIngredElement(bottles[id], name, last));
                j++;
			}
            i++;
		}

        var tools = this.collectTools(cartData.cocktails);
        for(var i = 0; i < tools.length; i++) {
            toolsRoot.appendChild(this.createToolElement(tools[i], i == (tools.length-1)));
        }
    },

    collectTools: function(cocktailsAndQuants) {
        var res = [];
        for(var i = 0; i < cocktailsAndQuants.length; i++){
            var cocktail = cocktailsAndQuants[i][0];
            res = res.concat(cocktail.tools);
        }
        return res.uniq();
    },

    createCocktailElement: function(cocktail, quantity, last){
       var dd = document.createElement("dd");
       if(last) dd.className = "last";
       var div = document.createElement("div");
       div.className = "txt";
       var cnt = document.createElement("div");
       cnt.className = "cnt";
       div.innerHTML = cocktail.name;
       cnt.innerHTML = quantity + " " + GoodHelper.pluralTxt(quantity, "порция");
       dd.appendChild(div);
       dd.appendChild(cnt);
       return dd;
    },

    createReceiptElement: function(line) {
        var li = document.createElement("li");
        li.innerHTML = line;
        return li; 
    },
    
    createIngredImage: function(name){
       var img = new Image();
       img.src = this.IMG_INGRED_PRFX + name.trans() + "_small.png";
       return img;
    },

    createIngredPairElement: function(pair, last){
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        var name = pair[0];

        var txt = this.getIngredText(name);
        div.appendChild(document.createTextNode(txt));
        
        var cnt = document.createElement("div");
        cnt.innerHTML = pair[1];
        cnt.className = "cnt";

        dd.appendChild(div);
        dd.appendChild(cnt);
        return dd;
    },
    
    createIngredElement: function(bottle, name, last) {
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        
		var txt = this.getIngredText(name);
        div.appendChild(document.createTextNode(txt));
        
		if(GoodHelper.isBottled(goods[name][0])){
            var span = document.createElement("span");
            var spanTxt = " (" + GoodHelper.bottleTxt(name, goods[name][0].unit, bottle.vol[0]);
            spanTxt += bottle.vol[0] + " " + GoodHelper.pluralTxt(bottle.vol[0], goods[name][0].unit);
            spanTxt += ")";
            span.className = "bottle";
            span.innerHTML = spanTxt;
            div.appendChild(span);
        }

        var cnt = document.createElement("div");
        cnt.innerHTML = bottle.count + " " + GoodHelper.pluralTxt(bottle.count, "штуки");
        cnt.className  = "cnt";
       
        dd.appendChild(div);
        dd.appendChild(cnt);
        return dd;
    },

	getIngredText: function(name){
		var brand = goods[name][0].brand || "";
		if(brand.indexOf(name) > -1) name = "";
		var gap = "";
		if(brand && name) gap = " ";
		return name + (brand ? gap + brand : "");
	},

    createToolElement: function(name, last) {
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        var div = document.createElement("div");
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        div.appendChild(document.createTextNode(name));
        div.className = "txt";

        dd.appendChild(div);
        return dd;
    }

};