;
(function() {
   var Papa = BarmensPage;
   var Me = Papa.Model;

   var myProto = {
      initialize: function() {
         this.sources = {};
         this.state = {};
      },
      bind: function(sources) {
         this.sources = sources;
      },
      setState: function(state) {
         this.state = state;
         this.word = this.sources.words[state.selected]
         this.view.modelChanged(this.word)
      }
   };

   Object.extend(Me.prototype, myProto);
})();