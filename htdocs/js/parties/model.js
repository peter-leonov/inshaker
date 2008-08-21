function PartiesModel(view, parties_db){
	this.DEFAULT_CITY = "Москва";
	
	this.view   = view;
	this.db     = parties_db;
	this.barsDB = DB.Bars;
	
	this.initialize = function(filters){
		this.view.initialize();
		
		var initialCity  = this.DEFAULT_CITY;
		var initialParty = null;
		
		if(filters && filters.city){
			initialCity  = this.db.cityExists(filters.city) ? filters.city : null;
			initialParty = this.db.partyByCityAndName(filters.city, filters.party); 
		}
		this.view.setPreviews(this.db.getByCity(initialCity).sort(this.previewSort));
		this.view.partySelected(initialParty || this.db.getByCity(initialCity).sort(this.previewSort)[0], false);
	};
	
	this.previewSort = function(a,b){
		if(a.number > b.number) return 1;
		else if(a.number == b.number) return 0;
		else return -1;
	};
	
	this.getBarForParty = function(party){
		return this.barsDB.getBarByCityName(party.city, party.bar);
	};
}