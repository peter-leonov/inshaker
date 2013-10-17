(function() {
  var _this = this;

  window._googleMapsHasLoaded = function() {
    return $(document).trigger('google_maps:map_ready');
  };

  $(document).on('google_maps:map_ready', function() {
    loadGoogleInfobox();
    $(document).trigger('google_maps:infobox_ready');
    return $(document).trigger('google_maps:ready');
  });

  $(function() {
    var script;

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=_googleMapsHasLoaded&language=ru-RU';
    document.body.appendChild(script);
  });

}).call(this);
window.loadGoogleInfobox = function () {
  window.InfoBox = function(a) {
      a = a || {};
      google.maps.OverlayView.apply(this, arguments);
      this.content_ = a.content || "";
      this.disableAutoPan_ = a.disableAutoPan || false;
      this.maxWidth_ = a.maxWidth || 0;
      this.pixelOffset_ = a.pixelOffset || new google.maps.Size(0, 0);
      this.position_ = a.position || new google.maps.LatLng(0, 0);
      this.zIndex_ = a.zIndex || null;
      this.boxClass_ = a.boxClass || "infoBox";
      this.boxStyle_ = a.boxStyle || {};
      this.closeBoxMargin_ = a.closeBoxMargin || "2px";
      this.closeBoxURL_ = a.closeBoxURL || "http://www.google.com/intl/en_us/mapfiles/close.gif";
      if (a.closeBoxURL === "") {
          this.closeBoxURL_ = ""
      }
      this.infoBoxClearance_ = a.infoBoxClearance || new google.maps.Size(1, 1);
      if (typeof a.visible === "undefined") {
          if (typeof a.isHidden === "undefined") {
              a.visible = true
          } else {
              a.visible = !a.isHidden
          }
      }
      this.isHidden_ = !a.visible;
      this.alignBottom_ = a.alignBottom || false;
      this.pane_ = a.pane || "floatPane";
      this.enableEventPropagation_ = a.enableEventPropagation || false;
      this.div_ = null;
      this.closeListener_ = null;
      this.moveListener_ = null;
      this.contextListener_ = null;
      this.eventListeners_ = null;
      this.fixedWidthSet_ = null
  }
  InfoBox.prototype = new google.maps.OverlayView();
  InfoBox.prototype.createInfoBoxDiv_ = function () {
      var i;
      var f;
      var a;
      var d = this;
      var c = function (e) {
          e.cancelBubble = true;
          if (e.stopPropagation) {
              e.stopPropagation()
          }
      };
      var b = function (e) {
          e.returnValue = false;
          if (e.preventDefault) {
              e.preventDefault()
          }
          if (!d.enableEventPropagation_) {
              c(e)
          }
      };
      if (!this.div_) {
          this.div_ = document.createElement("div");
          this.setBoxStyle_();
          if (typeof this.content_.nodeType === "undefined") {
              this.div_.innerHTML = this.getCloseBoxImg_() + this.content_
          } else {
              this.div_.innerHTML = this.getCloseBoxImg_();
              this.div_.appendChild(this.content_)
          }
          this.getPanes()[this.pane_].appendChild(this.div_);
          this.addClickHandler_();
          if (this.div_.style.width) {
              this.fixedWidthSet_ = true
          } else {
              if (this.maxWidth_ !== 0 && this.div_.offsetWidth > this.maxWidth_) {
                  this.div_.style.width = this.maxWidth_;
                  this.div_.style.overflow = "auto";
                  this.fixedWidthSet_ = true
              } else {
                  a = this.getBoxWidths_();
                  this.div_.style.width = (this.div_.offsetWidth - a.left - a.right) + "px";
                  this.fixedWidthSet_ = false
              }
          }
          this.panBox_(this.disableAutoPan_);
          if (!this.enableEventPropagation_) {
              this.eventListeners_ = [];
              f = ["mousedown", "mouseover", "mouseout", "mouseup", "click", "dblclick", "touchstart", "touchend", "touchmove"];
              for (i = 0; i < f.length; i++) {
                  this.eventListeners_.push(google.maps.event.addDomListener(this.div_, f[i], c))
              }
              this.eventListeners_.push(google.maps.event.addDomListener(this.div_, "mouseover", function (e) {
                  this.style.cursor = "default"
              }))
          }
          this.contextListener_ = google.maps.event.addDomListener(this.div_, "contextmenu", b);
          google.maps.event.trigger(this, "domready")
      }
  };
  InfoBox.prototype.getCloseBoxImg_ = function () {
      var a = "";
      if (this.closeBoxURL_ !== "") {
          a = "<img";
          a += " src='" + this.closeBoxURL_ + "'";
          a += " align=right";
          a += " style='";
          a += " position: relative;";
          a += " cursor: pointer;";
          a += " margin: " + this.closeBoxMargin_ + ";";
          a += "'>"
      }
      return a
  };
  InfoBox.prototype.addClickHandler_ = function () {
      var a;
      if (this.closeBoxURL_ !== "") {
          a = this.div_.firstChild;
          this.closeListener_ = google.maps.event.addDomListener(a, "click", this.getCloseClickHandler_())
      } else {
          this.closeListener_ = null
      }
  };
  InfoBox.prototype.getCloseClickHandler_ = function () {
      var a = this;
      return function (e) {
          e.cancelBubble = true;
          if (e.stopPropagation) {
              e.stopPropagation()
          }
          google.maps.event.trigger(a, "closeclick");
          a.close()
      }
  };
  InfoBox.prototype.panBox_ = function (d) {
      var m;
      var n;
      var e = 0,
          yOffset = 0;
      if (!d) {
          m = this.getMap();
          if (m instanceof google.maps.Map) {
              if (!m.getBounds().contains(this.position_)) {
                  m.setCenter(this.position_)
              }
              n = m.getBounds();
              var a = m.getDiv();
              var h = a.offsetWidth;
              var f = a.offsetHeight;
              var k = this.pixelOffset_.width;
              var l = this.pixelOffset_.height;
              var g = this.div_.offsetWidth;
              var b = this.div_.offsetHeight;
              var i = this.infoBoxClearance_.width;
              var j = this.infoBoxClearance_.height;
              var o = this.getProjection().fromLatLngToContainerPixel(this.position_);
              if (o.x < (-k + i)) {
                  e = o.x + k - i
              } else if ((o.x + g + k + i) > h) {
                  e = o.x + g + k + i - h
              }
              if (this.alignBottom_) {
                  if (o.y < (-l + j + b)) {
                      yOffset = o.y + l - j - b
                  } else if ((o.y + l + j) > f) {
                      yOffset = o.y + l + j - f
                  }
              } else {
                  if (o.y < (-l + j)) {
                      yOffset = o.y + l - j
                  } else if ((o.y + b + l + j) > f) {
                      yOffset = o.y + b + l + j - f
                  }
              } if (!(e === 0 && yOffset === 0)) {
                  var c = m.getCenter();
                  m.panBy(e, yOffset)
              }
          }
      }
  };
  InfoBox.prototype.setBoxStyle_ = function () {
      var i, boxStyle;
      if (this.div_) {
          this.div_.className = this.boxClass_;
          this.div_.style.cssText = "";
          boxStyle = this.boxStyle_;
          for (i in boxStyle) {
              if (boxStyle.hasOwnProperty(i)) {
                  this.div_.style[i] = boxStyle[i]
              }
          }
          if (typeof this.div_.style.opacity !== "undefined" && this.div_.style.opacity !== "") {
              this.div_.style.filter = "alpha(opacity=" + (this.div_.style.opacity * 100) + ")"
          }
          this.div_.style.position = "absolute";
          this.div_.style.visibility = 'hidden';
          if (this.zIndex_ !== null) {
              this.div_.style.zIndex = this.zIndex_
          }
      }
  };
  InfoBox.prototype.getBoxWidths_ = function () {
      var c;
      var a = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
      };
      var b = this.div_;
      if (document.defaultView && document.defaultView.getComputedStyle) {
          c = b.ownerDocument.defaultView.getComputedStyle(b, "");
          if (c) {
              a.top = parseInt(c.borderTopWidth, 10) || 0;
              a.bottom = parseInt(c.borderBottomWidth, 10) || 0;
              a.left = parseInt(c.borderLeftWidth, 10) || 0;
              a.right = parseInt(c.borderRightWidth, 10) || 0
          }
      } else if (document.documentElement.currentStyle) {
          if (b.currentStyle) {
              a.top = parseInt(b.currentStyle.borderTopWidth, 10) || 0;
              a.bottom = parseInt(b.currentStyle.borderBottomWidth, 10) || 0;
              a.left = parseInt(b.currentStyle.borderLeftWidth, 10) || 0;
              a.right = parseInt(b.currentStyle.borderRightWidth, 10) || 0
          }
      }
      return a
  };
  InfoBox.prototype.onRemove = function () {
      if (this.div_) {
          this.div_.parentNode.removeChild(this.div_);
          this.div_ = null
      }
  };
  InfoBox.prototype.draw = function () {
      this.createInfoBoxDiv_();
      var a = this.getProjection().fromLatLngToDivPixel(this.position_);
      this.div_.style.left = (a.x + this.pixelOffset_.width) + "px";
      if (this.alignBottom_) {
          this.div_.style.bottom = -(a.y + this.pixelOffset_.height) + "px"
      } else {
          this.div_.style.top = (a.y + this.pixelOffset_.height) + "px"
      } if (this.isHidden_) {
          this.div_.style.visibility = 'hidden'
      } else {
          this.div_.style.visibility = "visible"
      }
  };
  InfoBox.prototype.setOptions = function (a) {
      if (typeof a.boxClass !== "undefined") {
          this.boxClass_ = a.boxClass;
          this.setBoxStyle_()
      }
      if (typeof a.boxStyle !== "undefined") {
          this.boxStyle_ = a.boxStyle;
          this.setBoxStyle_()
      }
      if (typeof a.content !== "undefined") {
          this.setContent(a.content)
      }
      if (typeof a.disableAutoPan !== "undefined") {
          this.disableAutoPan_ = a.disableAutoPan
      }
      if (typeof a.maxWidth !== "undefined") {
          this.maxWidth_ = a.maxWidth
      }
      if (typeof a.pixelOffset !== "undefined") {
          this.pixelOffset_ = a.pixelOffset
      }
      if (typeof a.alignBottom !== "undefined") {
          this.alignBottom_ = a.alignBottom
      }
      if (typeof a.position !== "undefined") {
          this.setPosition(a.position)
      }
      if (typeof a.zIndex !== "undefined") {
          this.setZIndex(a.zIndex)
      }
      if (typeof a.closeBoxMargin !== "undefined") {
          this.closeBoxMargin_ = a.closeBoxMargin
      }
      if (typeof a.closeBoxURL !== "undefined") {
          this.closeBoxURL_ = a.closeBoxURL
      }
      if (typeof a.infoBoxClearance !== "undefined") {
          this.infoBoxClearance_ = a.infoBoxClearance
      }
      if (typeof a.isHidden !== "undefined") {
          this.isHidden_ = a.isHidden
      }
      if (typeof a.visible !== "undefined") {
          this.isHidden_ = !a.visible
      }
      if (typeof a.enableEventPropagation !== "undefined") {
          this.enableEventPropagation_ = a.enableEventPropagation
      }
      if (this.div_) {
          this.draw()
      }
  };
  InfoBox.prototype.setContent = function (a) {
      this.content_ = a;
      if (this.div_) {
          if (this.closeListener_) {
              google.maps.event.removeListener(this.closeListener_);
              this.closeListener_ = null
          }
          if (!this.fixedWidthSet_) {
              this.div_.style.width = ""
          }
          if (typeof a.nodeType === "undefined") {
              this.div_.innerHTML = this.getCloseBoxImg_() + a
          } else {
              this.div_.innerHTML = this.getCloseBoxImg_();
              this.div_.appendChild(a)
          } if (!this.fixedWidthSet_) {
              this.div_.style.width = this.div_.offsetWidth + "px";
              if (typeof a.nodeType === "undefined") {
                  this.div_.innerHTML = this.getCloseBoxImg_() + a
              } else {
                  this.div_.innerHTML = this.getCloseBoxImg_();
                  this.div_.appendChild(a)
              }
          }
          this.addClickHandler_()
      }
      google.maps.event.trigger(this, "content_changed")
  };
  InfoBox.prototype.setPosition = function (a) {
      this.position_ = a;
      if (this.div_) {
          this.draw()
      }
      google.maps.event.trigger(this, "position_changed")
  };
  InfoBox.prototype.setZIndex = function (a) {
      this.zIndex_ = a;
      if (this.div_) {
          this.div_.style.zIndex = a
      }
      google.maps.event.trigger(this, "zindex_changed")
  };
  InfoBox.prototype.setVisible = function (a) {
      this.isHidden_ = !a;
      if (this.div_) {
          this.div_.style.visibility = (this.isHidden_ ? "hidden" : "visible")
      }
  };
  InfoBox.prototype.getContent = function () {
      return this.content_
  };
  InfoBox.prototype.getPosition = function () {
      return this.position_
  };
  InfoBox.prototype.getZIndex = function () {
      return this.zIndex_
  };
  InfoBox.prototype.getVisible = function () {
      var a;
      if ((typeof this.getMap() === "undefined") || (this.getMap() === null)) {
          a = false
      } else {
          a = !this.isHidden_
      }
      return a
  };
  InfoBox.prototype.show = function () {
      this.isHidden_ = false;
      if (this.div_) {
          this.div_.style.visibility = "visible"
      }
  };
  InfoBox.prototype.hide = function () {
      this.isHidden_ = true;
      if (this.div_) {
          this.div_.style.visibility = "hidden"
      }
  };
  InfoBox.prototype.open = function (c, b) {
      var a = this;
      if (b) {
          this.position_ = b.getPosition();
          this.moveListener_ = google.maps.event.addListener(b, "position_changed", function () {
              a.setPosition(this.getPosition())
          })
      }
      this.setMap(c);
      if (this.div_) {
          this.panBox_()
      }
  };
  InfoBox.prototype.close = function () {
      var i;
      if (this.closeListener_) {
          google.maps.event.removeListener(this.closeListener_);
          this.closeListener_ = null
      }
      if (this.eventListeners_) {
          for (i = 0; i < this.eventListeners_.length; i++) {
              google.maps.event.removeListener(this.eventListeners_[i])
          }
          this.eventListeners_ = null
      }
      if (this.moveListener_) {
          google.maps.event.removeListener(this.moveListener_);
          this.moveListener_ = null
      }
      if (this.contextListener_) {
          google.maps.event.removeListener(this.contextListener_);
          this.contextListener_ = null
      }
      this.setMap(null)
  };
}
;
(function() {
  this.InShakerMap = (function() {
    InShakerMap.prototype.el = null;

    InShakerMap.prototype.CONTROL_STEP = 100;

    function InShakerMap(selector, options) {
      var el;

      this.el = el = $(selector);
      this.map = new google.maps.Map(this.el[0], options);
      google.maps.event.addListenerOnce(this.map, 'idle', function() {
        return el.removeClass('calculation');
      });
      this;
    }

    InShakerMap.prototype.addControls = function() {
      var container, controlUI, map, step;

      step = this.CONTROL_STEP;
      map = this.map;
      container = $(this.map.getDiv());
      controlUI = $('<ul class="position-control inshaker-controls"><li class="to-top" data-map-action="top"></li><li class="to-right" data-map-action="right"></li><li class="to-bottom" data-map-action="bottom"></li><li class="to-left" data-map-action="left"></li><li class="to-plus" data-map-action="plus"></li><li class="to-minus" data-map-action="minus"></li></ul>');
      container.append(controlUI);
      map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlUI[0]);
      controlUI.on('click', "li", function(e) {
        var action;

        action = e.target.getAttribute('data-map-action');
        switch (action) {
          case "top":
            return map.panBy(0, -step);
          case "right":
            return map.panBy(step, 0);
          case "bottom":
            return map.panBy(0, step);
          case "left":
            return map.panBy(-step, 0);
          case "plus":
            return map.setZoom(map.getZoom() + 1);
          case "minus":
            return map.setZoom(map.getZoom() - 1);
        }
      });
      return controlUI;
    };

    InShakerMap.prototype.addCloseButton = function() {
      var closeUI, map;

      map = this.map;
      closeUI = $('<a href="#" class="close">Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ ÐºÐ°Ñ€Ñ‚Ñƒ</a>');
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(closeUI[0]);
      return closeUI;
    };

    InShakerMap.prototype.addInfoBox = function(marker, options) {
      var infoBox, map, myOptions;

      if (options == null) {
        options = {};
      }
      map = this.map;
      myOptions = {
        content: options.content,
        disableAutoPan: false,
        maxWidth: 0,
        pixelOffset: new google.maps.Size(-110, 10),
        zIndex: null,
        boxClass: options.className,
        closeBoxMargin: "10px 2px 2px 2px",
        closeBoxURL: options.closeButton ? "http://www.google.com/intl/en_us/mapfiles/close.gif" : "",
        infoBoxClearance: new google.maps.Size(1, 1),
        isHidden: true,
        pane: "floatPane",
        enableEventPropagation: false
      };
      infoBox = new InfoBox(myOptions);
      if (options.bindOnClick) {
        google.maps.event.addListener(marker, "mouseover", function(e) {
          return infoBox.setVisible(true);
        });
        google.maps.event.addListener(marker, "mouseout", function(e) {
          return infoBox.setVisible(false);
        });
      }
      infoBox.open(map, marker);
      return infoBox;
    };

    InShakerMap.prototype.addMarker = function(options) {
      var marker;

      if (options == null) {
        options = {};
      }
      marker = new google.maps.Marker({
        position: options.position,
        icon: options.icon,
        map: this.map
      });
      return marker;
    };

    return InShakerMap;

  })();

}).call(this);
(function() {
  $(document).on('google_maps:ready', function() {
    var mapWidget, marker;

    mapWidget = new InShakerMap("#map", {
      center: new google.maps.LatLng(55.783016, 37.599892),
      zoom: 14,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      mapTypeControl: false,
      navigationControl: true,
      scaleControl: false
    });
    mapWidget.addControls();
    mapWidget.addCloseButton();
    marker = mapWidget.addMarker({
      icon: "/assets/icon-map-marker.png",
      position: new google.maps.LatLng(55.783016, 37.599892)
    });
    return mapWidget.addInfoBox(marker, {
      className: "inshaker-popup",
      content: "<div class='title'>ÐšÐ¾ÐºÑ‚ÐµÐ¹Ð»ÑŒÐ½Ñ‹Ð¹ Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½</div><div class='body'>ÐœÐ¾ÑÐºÐ²Ð°, ÑƒÐ». Ð¡ÑƒÑ‰ÐµÐ²ÑÐºÐ°Ñ, 27Ñ2</div>",
      closeButton: false,
      bindOnClick: true
    });
  });

}).call(this);





$(function() {
  return $("#promo").on("click", "#promo-toggler, #map .close", function() {
    $("#image").fadeToggle();
    $("#map").fadeToggle();
    $("#promo-toggler").toggleClass('active');
    return false;
  });
});
