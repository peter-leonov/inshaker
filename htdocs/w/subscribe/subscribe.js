!function(){

function onready ()
{
  var popup = $('#subscribe-popup')
  if (!popup)
    return

  // preferred do not touch Popup class at all
  function hide () { popup.hide() }
  $('.popup-back',     popup).addEventListener('click', hide, false)
  $('.popup-controls', popup).addEventListener('click', hide, false)
}

$.onready(onready)

}();
