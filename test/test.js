import FeatureInfo from 'facade/featureinfo';

var paramsPlugin = {
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

const map = M.map({
  container: 'mapjs',
});

const mp = new FeatureInfo(paramsPlugin);

map.addPlugin(mp);

map.addLayers(["WMS*Capa1*http://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_GeoParques?*GeoParques*true"]);

