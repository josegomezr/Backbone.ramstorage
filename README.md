# Backbone.ramstorage
A volatile storage adapter for [Backbone.js] inspired by [Backbone.localStorage]. This adapter aims to provide data binding in memory, no persistance, just volatile storage.

>¿No entiendes Inglés? [Lee la documentación en español](README-spanish.md)!  

## Features

* Cross-browser volatile storage *[well, almost, I haven't checked IE yet]*
* Each `ramStorage` can be used outside backbone.

## But why?

Well, I was working on a project a couple of month ago, and I needed a way to use [Backbone.js] with [Handsontable], without dying in the process. I found out that is quite hard to bundle this two guys together. I got this call to `fetch` method a lot of times asking me for an url, and didn't know how to get rid of it. After a lot of attempts, I took some code of [Backbone.localStorage] and removed the `localStorage` part of the equation so I can get the benefits of [Backbone.js] Collections & Models (without *saving data*) outside the complexity of  Handsontable by-reference-getData() array.

##Usage

```js
var CarModel = Backbone.Model.extend({}); // A regular model
var CarStorage = new Backbone.ramStorage(); 
var CarCollection = Backbone.Collection.extend({
    model: CarModel,
    ramStorage: CarStorage,
    // or just 
    // ramStorage: new Backbone.ramStorage()
    // if you dont need to manipulate the `ramStorage` by hand.
});

var cars = new CarCollection();
```

You can use `cars` as a regular backbone collection. If you want to use the original version of everything that used to work with ajax (fetch, save, etc.) set `ajaxSync` to `true` in their corresponding options Object.

```js
cars.fetch({ajaxSync: true});
```

If you want to manipulate the `ramStorage`, there are 5 methods provided:

* **create**: Save an object in current ramStorage, if it can be converted to JSON, It'll call `.toJSON()` method, else It'll save as is.
* **update**: Tries to update an object with new data, if no object match, then an object its created with current data.
* **find**: Finds an object in the ramStorage, if not found, returns `undefined`.
* **findAll**: Returns an array of objects stored in ramStorage, if no object stored, returns `undefined`.
* **destroy**: Remove an object from ramStorage.

```js
CarStorage.create({
	make: 'myOwn',
	model: 'oh yeah!',
	year: 2015,
	weight: 1
});

cars.fetch();
```

Just remember to call `<COLLECTION>.fetch()` method when you finish your manipulation so the collection grab the changes.

## @TODO
* *(more)* documentation: 
  + show more features
  + show how to use along [Handsontable].
  + make some examples
* make some tests
* make gh-pages

[Backbone.localStorage]: https://github.com/jeromegn/Backbone.localStorage
[Handsontable]: http://handsontable.com/
[Backbone.js]: http://backbonejs.org/