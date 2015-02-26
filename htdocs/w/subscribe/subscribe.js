$.onready(function(){

function range (l, h) { return function (v) { return l <= v && v <= h } }

var CENTER = {lat: 55.7500, lng: 37.6167}
var REGION =
{
  lat: range(CENTER.lat - 1, CENTER.lat + 1),
  lng: range(CENTER.lng - 1, CENTER.lng + 1)
}

// view

var popup = $('#subscribe-popup')
if (!popup)
  return

// prefer to touch not the Popup class at all
function hide () { popup.hide() }
$('.popup-back',     popup).addEventListener('click', hide, false)
$('.popup-controls', popup).addEventListener('click', hide, false)
$('.sale .login',    popup).addEventListener('click', hide, false)


// model

var state = false//window.localStorage.getItem('subscribe-widget-state')
if (state == 'shown')
  return
window.localStorage.setItem('subscribe-widget-state', 'shown')

$.load('http://geoiplookup.wikimedia.org/').onload = function ()
{
  if (!Geo)
    return // error at server side

  if (!(REGION.lat(Geo.lat) && REGION.lng(Geo.lon)))
    return // located outside of Moscow region

  Tracker.event('subscribe-popup', 'show', Geo.city)

  popup.show()
}

});
