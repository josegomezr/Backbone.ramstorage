# Backbone.ramstorage
Un adaptador para almacenamiento volátil para [Backbone.js] inspirado por [Backbone.localStorage]. Este adaptador busca proveer enlace de datos en memoria sin persistencia, solo almacenamiento volátil.

## Características
* Almacenamiento volátil *Cross-browser* *[bueno, casi, no he revisado IE aun]*
* Cada `ramStorage` puede ser usada fuera de backbone.

## Pero ¿Para qué?

Bueno, Hace unos meses trabajaba en un proyecto y necesitaba una manera de usar [Backbone.js] con [Handsontable], sin morir en el intento. Desarrollando me di cuenta que es bastante dificil integrar a estos dos, me salia uan llamada al método `fetch` muchas veces pidiendo una url y no sabia como quitarmelo de encima. Luego de un montón de intentos, tomé código de [Backbone.localStorage] y eliminé la parte de `localStorage` de la ecuación asi disfruto de los beneficios de las Colecciones y Modelos de [Backbone.js] \(*sin guardar* nada) fuera de la complejidad del array-por-referencia que devuelve getData() en Handsontable.

##Uso

```js
var CarModel = Backbone.Model.extend({}); // A regular model
var CarStorage = new Backbone.ramStorage(); 
var CarCollection = Backbone.Collection.extend({
    model: CarModel,
    ramStorage: CarStorage,
    // o solo 
    // ramStorage: new Backbone.ramStorage()
    // si no necesitas manipular el ramStorage a mano.
});

var cars = new CarCollection();
```

Puedes usar `cars` como un modelo regular de backbone, Si quieres usar la versión original de todo lo que solía usar ajax (fetch, save, etc.), establece `ajaxSync` a `true` en su objeto `options` correspondiente:

```js
cars.fetch({ajaxSync: true});
```

Si quieres manipular el `ramStorage`, hay 5 métodos provisto para ello: 

* **create**: Guarda un objeto en el ramStorage actual, si puede ser convertido a JSON, llamará al método `.toJSON()`, sino, se guardará tal y como viene.

* **update**: Intenta actualizar un objeto con nueva data, si no concuerda ningún objeto, entonces se crea uno con la nueva data.

* **find**: Busca un objeto en ramStorage, si no lo consigue devuelve `undefined`.
* **findAll**: Devuelve la lista de objetos almacenados en el ramStorage actual, si no hay objetos, devuelve `undefined`.
* **destroy**: Elimina un objeto del ramStorage.


```js
CarStorage.create({
	make: 'myOwn',
	model: 'oh yeah!',
	year: 2015,
	weight: 1
});

cars.fetch();
```

Solo recuerda llamar a `<COLLECTION>.fetch()` cuando termines de manipular el ramStorage, asi la colección se percata de los cambios.

## @TODO
* *(mas)* documentacion: 
  + características
  + mostrar como usar con [Handsontable].
  + hacer mas ejemplos
* hacer tests
* hacer gh-pages

[Backbone.localStorage]: https://github.com/jeromegn/Backbone.localStorage
[Handsontable]: http://handsontable.com/
[Backbone.js]: http://backbonejs.org/