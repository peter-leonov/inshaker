/**
 * Автоматическое дополнение текста
 * Чтобы использовать, нужно стать changeListener'ом с методом onSearchConfirmed(result)
 * 
 * @param set - массив, по которому будут подбираться результаты
 */
function Autocompleter(set, field, form) {
	
	var div = document.createElement("div");
	div.className = "autocomplete";
	field.parentNode.insertBefore(div, field.nextSibling);
	div.style.width = (field.offsetWidth-5) + "px";
	div.style.marginTop = field.offsetHeight + "px";
	
	var error_div = document.createElement("div");
	error_div.className = "search-error";
	field.parentNode.insertBefore(div, field);
	
	this.HI_STYLE = 'hi';
	this.ERR_MESSAGE = '...этого у нас еще нет';

	this.KEY_ENTER = 13;
	this.KEY_ESC = 27;
	this.KEY_UP = 38;
	this.KEY_DOWN = 40;
	
	this.hi_pos = -1; // highlight position
	this.selected_elem = null;
	this.changeListener = null;
	this.shown = false;
	this.initial_input = "";
	
	this.result_set = [];

	var self = this;
	if(form) form.addEventListener('submit', function(e) { e.preventDefault() }, false);
	field.addEventListener('keyup', function(e) {
		switch(e.keyCode){
			case self.KEY_ENTER:
				if(set.indexOf(field.value.capitalize()) > -1) {
					self.hide();
					self.confirm();
				} else if(field.value != ""){
					self.hide();
					self.error();
				}
				break;
			case self.KEY_ESC:	
				self.resetSelection();
				self.hide();
				break;
			case self.KEY_DOWN:
				if(self.shown){
					self.highlight(false);
				}
				break;
			case self.KEY_UP:
				if(self.shown){
					self.highlight(true);
				}
				break;
			default:
				self.initial_input = field.value;
				self.result_set = self.findInSet(field.value);
				if(self.result_set.length > 0) {
					self.clearResults();
					self.resetSelection();
					self.fillResults();
					self.show();
				} else {
					self.clearResults();
					self.resetSelection();
					self.hide();
				}
		}
	}, false);
	
	this.highlight = function(up) {
		var len = div.childNodes.length;
		if(!up) {
			if(this.hi_pos < (len-1)) {
				this._highlightElem(this.hi_pos+1, true);
			} else if(this.hi_pos == (len-1)){
				this._hideSelector(false); // disappear for 1 key press
			} else if(this.hi_pos == len) {
				this._highlightElem(0, true); // round
			}
		} else if(up){
			if(this.hi_pos > 0) {
				this._highlightElem(this.hi_pos-1, true);
			} else if(this.hi_pos == 0) {
				this._hideSelector(true); // disappear for 1 key press
			} else if(this.hi_pos == -1){
				this._highlightElem(len-1, true); // round
			}
		}
	}
	
	this.confirm = function() { 
		this.changeListener.onSearchConfirmed(field.value.capitalize()); 
		field.focus();
	}
	
	this.force = function(value){
		field.value = value;
		this.changeListener.onSearchConfirmed(value);
		field.focus();
	}
	
	this.error = function() { error_div.style.display = "block"; error_div.innerHTML = this.ERR_MESSAGE; }
	
	this._hideSelector = function(up) {
		if(this.selected_elem){
			this.selected_elem.remClassName(this.HI_STYLE);
		}
		this.selected_elem = null;
		field.value = this.initial_input;
		if(up) { this.hi_pos--;	} else { this.hi_pos++;	}
	}
	
	this._highlightElem = function(index, put_text) {
		if(this.selected_elem)	this.selected_elem.remClassName(this.HI_STYLE);
		if(typeof(index) == "number") {
			this.hi_pos = index;
		} else if (typeof(index) == "object"){
			this.hi_pos = this._getIndex(div, index);
		}
		this.selected_elem = div.childNodes[this.hi_pos];
		this.selected_elem.addClassName(this.HI_STYLE);
		if(put_text) field.value = this.selected_elem.innerHTML;
	}
	
	this._unhighlightElem = function(elem) {
		elem.remClassName(this.HI_STYLE);
	}
	
	this._getIndex = function(parent, elem) {
		var children = parent.childNodes;
		var len = children.length;
		for(var i=0; i < len; i++) { 
			if(children[i] == elem) return i;
		}
		return -1;
	}
	
	this.resetSelection = function() {
		this.hi_pos = -1;
		this.selected_elem = null;
	}
	
	this.findInSet = function(name) {
		var res = [];
		var reg = new RegExp("(^" + name + ".*|.+\ " + name + ".*(\ |$))", "i");
		
		for(var i = 0; i < set.length; i++){
			if(set[i].match(reg) && name != "") {
				res.push(set[i]);
			}
		}
		return res;
	}
	
	this.emptyField = function() { field.value = "" }
	this.clearResults = function() { error_div.style.display = "none"; div.innerHTML = ""; }
	
	this.fillResults = function() {
		for(var i = 0; i < this.result_set.length; i++) {
			var item = document.createElement("div");
			var txt = document.createTextNode(this.result_set[i]);
			item.appendChild(txt);
			div.appendChild(item);
			var self = this;
			item.addEventListener('click', function(e) {
				self._highlightElem(e.target, true);
				self.hide();
				self.confirm();
			}, false);
			item.addEventListener('mouseover', function(e){
				self._highlightElem(e.target);
			}, false);
			item.addEventListener('mouseout', function(e){
				self._unhighlightElem(e.target);
			}, false);
		}
	}
	
	this.show = function() { div.show(); /* this.adaptFrame(this.backFrame, true); */  this.shown = true; }
	this.hide = function() { div.hide(); /* this.adaptFrame(this.backFrame, false); */ this.shown = false; }
	
	this.adaptFrame = function(frame, toShow){
		if(toShow){
			frame.show();
			frame.style.left   = div.offsetLeft   + "px";
			frame.style.top    = div.offsetTop    + "px";
			frame.style.width  = div.offsetWidth  + "px";
			frame.style.height = div.offsetHeight + "px";
		} else frame.hide();
	}
	
	this.createBackFrame = function(){
		var e = document.createElement("iframe");
		e.setAttribute('id', 'backFrame');
		e.style.border = "0";
		e.style.width = "0";
		e.style.height = "0";
		e.style.position = "absolute";
		var iframe = document.body.appendChild(e);
		return e;
	}
	
	// this.backFrame = this.createBackFrame();
}
