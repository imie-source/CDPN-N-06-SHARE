"use strict";

fr.imie.Model = {
  state: {
    fields: {
      writable: true
    },
    totalTanck: {
      writable: true,
      value: 3
    },
    totalCash: {
      writable: true,
      value: 50
    },
    totalHarvest: {
      writable: true,
      value: 0
    },
    scores: {
      writable: true
    },
    playerName: {
      writable: true
    },
  },
  proto: {
    init: function() {
      fr.imie.Observable.proto.init.call(this);
      this.scores = [];
      this.fields = [];
      this.fields.push(fr.imie.model.Field.build(this));
      this.fields.push(fr.imie.model.Field.build(this));
      this.fields.push(fr.imie.model.Field.build(this));
    },
    buyWater: function(water) {
      this.totalTanck += water;
      this.totalCash -= water;
      this.notify();
    },
    refreshScore: function() {
      console.log('refresh');
      $.ajax({
        url: "https://api.mongolab.com/api/1/databases/dryfield/collections/gamescore/?apiKey=KNNaG3ONbKo7nmQ-Ca8d3eSNU8JfAs-P",
        type: 'get',
        timeout: 1000
      }).done(function(datas) {

        this.scores = datas;
        this.notify();
      }.bind(this)).fail(function() {
        //console.log('fail');
        this.notify();
      }.bind(this));
    },
    go: function() {
      for (var field of this.fields) {
        field.go();
      }
    },
    getConcatScore: function() {
      return this.scores;
    },
    gameOver: function() {
      for (var field of this.fields) {
        field.gameOver();
      }

      $.ajax({
        url: "https://api.mongolab.com/api/1/databases/dryfield/collections/gamescore/?apiKey=KNNaG3ONbKo7nmQ-Ca8d3eSNU8JfAs-P",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
          player: this.playerName,
          score: this.totalHarvest
        })
      }).done(function(datas) {
        this.scores.push(datas);
        this.notify();
      }.bind(this)).fail(function() {
        console.log('pas se synchro possible pour le moment');
        this.notify();
      }.bind(this));


    },
    verifyGameOver: function() {
      var gameOver = true;
      for (var field of this.fields) {
        if (field.tanck > 0) {
          gameOver = false;
        }
      }
      if (gameOver) {
        this.gameOver();
      }
    }
  },
  build: function() {
    var obj = Object.create(this.proto, this.state);
    obj.init();
    return obj;
  }
}

fr.imie.Utils.build().mixin(fr.imie.Observable, fr.imie.Model);
