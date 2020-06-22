/**
 * @module M/plugin/FeatureInfo
 */
import FeatureInfoControl from './featureinfoControl.js';
import 'assets/css/featureinfo';

export default class FeatureInfo extends M.Plugin {

  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(parameters) {

    super();
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];

    /**
     * add your variables
     *
     */
    //Proceso de parametros enviados
    parameters = parameters || {};

    /**
     * Params config control
     * Configuracion por defecto:
          {String} format:  'html',
          {Number} buffer: 1000,
        {Number} featureCount: 10,
        {Boolean} groupResults: false
     * @private
     * @type {object}
     */
    this.params_ = parameters.params || {};

    /**
     * Options of the controls
     * Configuracion por defecto: (panel tools de mapea, si exite NO se crea)
         panel: {
            {String} name: 			'tools',
            {String} className: 	'm-tools-bar',
            {String} iconClass: 	'g-cartografia-herramienta',
            {String} position:  	 M.ui.position.TL,
            {String} tooltip: 		'Herramientas'
       }
     * @private
     * @type {object}
     */
    this.options_ = parameters.options || {};

  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    let this_ = this;
    this.map_ = map;
    let ctrol = null;
    //Validar formato
    if ((!M.utils.isNullOrEmpty(this.params_.format)) && (this.params_.format !== 'plain' && this.params_.format !== 'html' && this.params_.format !== 'gml')) {
      M.dialog.error('El formato solicitado para la información no está disponible. Inténtelo utilizando gml, plain o html.');
    } else {
      ctrol = new FeatureInfoControl(this.params_, this.options_);
      this.controls_.push(ctrol);
      // Asignar los controles al panel y el panel al mapa
      this.panel_ = this.getPanel_();
      this.panel_.addControls(this.controls_);
      this.map_.addPanels(this.panel_);

      ctrol.on(M.evt.ACTIVATED, () => {
        // Desactivo los plugins conflictivos al activarse el control
        const conflictedPlugins = ['drawing', 'measurebar'];
        for (const panel of map.getPanels(conflictedPlugins)) {
          if (panel.name == 'drawing') {
            panel.getControls()[0].deactiveAll();
          }
          if (panel.name == 'measurebar') {
            for (const control of panel.getControls()) {
              control.deactivate();
            }
          }
        }
      });


      ctrol.on(M.evt.ADDED_TO_MAP, function () {
        this_.fire(M.evt.ADDED_TO_MAP);
        //TODO: TEMPORAL VER COMO PARAMETRIZAR
        //Movemos contenido del control al nivel de controles
        let maintoolbar = document.querySelector('#maintoolbar');
        if (maintoolbar) {
          maintoolbar.appendChild(this.panel_._element);
          this.panel_._areaContainer = maintoolbar;
        }
      }, this);
    }
  }

  getPanel_() {
    //Comprobar si el panel existe
    let name = ((!M.utils.isNullOrEmpty(this.options_.panel) && !M.utils.isNullOrEmpty(this.options_.panel.name)) ? this.options_.panel.name : 'featureinfo');
    let panel = this.map_.getPanels(name)[0];
    //Si no existe lo creamos
    if (M.utils.isNullOrEmpty(panel)) {
      panel = new M.ui.Panel(name, this.getPanelOptions_());
      //Si creamos el panel estandar de mapea y lo registramos en el mapa
      if (M.utils.isNullOrEmpty(this.map_.panel.TOOLS) && name == 'featureinfo') {
        this.map_.panel.TOOLS = panel;
      }
    }
    return panel;
  }
  getPanelOptions_() {
    let opt_ = {};
    if (!M.utils.isNullOrEmpty(this.options_.panel))
      opt_ = this.options_.panel;

    let panelOptions_ = {
      collapsible: false,
      className: 'm-tools-bar m-tools' + ((!M.utils.isNullOrEmpty(opt_.className)) ? (' ' + opt_.className) : ''),
      collapsedButtonClass: ((!M.utils.isNullOrEmpty(opt_.collapsedClass)) ? opt_.collapsedClass : 'g-cartografia-info'),
      position: ((!M.utils.isNullOrEmpty(opt_.position)) ? opt_.position : M.ui.position.TL),
      tooltip: ((!M.utils.isNullOrEmpty(opt_.tooltip)) ? opt_.tooltip : 'Consultar capa')
    };
    return panelOptions_;
  }
}