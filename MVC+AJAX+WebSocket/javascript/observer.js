"use strict";

fr.imie.Observer={
  state:{
  },
  proto:{
    init:function(){},
    update:function(){}
  },
  build:function(){

    return Object.create(this.proto,this.state);
  }
}
