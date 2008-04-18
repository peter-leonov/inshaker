var Printer = {
    ID_COCKTAILS_NUM  : 'cocktails_num',
    ID_COCKTAILS_LIST : 'cocktails_list',
    ID_INGREDS_LIST   : 'ingredients_list',
    ID_TOOLS_LIST     : 'tools_list',
    IMG_MARKER        : '/t/print/li.gif',

    cartData : {},

    init: function(context) {
        if(this[context+"Init"]) this[context+"Init"]();
    },

    cartInit: function(){
        if(Cookie.get(GoodHelper.CART_COOKIE)){
            this.cartData = Cookie.get(GoodHelper.CART_COOKIE);
            this.cartData = GoodHelper.deSerializeCartData(JSON.parse(this.cartData));
            this.renderCartData(this.cartData);
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
			var item = cartData.goods[name];
			var bottles = cartData.goods[name].bottles;
			var j = 0;
            for(id in bottles){
                var last = (i == (l-1)) && (j == (lengthOf(bottles)-1)); 
				ingredsRoot.appendChild(this.createIngredElement(item, bottles[id], name, last));
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

    createIngredElement: function(item, bottle, name, last) {
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        
        var txt = name + (item.good.mark ? " " + item.good.mark : "");
        div.appendChild(document.createTextNode(txt));
        if(GoodHelper.isBottled(item.good)){
            var span = document.createElement("span");
            var spanTxt = " (" + GoodHelper.bottleTxt(name, item.good.unit);
            spanTxt += bottle.vol[0] + " " + GoodHelper.pluralTxt(bottle.vol[0], item.good.unit);
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
