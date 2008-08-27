function PartiesModel(view){
	this.DEFAULT_CITY = "Москва";
	
	this.view   = view;
	
	this.initialize = function(filters){
		this.view.initialize();
		
		var initialCity  = this.DEFAULT_CITY;
		var initialParty = null;
		
		if(filters && filters.city){
			initialCity  = Party.cityExists(filters.city) ? filters.city : null;
			initialParty = Party.getByCityName(filters.city, filters.party); 
		}
		this.view.setPreviews(Party.getAllByCity(initialCity).sort(this.previewSort));
		this.view.partySelected(initialParty || Party.getAllByCity(initialCity).sort(this.previewSort)[0], false);
	};
	
	this.previewSort = function(a,b){
		if(a.number > b.number) return 1;
		else if(a.number == b.number) return 0;
		else return -1;
	};
	
	this.getBarForParty = function(party){
		return Bar.getByCityName(party.city, party.bar);
	};
}