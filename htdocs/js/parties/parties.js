var PartiesPage = {
	initialize: function(nodes){
		this.view       = new PartiesView(nodes);
		this.model      = new PartiesModel(this.view);
		this.controller = new PartiesController(this.model, this.view);
	}
};

$.onload (
	function(){		
		var nodes = {
			photos: cssQuery('.party-photos')[0],
			previews: cssQuery('.b-content .party-previews')[0],
			previewSurface: $('party_previews_surface'),
			photoSurface: $('party_photos_surface'),
			photosArrows: [cssQuery(".party-photos .prev")[0], cssQuery(".party-photos .next")[0]],
			
			partyName: $('party_name'),
			barName: $('bar_name'),
			
			maxGuests: $('party_max_guests'),
			priceMin: $('party_price_min'),
			pricePerGuest: $('party_price_per_guest'),
			imgRubGuest: $('party_rub_guest'),
			guestsNumber: $('party_guests_number'),
			paymentType: $('party_payment_type'),
			
			guestsMinus: $('party_guests_minus'),
			guestsPlus: $('party_guests_plus'),
			person: $('party_person_txt'),
			maxPerson: $('party_max_person_txt'),
			
			wantLink: $('want_link'),
			wantPopup: $('want_popup_area'),
			
			wantCloseItems: [$('want_close_text'), $('want_close_cross'), $('overlay')]
		}
		PartiesPage.initialize(nodes);
	}
)