# Feature Info

[![Build Tool](https://img.shields.io/badge/build-Webpack-green.svg)](https://github.com/sigcorporativo-ja/Mapea4-dev-webpack)  

## Descripción

 Plugin de [Mapea](https://github.com/sigcorporativo-ja/Mapea4) desarrollado por el [Instituto de Estadística y Cartografía](https://www.juntadeandalucia.es/institutodeestadisticaycartografia) que realiza peticiones de tipo getFeatureInfo sobre las capas


 
## Recursos y uso

- js: featureinfo.ol.min.js
- css: featureinfo.min.css

La estructura admitida para la configuración del plugin es la siguiente:

    var paramsPlugin = {
    params : {
        format: <{String}>,
        buffer: <{Number}>,
        featureCount: <{Number}>,
        groupResults: <{true|false}>	
        },
    options : {
        panel : {
            name:      <PANEL_NAME>,
            className: <CLASS_NAME>,
            iconClass: <CLASS_BOTON>,
            position:  <POSICION_BOTON>,
            tooltip:   <TOOL_TIP_BOTON>
         }
        }
    };

## Ejemplo

```javascript
// crear el plugin
let paramsPlugin = {
params : {
	format: 'html',
	groupResult: true
},
options : {
	panel : {
        iconClass: 'g-cartografia-opciones', 
	    position: M.ui.position.TR,
	    tooltip: 'Tools'
	}
}};	

let map = M.map({
  container: 'mapjs',
});

let mp = new FeatureInfo(paramsPlugin);

// añadirlo al mapa
map.addPlugin(mp);

});
```  
