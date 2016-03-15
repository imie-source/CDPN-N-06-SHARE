"use strict";

fr.imie.model = {};
fr.imie.model.Field = {
  state: {
    tanck: {
      writable:true
    },
    maturity: {
      writable:true
    },
    model: {
      writable:true
    },
    interval: {
      writable:true
    }
  },
  proto: {
    testMeth: function() {
      console.log("testMeth")
    },
    harvest: function(){
      this.maturity=0;
      this.model.totalCash+=40;
      this.model.totalHarvest++;
      this.model.notify();
    },
    water: function(){
      if(this.model.totalTanck>0){
        this.tanck++;
        this.model.totalTanck--;
        this.model.notify();
      }
    },
    resetGame: function(){
      this.tanck=5;
      this.maturity=0;
    },
    go : function(){
      this.tanck=3;
      this.maturity=0;
      this.interval=window.setInterval(function() {
        this.tanck=Math.max(this.tanck-1,0);
        if (this.tanck==0){
            this.maturity=0;
            this.model.verifyGameOver();
        }
        this.maturity++;
        this.model.notify();
      }.bind(this), 1000)
    },
    gameOver :function(){
      window.clearInterval(this.interval);
    },
    init: function(model) {
      this.model=model;



    },

  },
  build: function(model) {
    var obj = Object.create(this.proto, this.state);
    obj.init(model);
    return obj;
  }
}
