<!--# include file="/js/common/autocompleter.js" -->
<!--# include file="/lib/Programica/Request.js" -->
<!--# include file="/lib/Programica/Form.js" -->
<!--# include file="/lib/Programica/Widget.js" -->
<!--# include file="/lib/Widgets/FormPoster.js" -->

$.onload(function(){
	link = new Link();
	Calculator.init();
	
	var ERROR_CLASS = 'error';
	var FORM_ID     = 'search_form';
	var METRO_ID    = 'search_input';
	var SUBMIT_ID   = 'button_submit';
	
	var LEGAL_DIV   = 'legal_info';
	var METRO_DIV   = 'metro_info';

	var SUBMIT_DISABLED_CLASS = "bt-send-disabled";
	var SUBMIT_ENABLED_CLASS  = "bt-send";	
	
	var HIDE_CLASS = "hide_control";
	
	var CONTEXT = window.location.href.match(/.+\/(.+).html/).last();
		
	if(CONTEXT == "order" && $('order_button')) $('order_button').hide();
	else if(CONTEXT == "call_barmen") {
		$('call_barmen').hide();
		if($('order_button')) $('order_button').hide();
	}
	
	var autocompleter = new Autocompleter(metro_stations);
	autocompleter.changeListener = this;
	this.onSearchConfirmed = function(text){
		$(METRO_ID).remClassName(ERROR_CLASS);
	};
	
	var li = $(LEGAL_DIV);
	$('face_phys').addEventListener('click', function(e){
		squeezeNode(li);
	}, false);
	
	$('face_legal').addEventListener('click', function(e){
		inflateNode(li);
	}, false);
	
	var mi = $(METRO_DIV);
	mi.style.height = mi.offsetHeight + "px";
	$('city_moscow').addEventListener('click', function(e){
		inflateNode(mi);
	}, false);
	
	$('city_mo').addEventListener('click', function(e){
		squeezeNode(mi);
	}, false);
	
	$(SUBMIT_ID).addEventListener('click', function(e){
		if(checkSum() && validateForm()) {
			var fh = $(FORM_ID).toHash();
			var html = fh["firstname"] + " " + fh["lastname"] + "<br/>";
			html += fh["email"] + "<br/>";
			html += fh["phone11"] + " (" + fh["phone12"] + ") " + fh["phone13"] + "<br/>"; 
			html += fh["phone21"] + " (" + fh["phone22"] + ") " + fh["phone23"] + "<br/>";
			if(fh["face"] == "face_legal"){
				html += fh["legal_name"] + "<br/>";
				html += "ИНН: " + fh["inn"] + "<br/>";
				html += "КПП: " + fh["kpp"] + "<br/>";
			}
			var _area = (fh["area"] == "city_moscow") ? "г.Москва, " : "Московская область, ";
			html += "Адрес: " + _area + fh["address"] + "<br/>";
			if(fh["area"] == "city_moscow") html += "Метро " + fh["metro"] + "<br/>";
			var _time = (CONTEXT == "order") ? "Удобное время" : "Время работы бара";
			html += "<br/>Заказ на " + fh["date"] + ". " + _time + " - с " + fh["time1"] + " до " + fh["time2"] + "<br/><br/>";
			if(fh["comments"] != "") html += "Комментарии: " + fh["comments"] + "<br/>";
			
			var _cocktails = Calculator.getShopList().cocktails;
			html += "Коктейли:<ul>"
			for(var i = 0; i < _cocktails.length; i++){
				html += "<li>" + _cocktails[i][0].name + " – " + _cocktails[i][1] + "</li>";
			}
			html += "</ul>";
			
			var _goods = Calculator.getShopList().goods;
			html += "Товары: <ol>";
			for(name in _goods){
				var bottles = _goods[name].bottles;
        	    for(id in bottles){
					var txt = "<li>" + GoodHelper.getIngredText(name);
					if(GoodHelper.isBottled(goods[name][0])){
			            txt += " (" + bottles[id].vol[0] + " " + GoodHelper.pluralTxt(bottles[id].vol[0], goods[name][0].unit);
			            txt += ")";
			        }
					txt += " - " + bottles[id].count + " " + GoodHelper.pluralTxt(bottles[id].count, "штуки");
					txt += "</li>";
					html += txt;
				}
			}
			html += "</ol>";
			html += "<br/><br/>Сумма заказа: " + Calculator.getSum() + " рублей";
			
			var add_email = (CONTEXT == "order") ? "me@alcomag.ru" : "";
			var req = aPost("/act/order.cgi", {email: fh["email"], html: html, order_type: fh["order_type"], add_email: add_email});
			req.onSuccess = function(){
				alert("Ваш заказ был отправлен. Спасибо!");
				$(FORM_ID).reset();
				resetRadio(false);
			}
			req.onError = function(){
				alert("Во время отправки заказа произошла ошибка. Попробуйте еще раз.")
			}
		}
		
 		e.preventDefault();
	}, false);

	
	var validateForm = function(){
		var inputs = Array.copy($(FORM_ID).getElementsByTagName("input"));
		inputs.push($('address'));
		var formValid = true;
		
		for(var i = 0; i < inputs.length; i++){
			var fieldValid = validateField(inputs[i]);
			formValid = formValid && fieldValid;
			if(!fieldValid) inputs[i].addClassName(ERROR_CLASS); else inputs[i].remClassName(ERROR_CLASS);
			
			inputs[i].addEventListener('keyup', function(e){
				if(validateField(this)) this.remClassName(ERROR_CLASS)
				else this.addClassName(ERROR_CLASS)
			}, false);
		}
		if(!formValid) alert("Некоторые поля формы заполнены некорректно. Пожалуйста, проверьте форму.")
		return formValid;
	};
	
	var validateField = function(input){
		if(input.id == "email"){
			return checkEmail(input.value);
		} else if(["legal_name", "inn", "kpp"].indexOf(input.id) > -1){
			return !($('face_legal').checked && (input.value == ""));
		} else if(input.id == METRO_ID){
			return !($('city_moscow').checked && (input.value==""));
		} else if(input.id == "phone13" || input.id == "phone23"){
			return checkPhone(input.value);
		} else if(input.id == "phone12" || input.id == "phone22"){
			return validateNumeric(input.value);
		} else {
			return (input.value != "");
		}
	};
	
	// TODO: move to util.js
	var checkEmail = function(email) {
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return filter.test(email);
	}
	
	// TODO: move to util.js
	var checkPhone = function(phone){
		var filter = /^[\d\+\-]{7,9}$/;
		return filter.test(phone);
	}
	
	// TODO: move to util.js	
	var validateNumeric = function(txt){
		if(txt.match(/^\d+$/)) return true;
		return false;
	};
	
	var checkSum = function(){
		if(Calculator.checkSum(CONTEXT)) {
			$(SUBMIT_ID).className = SUBMIT_ENABLED_CLASS;
			$('order_more').hide();
			return true;
		} else {
			$(SUBMIT_ID).className = SUBMIT_DISABLED_CLASS;
			$('order_more').show();
			return false;
		}
	};
	
	var initDateSelector = function(){
		var today = new Date();
		
		var parent = $('date_selector');
		var select = document.createElement("select");
		select.name = "date";
		select.id = "date_control";
		parent.appendChild(select);
		
		for(var i = 1; i < 14; i++){
			var day = new Date();
			day.setDate(today.getDate()+i);
			var option = document.createElement("option");
			option.value = day.getDate() + "-" + (day.getMonth()+1) + "-" + day.getFullYear();
			option.innerHTML = day.getFormatted();
			select.appendChild(option);
		}
	};
	
	var disableEnter = function(){
		var col = $(FORM_ID).getElementsByTagName("input");
		for(var i = 0; i < col.length; i++){
			if(col[i].type == "text") {
				col[i].addEventListener('keypress', function(e){
					if(e.keyCode == autocompleter.KEY_ENTER) e.preventDefault();
				}, false);
			}
		}
	};
	
	var squeezeNode = function(node){ node.animate("easeInCubic", {height: 0}, 0.15) };
	var inflateNode = function(node){ node.animate("easeInCubic", {height: node.scrollHeight}, 0.15) };
	
	var resetRadio = function(init){
		$('city_moscow').checked = "checked";
		if($(METRO_DIV).offsetHeight == 0 && !init) inflateNode($(METRO_DIV));
		$('face_phys').checked = "checked";
		if($(LEGAL_DIV).offsetHeight  > 0 && !init) squeezeNode($(LEGAL_DIV)); 
	};
	
	checkSum();
	initDateSelector();
	disableEnter();
	resetRadio(true);
	Calculator.addChangeListener({ modelChanged: function(){ checkSum(); } });
	
	// IE inputs work-around
	Calculator.setPopupStatusListener({
		popupShown: function(){
			$('date_control').addClassName(HIDE_CLASS);
			$('time1').addClassName(HIDE_CLASS);
			$('time2').addClassName(HIDE_CLASS);
		},
		popupHidden: function(){
			$('date_control').remClassName(HIDE_CLASS);
			$('time1').remClassName(HIDE_CLASS);
			$('time2').remClassName(HIDE_CLASS);
		}
	});
	
	var pos = {};
	if(Programica.userAgentRegExps.MSIE.test(navigator.userAgent)){
		var iePos = $(METRO_ID).getBoundingClientRect();
		pos.x = iePos.left + $('label_metro').offsetWidth + 1;
		pos.y = iePos.top + document.documentElement.scrollTop + 3;
	} else {
		pos = getPosition($(METRO_ID));
		pos.y += $(METRO_ID).offsetHeight;
	}
	$('autocomplete').style.left = pos.x + "px";
	$('autocomplete').style.top  = pos.y + "px";
})