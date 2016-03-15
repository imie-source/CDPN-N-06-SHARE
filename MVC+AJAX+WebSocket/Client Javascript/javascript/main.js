"use strict";

var model = fr.imie.Model.build();
var view = fr.imie.View.build(model);
var controller = fr.imie.Controller.build(model,view);
model.attach(view);
view.attach(controller);
