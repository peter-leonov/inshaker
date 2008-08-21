function PartiesController(model, view){
	this.model = model;
	this.view  = view;
	
	this.initialize = function(){
		var filters = this.filtersFromRequest();
		this.view.controller = this;
		this.model.initialize(filters);
	};
	
	this.filtersFromRequest = function(){
		var address = window.location.href;
		var match = address.match(/.+\#(.+)/);
		if(match){
			var params = match[1].split("&");
			var filters = {};
			for(var i = 0; i < params.length; i++) {
				var pair = params[i].split("=");
				filters[pair[0]]=decodeURIComponent(pair[1]);
			}
			return filters;
		} else return null;
	};
	
	this.partySelected = function(party){
		window.location.hash = "city="+party.city+"&party="+party.name;
	};
	
	this.getBarHrefForParty = function(party){
		var bar = this.model.getBarForParty(party);
		return '/bars/' + bar.city.trans().htmlName() + '/' + bar.name_eng.htmlName() + '.html';
	}
	
	this.initialize();
}