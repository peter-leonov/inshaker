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

function v_show ()
{
  popup.show()

  // lazy load heavy widgets
  var nodes = $$('iframe', popup)
  for (var i = 0, il = nodes.length; i < il; i++)
    nodes[i].src = nodes[i].getAttribute('lazy-src')
}

// model

if (window.localStorage.getItem('subscribe-widget-state') == 'shown')
  return

function subscribe (email)
{
  if (!/@/.test(email))
    return // better filter it right here

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

  window.setTimeout(hide, 250)

  // looks like all went well, then track
  Tracker.event('subscribe-popup', 'subscribe', Geo.city)
}

function m_show ()
{
  v_show()

  // confirm user has viewed the popup
  window.localStorage.setItem('subscribe-widget-state', 'shown')

  // looks like all went well, then track
  Tracker.event('subscribe-popup', 'show', Geo.city)
}

$.load('http://geoiplookup.wikimedia.org/').onload = function m_check_geo ()
{
  if (!Geo)
    return // error at server side

  if (!(REGION.lat(Geo.lat) && REGION.lng(Geo.lon)))
    return // located outside of Moscow region

  m_show()
}

});
