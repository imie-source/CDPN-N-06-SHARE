"use strict";

fr.imie.Utils={
  state:{
  },
  proto:{
    init:function(){

    },
    mixin: function(source, target) {
      for (var key in source.proto) {
        if (!target.proto[key]) {
          target.proto[key] = source.proto[key];
        }
      }
      for (var key in source.state) {
        if (!target.state[key]) {
          target.state[key] = source.state[key];
        }
      }
    }
  },
  build:function(){
    return Object.create(this.proto,this.state);
  }
}
