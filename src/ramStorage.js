/**
 * Backbone ramStorage Adapter
 * Version 1.0.0
 */
(function(Backbone, _) {

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    function guid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };

    // A simple module to replace `Backbone.sync` with *volatile*-based
    // persistence. Models are given GUIDS, and saved into an array. Basically 
    // same way as Backbone.localStorage, just no local storage ever used.

    Backbone.ramStorage = function() {
        this.records = [];
    };

    _.extend(Backbone.ramStorage.prototype, {
        // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
        // have an id of it's own.
        create: function(model) {
            if (!model.id && model.id !== 0) {
                model.id = guid();
                var data = {}
                var idAttribute = model.idAttribute || 'id';
                data[idAttribute] = model.id; 
                model.set && model.set(data, {silent: true});
            }

            this.records.push(model);

            return this.find(model);
        },

        // Update a model by replacing its copy in `this.data`.
        update: function(model) {
            var idAttribute = model.idAttribute || 'id';
            var modelId = model[idAttribute];
            
            var idx = -1;

            _.find(this.records, function (e, k) {
                if(e[idAttribute] == modelId){
                    idx = k;
                    return true;
                }
                return false;
            });

            if(idx == -1){
                this.create(model);
            }else{
                this.records[idx] = (model.toJSON && model.toJSON()) || model;
            }

            return this.find(model);
        },

        // Retrieve a model from `this.data` by id.
        find: function(model) {
            var idAttribute = model.idAttribute || 'id';
            var modelId = model[idAttribute];

            return _.find(this.records, function (m) {
                return m[idAttribute] == modelId;
            });
        },

        // Return the object containing all models
        findAll: function() {
            return _.isEmpty(this.records) ? undefined : this.records;
        },

        // Delete a model from `this.data`, returning it.
        destroy: function(model) {
            var idAttribute = model.idAttribute || 'id';
            var modelId = model[idAttribute];

            this.records = _.reject(this.records, function (m) {
                return m[idAttribute] == modelId;
            });

            return model;
        }
    });

    // localSync delegate to the model or collection's
    // *ramStorage* property, which should be an instance of `Store`.
    Backbone.ramStorage.sync = Backbone.localSync = function(method, model, options) {
        var store = _.result(model, 'ramStorage') || _.result(model.collection, 'ramStorage');

        var resp, errorMessage;
        //If $ is having Deferred - use it.
        var syncDfd = Backbone.$ ?
            (Backbone.$.Deferred && Backbone.$.Deferred()) :
            (Backbone.Deferred && Backbone.Deferred());

        switch (method) {
            case "read":
                resp = _.isUndefined(model.id) ? store.findAll() : store.find(model);
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
                options.success(resp);
            }

            if (syncDfd) {
                syncDfd.resolve(resp);
            }

        } else {
            errorMessage = errorMessage ? errorMessage : "Record Not Found";

            if (options && options.error)
                options.error(errorMessage);
            
            if (syncDfd){
                syncDfd.reject(errorMessage);
            }
        }

        // add compatibility with $.ajax
        // always execute callback for success and error
        if (options && options.complete) options.complete(resp);

        return syncDfd && syncDfd.promise();
    };

    Backbone.ajaxSync = Backbone.sync;

    Backbone.getSyncMethod = function(model, options) {
        var forceAjaxSync = options && options.ajaxSync;

        if (!forceAjaxSync && (_.result(model, 'ramStorage') || _.result(model.collection, 'ramStorage'))) {
            return Backbone.localSync;
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