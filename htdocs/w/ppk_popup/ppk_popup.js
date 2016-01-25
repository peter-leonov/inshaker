var popup={
	init:function(){
		this.popup = document.getElementById('ppk_popup');
		popup.show();
	},
	show:function(){
		this.popup.classList.add('open');
		return false;
	},
	close:function(){
		this.popup.classList.remove('open');
		this.popup.classList.add('close');
		setTimeout(function(){
			document.getElementById('ppk_popup').classList.remove('close');
		},600);
		return false;
	},
	changeLocation:function(){
		this.popup.classList.remove('open');
		this.popup.classList.add('close');
		setTimeout(function(){
			document.getElementById('ppk_popup').classList.remove('close');
		},600);
	}
};
window.onload=function(){
  if (!$('#ppk_popup'))
    return
	popup.init();
};