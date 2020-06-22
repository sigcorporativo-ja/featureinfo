/**
 * @module M/plugin/FeatureInfoControl
 */
import FeatureInfoImplControl from 'impl/featureinfoControl';
import template from 'templates/featureinfo';

export default class FeatureInfoControl extends M.Control {

  /**
   * Name to identify this control
   * @const
   * @type {string}
   * @public
   * @api stable
   */
  static get NAME() {
    return 'FeatureInfo';
  }

  /**
   * Name to identify url template
   * @const
   * @type {string}
   * @public
   * @api stable
   */
  static get TEMPLATE() {
    return 'featureinfo.html';
  }

  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(params, options) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(FeatureInfoImplControl)) {
      M.exception('La implementación usada no puede crear controles PluginControl');
    }
    // 2. implementation of this control
    let impl = new FeatureInfoImplControl(params);
    super(impl, "FeatureInfo");

    /**
     * Params of the control
     * @private
     * @type {params}
     */
    this.params_ = params || {};

    /**
     * Options of the control
     * @private
     * @type {options}
     */
    this.options_ = options || {};

  }
  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    this.facadeMap_ = map;
    if (!M.template.compileSync) { // JGL: retrocompatibilidad Mapea4
      M.template.compileSync = (string, options) => {
        let templateCompiled;
        let templateVars = {};
        let parseToHtml;
        if (!M.utils.isUndefined(options)) {
          templateVars = M.utils.extends(templateVars, options.vars);
          parseToHtml = options.parseToHtml;
        }
        const templateFn = Handlebars.compile(string);
        const htmlText = templateFn(templateVars);
        if (parseToHtml !== false) {
          templateCompiled = M.utils.stringToHtml(htmlText);
        } else {
          templateCompiled = htmlText;
        }
        return templateCompiled;
      };
    }
    
    return new Promise((success, fail) => {
      const html = M.template.compileSync(template);
      // Añadir código dependiente del DOM
      success(html);
    });
  }

  /**
   * @public
   * @function
   * @param {HTMLElement} html to add the plugin
   * @api stable
   * @export
   */
  getActivationButton(html) {
    return html.querySelector('button#m-getfeatureinfo-button');
  }

  /**
   * @public
   * @function
   * @param {HTMLElement} html to add the plugin
   * @api stable
   * @export
   */
  equals(obj) {
    let equals = false;
    if (obj instanceof FeatureInfoControl) {
      equals = (this.name === obj.name);
    }
    return equals;
  }
}