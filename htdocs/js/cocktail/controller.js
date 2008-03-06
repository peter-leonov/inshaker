var Controller = {
	ID_REC     : 'recommendations',
	ID_SURFACE : 'rec_surface',
	
	name : "",
	
	init: function(name){
		Model.init(name);
		this.renderRecommendations();
	},
	
	renderRecommendations: function(){
		var parent = $(this.ID_SURFACE);
		
		var recs = Model.recs; // recommendations
		for(var i = 0; i < recs.length; i++){
			var div = document.createElement("div");
			div.className = "point";
			div.id = "rec_"+(i+1);
			div.innerHTML = recs[i].text;
			parent.appendChild(div);
		}

		
		$(this.ID_REC).RollingImages.sync();
		$(this.ID_REC).RollingImages.goInit();
	}
}