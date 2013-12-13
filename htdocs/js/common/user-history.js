;(function(){
// page history accumulator

var STORAGE_KEY = 'inshaker.user_history'
var START_DELAY = 1000 // ms; never less or equal to zero!
var DELAY_FACTOR = 1.1 // ms; never less or equal to zero!
var MAX_RECORDS = 100 // erase extra ones
var HTTP_ROOT = 'http://www.inshaker.ru'

var DATEi = 0
var DURATIONi = 1
var TITLEi = 2
var URIi = 3

window.UserHistory =
{
  history: null, // plain array, new first
  
  init: function ()
  {
    this.history = []
    var str = this.readStorageValue()
    if (str)
    {
      try {  this.history = JSON.parse(str)  }
      catch (e) { /* TODO: scream to error log */ }
    }
  },
  
  createNewRecord: function ()
  {
    // the new row in our database
    var record = []
    this.history.unshift(record)
    if (this.history.length > MAX_RECORDS)
      this.history.length = MAX_RECORDS
    return record
  },
  
  track: function ()
  {
    this.init()
    
    // the moment of tracking start
    var start = +new Date()
    
    // fill up our record
    var record = this.createNewRecord()
    record[DATEi] = Math.round(start / 1000)
    record[DURATIONi] = 0
    record[TITLEi] = this.getPageName()
    record[URIi] = this.getPageURI()
    
    
    var me = this
    var delay = START_DELAY
    function update ()
    {
      // console.log(delay, Math.round(Math.log(delay / START_DELAY) / Math.log(DELAY_FACTOR)))
      window.setTimeout(update, delay *= DELAY_FACTOR)
      
      // the payload
      record[DURATIONi] = Math.round((new Date() - start) / 1000)
      // console.log(record[DURATIONi])
      me.commit()
    }
    update()
  },
  
  // private
  
  commit: function ()
  {
    this.writeStorageValue(JSON.stringify(this.history))
  },
  
  readStorageValue: function ()
  {
    return window.localStorage.getItem(STORAGE_KEY)
  },
  writeStorageValue: function (v)
  {
    return window.localStorage.setItem(STORAGE_KEY, v)
  },
  
  // universal commodity/page name fetcher
  getPageName: function ()
  {
    // get the first part of a compaund page title
    var first = document.title.split(/\s*—/)[0]
    // try to fetch the commodity name in quotes
    var name = /«(.+)»/.exec(first)
    // return either the matched name or the full first part
    return name ? name[1] : first
  },
  getPageURI: function ()
  {
    return location.pathname + location.search
  },
  
  // public
  
  report: function ()
  {
    function duration (secs)
    {
      var mins = Math.floor(secs / 60)
      secs %= 60
      
      return mins + ':' + (secs < 10 ? '0'+secs : secs)
    }
    
    var report = '<table cellspacing="10">'
    for (var i = 0, il = this.history.length; i < il; i++)
    {
      var record = this.history[i]
      
      report += '<tr>'
        report += '<td>' + new Date(record[DATEi]*1000).toRusDate() + '</td>'
        report += '<td><b>' + duration(record[DURATIONi]) + '</b></td>'
        report += '<td><a href="'+HTTP_ROOT+record[URIi]+'">' + record[TITLEi] + '</a></td>'
      report += '</tr>'
    }
    report += '</table>'
    
    return report
  }
}

})();
