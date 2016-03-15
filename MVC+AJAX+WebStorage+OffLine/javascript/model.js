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
        //console.log('done');
        this.scores = [];
        datas.forEach(function(item) {
          this.scores.push({
            player: item.player,
            score: parseInt(item.score)
          });
        }.bind(this));
        localStorage.setItem("synchronized", JSON.stringify(this.scores));
        this.synchronize();
        //this.scores = datas;
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
    synchronize: function() {
      if (this.getUnsynchronizedScore().length > 0) {
        $.ajax({
          url: "https://api.mongolab.com/api/1/databases/dryfield/collections/gamescore/?apiKey=KNNaG3ONbKo7nmQ-Ca8d3eSNU8JfAs-P",
          type: 'post',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(this.getUnsynchronizedScore())
        }).done(function(datas) {
          localStorage.setItem("unsynchronized", [])
          localStorage.setItem("synchronized", this.getConcatScore());
          //this.refreshScore();
        }.bind(this)).fail(function() {
          console.log('pas se synchro possible pour le moment')
        }.bind(this));
      }
    },
    getConcatScore: function() {
      var sync = this.getSynchronizedScore();
      var unsync = this.getUnsynchronizedScore();
      var total = sync.concat(unsync);
      //console.log(sync, unsync, total);
      return total;
    },
    getUnsynchronizedScore: function() {
      var unsynchronizedValue = localStorage.getItem("unsynchronized");
      var unsynchronized;
      if (unsynchronizedValue != undefined && unsynchronizedValue != '') {
        //console.log(localStorage.getItem("unsynchronized"));
        unsynchronized = JSON.parse(unsynchronizedValue);
      } else {
        unsynchronized = [];
      }
      return unsynchronized;
    },
    getSynchronizedScore: function() {
      var synchronizedValue = localStorage.getItem("synchronized");
      var synchronized;
      if (synchronizedValue != undefined && synchronizedValue != '') {
        synchronized = JSON.parse(synchronizedValue);
      } else {
        synchronized = [];
      }
      return synchronized;
    },
    gameOver: function() {
      for (var field of this.fields) {
        field.gameOver();
      }

      var unsynchronized = this.getUnsynchronizedScore()
      unsynchronized.push({
        player: this.playerName,
        score: this.totalHarvest
      });
      localStorage.setItem("unsynchronized", JSON.stringify(unsynchronized));
      this.synchronize()
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
