function PartiesView(nodes){
	new Programica.RollingImagesLite(nodes.photos, {animationType: 'easeOutQuad'});
	new Programica.RollingImagesLite(nodes.previews, {animationType: 'easeOutQuad'});
	
	this.selectedPartyNode = null;
	this.selectedParty = null;
	this.controller = null;
	
	this.initialize = function(){
		var self = this;
		nodes.guestsMinus.addEventListener('click', function(e){
			self.guestsNumberChanged(false);
		}, false);
		
		nodes.guestsPlus.addEventListener('click', function(e){
			self.guestsNumberChanged(true);
		}, false);
		
		nodes.guestsNumber.addEventListener('keyup', function(e){
			self.guestsNumberChanged(false, this.value);
		}, false);
		
		nodes.wantLink.addEventListener('click', function(e){
			nodes.wantPopup.show();
		}, false);
		
		var wci = nodes.wantCloseItems;
		for(var i = 0; i < wci.length; i++){
			wci[i].addEventListener('click', function(e){
				nodes.wantPopup.hide();
			}, false);
		}
	};
	
	this.setPreviews = function(parties){		
		var curPoint = null;
		
		for(var i = 0; i < parties.length; i++) {
			if(i % 4 == 0) {
				curPoint = document.createElement("li");
				curPoint.addClassName("point");
				nodes.previewSurface.appendChild(curPoint);
			}
			curPoint.appendChild(this.createPreviewElement(parties[i]));
		}
	};
	
	this.createPreviewElement = function(party){
		var div = document.createElement("div");
		div.addClassName("party");
		var img = document.createElement("img");
		img.src = this.getPartyImgSrc(party, "-mini.png");
		img.alt = party.name;
		div.appendChild(img);
		var name = document.createElement("div");
		name.addClassName("name");
		name.innerHTML = party.name + " в<br/>" + party.bar;
		div.appendChild(name);
		
		var self = this;
		div.addEventListener('click', function(e){
			if(self.selectedParty != party) self.partySelected(party);
		}, false);
		return div;
	};
	
	this.partySelected = function(party){
		this.selectedParty = party;
		if(this.selectedPartyNode) this.selectedPartyNode.remClassName("selected")
		this.selectedPartyNode = cssQuery(".party:contains('"+ party.name +"')")[0];
		this.selectedPartyNode.addClassName("selected");
		
		this.setPartyDisplayData(party);
		this.setPartyPhotos(party);
		
		this.controller.partySelected(party);
	};
	
	this.guestsNumberChanged = function(plus, newValue){
		var guestsNumber = null; 
		var ok = true;
		
		if(newValue){
			guestsNumber = newValue;
			if(!validateNumeric(guestsNumber) || guestsNumber <= 0) guestsNumber = 1;
			if(guestsNumber > this.selectedParty.max_guests) guestsNumber = this.selectedParty.max_guests;
		} else {
	   		if(plus) guestsNumber = parseInt(nodes.guestsNumber.value) + 1;
	   		else     guestsNumber = parseInt(nodes.guestsNumber.value) - 1;
			ok = (guestsNumber <= this.selectedParty.max_guests) && (guestsNumber > 0);
		}
		if(ok){ 
			nodes.guestsNumber.value = guestsNumber;
			var pricePerGuest = Math.round(this.selectedParty.payment_amount/guestsNumber);
			nodes.pricePerGuest.innerHTML = priceSpaces(pricePerGuest);
			nodes.imgRubGuest.src = '/t/bg/parties/rub_guest_' + pricePerGuest.plural("2","5","5") + ".png";
			nodes.person.innerHTML = guestsNumber.plural("человека","человек","человек");
		}
	};
	
	this.setPartyPhotos = function(party){
		nodes.photoSurface.innerHTML = "";
		for(var i = 1; i < party.big_images_count+1; i++){
			var point = document.createElement("li");
			point.addClassName("point");
			var img = document.createElement("img");
			img.alt = party.name;
			img.src = this.getPartyImgSrc(party, "-big-" + i + ".jpg");
			point.appendChild(img);
			nodes.photoSurface.appendChild(point);
		}
		var pa = nodes.photosArrows;
		if(party.big_images_count < 2)
			 for(var i = 0; i < pa.length; i++) pa[i].addClassName("hidden");
		else for(var i = 0; i < pa.length; i++) pa[i].remClassName("hidden");
		nodes.photos.RollingImagesLite.sync();
		nodes.photos.RollingImagesLite.goInit();
	};
	
	this.setPartyDisplayData = function(party){
		nodes.partyName.innerHTML = party.name;
		nodes.barName.innerHTML = party.bar;
		nodes.barName.href = this.getBarHref(party);
		nodes.maxGuests.innerHTML = party.max_guests;
		
		nodes.person.innerHTML = party.max_guests.plural("человека","человек","человек");
		nodes.maxPerson.innerHTML = party.max_guests.plural("человека","человек","человек");
		
		nodes.guestsNumber.value = party.max_guests;
		nodes.priceMin.innerHTML = spaces(party.payment_amount);
		
		var pricePerGuest = Math.round(party.payment_amount/party.max_guests);
		nodes.pricePerGuest.innerHTML = priceSpaces(pricePerGuest);
		nodes.imgRubGuest.src = '/t/bg/parties/rub_guest_' + pricePerGuest.plural("2","5","5") + ".png";
		
		nodes.paymentType.innerHTML = party.payment_type;
	};
	
	this.getPartyImgSrc = function(party, postfix){
		return "/i/party/" + party.city.trans().htmlName() + "/" + party.bar.trans().htmlName() + "-" + party.name.trans().htmlName() + postfix;
	};
	
	this.getBarHref = function(party){
		return this.controller.getBarHrefForParty(party);
	}
}