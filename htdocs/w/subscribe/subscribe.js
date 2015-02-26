<!--# include virtual="/js/common/event-logger.js" -->

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
$('.sale form',      popup).addEventListener('submit', function (e) { e.preventDefault(); subscribe(this.email.value) }, false)


// model

var state = window.localStorage.getItem('subscribe-widget-state')
if (state == 'shown')
  return
window.localStorage.setItem('subscribe-widget-state', 'shown')

function subscribe (email)
{
  if (!/@/.test(email))
    return // better filter it right here

  Tracker.event('subscribe-popup', 'subscribe', Geo.city)

  EventLogger.log('subscribe', email, Geo.city, Geo.country)

  // backup copy to gmail
  Mail.send({
    subject: 'Подписка на акции',
    to: 'subscribe@mg.inshaker.ru',
    from: email,
    html: 'City: ' + Geo.city + '<br/>Country: ' + Geo.country
  })

  // add directly to the MailChimp list
  new Image().src = 'http://inshaker.us10.list-manage.com/subscribe/post?u=3750249e6abbaabf6c38e93bf&id=eded7a8b18&EMAIL=' + email + '&ac=' + (+new Date())

  hide()
}

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
