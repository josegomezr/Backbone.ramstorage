/**
 * Backbone ramStorage Adapter
 * Version 1.0.0
 *
 */
(function(Backbone, _) {

function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// A simple module to replace `Backbone.sync` with *ramStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.


// Our Store is represented by a single JS object in *ramStorage*. Create it
// with a meaningful name, like the name you'd give a table.
// window.Store is deprectated, use Backbone.ramStorage instead

Backbone.ramStorage = function(serializer) {
  this.serializer = serializer || {
    serialize: function(item) {
      return _.isObject(item) ? JSON.stringify(item) : item;
    },
    // fix for "illegal access" error on Android when JSON.parse is passed null
    deserialize: function (data) {
      return data && JSON.parse(data);
    }
  };
  this.records = {};
};

_.extend(Backbone.ramStorage.prototype, {
  save: function() {
    // 
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model) {
    if (!model.id && model.id !== 0) {
      model.id = guid();
      var data = {}
      data[model.idAttribute] = model.id;
      model.set(data, {silent: true});
    }

    this.records[model.id] = model;

    return this.find(model);
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model) {
    var modelId = model.id.toString();
    
    if (!_.has(this.records, modelId)) {
      this.records[modelId] = model;
    }

    return this.find(model);
  },

  // Retrieve a model from `this.data` by id.
  find: function(model) {
    return this[model.id.toString()];
  },

  // Return the array of all models currently in storage.
  findAll: function() {
    return this.records;
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model) {
    var modelId = model.id.toString();
    delete this.records[modelId];
    return model;
  }
});

// localSync delegate to the model or collection's
// *ramStorage* property, which should be an instance of `Store`.
// window.Store.sync and Backbone.localSync is deprecated, use Backbone.ramStorage.sync instead
Backbone.ramStorage.sync = Backbone.localSync = function(method, model, options) {
  var store = _.result(model, 'ramStorage') || _.result(model.collection, 'ramStorage');
  
  var resp, errorMessage;
  //If $ is having Deferred - use it.
  var syncDfd = Backbone.$ ?
    (Backbone.$.Deferred && Backbone.$.Deferred()) :
    (Backbone.Deferred && Backbone.Deferred());

    switch (method) {
      case "read":
        resp = model.id != undefined ? store.find(model) : store.findAll();
        break;
      case "create":
        resp = store.create(model);
        break;
      case "update":
        resp = store.update(model);
        break;
      case "delete":
        resp = store.destroy(model);
        break;
    }

  if (resp) {
    if (options && options.success) {
      if (Backbone.VERSION === "0.9.10") {
        options.success(model, resp, options);
      } else {
        options.success(resp);
      }
    }
    if (syncDfd) {
      syncDfd.resolve(resp);
    }

  } else {
    errorMessage = errorMessage ? errorMessage : "Record Not Found";

    if (options && options.error)
      if (Backbone.VERSION === "0.9.10") {
        options.error(model, errorMessage, options);
      } else {
        options.error(errorMessage);
      }

    if (syncDfd)
      syncDfd.reject(errorMessage);
  }

  // add compatibility with $.ajax
  // always execute callback for success and error
  if (options && options.complete) options.complete(resp);

  return syncDfd && syncDfd.promise();
};

Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function(model, options) {
  return Backbone.localSync;
  var forceAjaxSync = options && options.ajaxSync;

  if(!forceAjaxSync && (_.result(model, 'ramStorage') || _.result(model.collection, 'ramStorage'))) {
  }

  return Backbone.ajaxSync;
};

// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function(method, model, options) {
  return Backbone.getSyncMethod(model, options).apply(this, [method, model, options]);
};

return Backbone.ramStorage;

})(Backbone, _);