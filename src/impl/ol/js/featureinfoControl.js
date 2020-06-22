
/**
 * @module M/impl/control/LocalLayersControl
 */
import template from 'templates/featureinfo_popup';

export default class FeatureInfoControl extends M.impl.Control {
  /**
   * @classdesc
   * Main constructor of the FeatureInfoControl.
   *
   * @constructor
   * @extends {M.impl.Control}
   * @api stable
   */
  constructor(params) {
    // 2. implementation of this control
    super();

    this.facadeMap_ = null;

    this.regExs_ = {
      gsResponse: /^results[\w\s\S]*\'http\:/i,
      msNewFeature: /feature(\s*)(\w+)(\s*)\:/i,
      gsNewFeature: /\#newfeature\#/,
      gsGeometry: /geom$/i,
      msGeometry: /boundedby$/i,
      msUnsupportedFormat: /error(.*)unsupported(.*)info\_format/i
    };

    /**
	 * Parametros de configuracion del control para implementacion
	 * Configuracion por defecto:
	 		{String} format:  'html',
	 		{Number} buffer: 1000,
			{Number} featureCount: 10,
			{Boolean} groupResults: false
	 * @private
	 * @type {object}
	 */
    this.params_ = params || {};

    /**
     * Format response
     * @public
     * @type {String}
     * @api stable
     */
    this.userFormat = this.params_.format;

    /**
     * Number of elements of the result
     * @public
     * @type {Number}
     * @api stable
     */
    this.featureCount = this.params_.featureCount;
    if (M.utils.isNullOrEmpty(this.featureCount)) {
      this.featureCount = 10;
    }

    /**
     * Buffer
     * @public
     * @type {Integer}
     * @api stable
     */
    this.buffer = this.params_.buffer;

    /**
     * Group results to show for each layer
     * @public
     * @type {boolean}
     * @api stable
     */
    //Por defecto mostrar resultados en un tab (funcionamiento original de mapea)
    this.groupResults = ((!M.utils.isNullOrEmpty(this.params_.groupResults)) ? this.params_.groupResults : false);

    /**
     * Loading message
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    this.LOADING_MESSAGE = 'Obteniendo información...';

    /**
     * Title for the popup
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    this.POPUP_TITLE = 'Información';


    /**
     * Template for this controls - popup
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    this.POPUP_TEMPLATE = 'featureinfo_popup.html';
  }


  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {M.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */

  /**
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    this.addOnClickEvent_();
  }

  /**
   * This function remove the event singleclick to the specified map
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    this.deleteOnClickEvent_();
  }

  /**
   * This function adds the event singleclick to the specified map
   *
   * @private
   * @function
   */
  addOnClickEvent_() {
    let olMap = this.facadeMap_.getMapImpl();
    if ((M.utils.normalize(this.userFormat) === "plain") || (M.utils.normalize(this.userFormat) === "text/plain")) {
      this.userFormat = "text/plain";
    } else if ((M.utils.normalize(this.userFormat) === "gml") || (M.utils.normalize(this.userFormat) === "application/vnd.ogc.gml")) {
      this.userFormat = "application/vnd.ogc.gml";
    } else {
      this.userFormat = "text/html";
    }
    //olMap.on('singleclick', this.buildUrl_, this);
    olMap.on('singleclick', (evt) => this.buildUrl_(evt), this);
  }

  addTo(map, html) {
    this.facadeMap_ = map;
    super.addTo(map, html);
  }

  /**
   * This function remove the event singleclick to the specified map
   *
   * @private
   * @function
   */
  deleteOnClickEvent_() {
    let olMap = this.facadeMap_.getMapImpl();
    //olMap.un('singleclick', (evt) => this.buildUrl_(evt), this);
    olMap.removeEventListener('singleclick',this.buildUrl_);
  }

  /**
   * This function builds the query URL and show results
   *
   * @private
   * @function
   * @param {ol.MapBrowserPointerEvent} evt - Browser point event
   */
  buildUrl_(evt) {
    let olMap = this.facadeMap_.getMapImpl();
    let viewResolution = olMap.getView().getResolution();
    let srs = this.facadeMap_.getProjection().code;
    let layerNamesUrls = [];
    this.facadeMap_.getWMS().forEach((layer) => {
      let olLayer = layer.getImpl().getOL3Layer();
      if (layer.isVisible() && layer.isQueryable() && !M.utils.isNullOrEmpty(olLayer)) {
        let getFeatureInfoParams = {
          'INFO_FORMAT': this.userFormat,
          'FEATURE_COUNT': this.featureCount,
        };
        if (!/buffer/i.test(layer.url)) {
          getFeatureInfoParams['Buffer'] = this.buffer;
        }
        let url = olLayer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, srs, getFeatureInfoParams);
        layerNamesUrls.push({
          'title': layer.legend,
          'layer': layer.name,
          'url': url
        });
      }
    }, this);
    if (layerNamesUrls.length > 0) {
      this.showInfoFromURL_(layerNamesUrls, evt.coordinate, olMap);
    } else {
      M.dialog.info('No existen capas consultables');
    }
  }

  /**
   * This function specifies whether the information is valid
   *
   * @param {string} info - Information to validate
   * @param {string} formato - Specific format to validate
   * @returns {boolean} res - Is valid or not format
   * @private
   * @function
   */
  insert_(info, formato) {
    let res = false;
    switch (formato) {
      case "text/html":
        // ex
        let infoContainer = document.createElement("div");
        infoContainer.innerHTML = info;

        // content
        let content = "";
        Array.prototype.forEach.call(infoContainer.querySelectorAll('body'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('div'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('table'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('b'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('span'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('input'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('a'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('img'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('p'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('ul'), (element) => {
          content += element.innerHTML.trim();
        });
        Array.prototype.forEach.call(infoContainer.querySelectorAll('li'), (element) => {
          content += element.innerHTML.trim();
        });

        if ((content.length > 0) && !/WMS\s+server\s+error/i.test(info)) {
          res = true;
        }
        break;
      case "application/vnd.ogc.gml":
        // ol.format.GML (http://openlayers.org/en/v3.9.0/apidoc/ol.format.GML.html)
        let formater = new ol.format.WFS();
        let features = formater.readFeatures(info);
        res = (features.length > 0);
        break;
      case "text/plain":
        // exp reg
        if (!/returned\s+no\s+results/i.test(info) && !/features\s+were\s+found/i.test(info) && !/:$/i.test(info)) {
          res = true;
        }
        break;
    }
    return res;
  }

  /**
   * This function formats the response
   *
   * @param {string} info - Information to formatting
   * @param {string} formato - Specific format
   * @param {string} layername - Layer name
   * @returns {string} information - Formatted information
   * @private
   * @function
   */
  formatInfo_(info, formato, layerName) {
    let formatedInfo = null;
    switch (formato) {
      case "text/html": // ex
        formatedInfo = info;
        break;
      case "application/vnd.ogc.gml": // ol.format.GML (http://openlayers.org/en/v3.9.0/apidoc/ol.format.GML.html)
        // let formater = new ol.format.GML();
        // let feature = formater.readFeatures(info)[0];
        let formater = new ol.format.WFS();
        let features = formater.readFeatures(info);
        formatedInfo = "";
        features.forEach((feature) => {
          let attr = feature.getKeys();
          formatedInfo += "<div class=\"divinfo\">";
          formatedInfo += "<table class=\"mapea-table\"><tbody><tr><td class=\"header\" colspan=\"3\">" + M.utils.beautifyAttribute(layerName) + "</td></tr>";
          for (let i = 0,
            ilen = attr.length; i < ilen; i++) {
            let attrName = attr[i];
            let attrValue = feature.get(attrName);

            formatedInfo += '<tr><td class="key"><b>';
            formatedInfo += M.utils.beautifyAttribute(attrName);
            formatedInfo += '</b></td><td class="value">';
            formatedInfo += attrValue;
            formatedInfo += "</td></tr>";
          }
          formatedInfo += "</tbody></table></div>";
        });
        break;
      case "text/plain": // exp reg
        if (this.regExs_.gsResponse.test(info)) {
          formatedInfo = this.txtToHtml_Geoserver_(info, layerName);
        } else {
          formatedInfo = this.txtToHtml_Mapserver_(info, layerName);
        }
        break;
    }
    return formatedInfo;
  }

  /**
   * This function indicates whether the format is accepted by the layer - Specific format text/html
   *
   * @param {string} info - Response to consult layer
   * @param {string} formato - Specific format
   * @returns {boolean} unsupported - It indicates whether the format is accepted
   * @private
   * @function
   */
  unsupportedFormat_(info, formato) {
    let unsupported = false;
    if (formato === "text/html") {
      unsupported = this.regExs_.msUnsupportedFormat.test(info);
    }
    return unsupported;
  }

  /**
   * This function return formatted information. Specific Geoserver
   *
   * @private
   * @function
   * @param {string} info - Information to formatting
   * @param {string} layername - Layer name
   * @returns {string} html - Information formated
   */
  txtToHtml_Geoserver_(info, layerName) {
    // get layer name from the header
    // let layerName = info.replace(/[\w\s\S]*\:(\w*)\'\:[\s\S\w]*/i, "$1");

    // remove header
    info = info.replace(/[\w\s\S]*\'\:/i, "");

    info = info.replace(/---(\-*)(\n+)---(\-*)/g, "#newfeature#");

    let attrValuesString = info.split("\n");

    let html = "<div class=\"divinfo\">";

    // build the table
    html += "<table class=\"mapea-table\"><tbody><tr><td class=\"header\" colspan=\"3\">" + M.utils.beautifyAttribute(layerName) + "</td></tr>";

    for (let i = 0,
      ilen = attrValuesString.length; i < ilen; i++) {
      let attrValueString = attrValuesString[i].trim();
      if (attrValueString.indexOf("=") != -1) {
        let attrValue = attrValueString.split("=");
        let attr = attrValue[0].trim();
        let value = "-";
        if (attrValue.length > 1) {
          value = attrValue[1].trim();
          if (value.length === 0 || value === "null") {
            value = "-";
          }
        }

        if (this.regExs_.gsGeometry.test(attr) === false) {
          html += '<tr><td class="key"><b>';
          html += M.utils.beautifyAttribute(attr);
          html += '</b></td><td class="value">';
          html += value;
          html += "</td></tr>";
        }
      } else if (this.regExs_.gsNewFeature.test(attrValueString)) {
        // set new header
        html += "<tr><td class=\"header\" colspan=\"3\">" + M.utils.beautifyAttribute(layerName) + "</td></tr>";
      }
    }

    html += "</tbody></table></div>";

    return html;
  }

  /**
   * This function return formatted information. Specific Mapserver
   *
   * @private
   * @function
   * @param {string} info - Information to formatting
   * @returns {string} html - Information formated
   */
  txtToHtml_Mapserver_(info) {
    // remove header
    info = info.replace(/[\w\s\S]*(layer)/i, "$1");

    // get layer name
    let layerName = info.replace(/layer(\s*)\'(\w+)\'[\w\s\S]*/i, "$2");

    // remove layer name
    info = info.replace(/layer(\s*)\'(\w+)\'([\w\s\S]*)/i, "$3");

    // remove feature number
    info = info.replace(/feature(\s*)(\w*)(\s*)(\:)([\w\s\S]*)/i, "$5");

    // remove simple quotes
    info = info.replace(/\'/g, "");

    // replace the equal (=) with (;)
    info = info.replace(/\=/g, ';');

    let attrValuesString = info.split("\n");

    let html = "";
    let htmlHeader = "<table class=\"mapea-table\"><tbody><tr><td class=\"header\" colspan=\"3\">" + M.utils.beautifyAttribute(layerName) + "</td></tr>";

    for (let i = 0,
      ilen = attrValuesString.length; i < ilen; i++) {
      let attrValueString = attrValuesString[i].trim();
      let nextAttrValueString = attrValuesString[i] ? attrValuesString[i].trim() : "";
      let attrValue = attrValueString.split(";");
      let attr = attrValue[0].trim();
      let value = "-";
      if (attrValue.length > 1) {
        value = attrValue[1].trim();
        if (value.length === 0) {
          value = "-";
        }
      }

      if (attr.length > 0) {
        if (this.regExs_.msNewFeature.test(attr)) {
          if ((nextAttrValueString.length > 0) && !this.regExs_.msNewFeature.test(nextAttrValueString)) {
            // set new header
            html += "<tr><td class=\"header\" colspan=\"3\">" + M.utils.beautifyAttribute(layerName) + "</td><td></td></tr>";
          }
        } else {
          html += '<tr><td class="key"><b>';
          html += M.utils.beautifyAttribute(attr);
          html += '</b></td><td class="value">';
          html += value;
          html += "</td></tr>";
        }
      }
    }

    if (html.length > 0) {
      html = htmlHeader + html + "</tbody></table>";
    }

    return html;
  }

  /**
   * This function displays information in a popup
   *
   * @private
   * @function
   * @param {array<object>} layers - Consulted layers
   * @param {array} coordinate - Coordinate position onClick
   * @param {olMap} olMap - Map
   */
  showInfoFromURL_(lstLayers, coordinate, olMap) {
    let content = '';
    let tabsFeatureInfo = [];
    let formato = String(this.userFormat);
    let contFull = 0;
    let this_ = this;
    let loadingInfoTab;
    let popup;
    let htmlAsText = M.template.compileSync(template, {
      //'jsonp' : true,
      'vars': {
        'info': this.LOADING_MESSAGE
      },
      'parseToHtml': false
    });

        popup = this_.facadeMap_.getPopup();
        loadingInfoTab = {
          'icon': 'g-cartografia-info',
          'title': this_.POPUP_TITLE,
          'content': htmlAsText
        };
        /* if (M.utils.isNullOrEmpty(popup)) {
          popup = new M.Popup();
          popup.addTab(loadingInfoTab);
          this_.facadeMap_.addPopup(popup, coordinate);
        } else {
          // removes popup if all contents are getfeatureinfo
          let hasExternalContent = popup.getTabs().some((tab) => {
            return (tab['title'] !== this_.POPUP_TITLE);
          });
          if (!hasExternalContent) {
            this_.facadeMap_.removePopup();
            popup = new M.Popup();
            popup.addTab(loadingInfoTab);
            this_.facadeMap_.addPopup(popup, coordinate);
          } else {
            popup.addTab(loadingInfoTab);
          }
        } */
        if (!M.utils.isNullOrEmpty(popup)) {
          this_.facadeMap_.removePopup();
        }
        popup = new M.Popup();
        popup.addTab(loadingInfoTab);
        this_.facadeMap_.addPopup(popup, coordinate);
    

    lstLayers.forEach((dataLayer) => {
      let url = dataLayer['url'];
      let layerName = dataLayer['layer'];
      let layerTitle = ((!M.utils.isNullOrEmpty(dataLayer['title'])) ? dataLayer['title'] : layerName);
      M.remote.get(url).then((response) => {
        //Peticion correcta: formatear resultados
        if ((response.code === 200) && (response.error === false)) {
          let formatedInfo = '';
          let info = response.text;
          if (this_.insert_(info, formato) === true) {
            formatedInfo = this_.formatInfo_(info, formato, layerName);
          } else if (this_.unsupportedFormat_(info, formato)) {
            formatedInfo = 'La capa <b>' + layerName + '</b> no soporta el formato <i>' + formato + '</i>';
          }
          //Annadir resultado feature
          if (formatedInfo !== '') {
            content = '<div class="title titleFeatureInfo">' + (this_.POPUP_TITLE + ': ' + layerTitle) + '</div>' + formatedInfo;
            tabsFeatureInfo.push({
              icon: 'g-cartografia-info',
              title: this_.POPUP_TITLE + ': ' + layerTitle,
              content: content
            });
          }
        }

        //Finalizadas todas las peticiones mostrar resultados
        if (lstLayers.length === ++contFull) {
          popup = this_.facadeMap_.getPopup();
          //Mostrar resultados
          if (!M.utils.isNullOrEmpty(popup)) {
            //Eliminar tab: cargando informacion
            popup.removeTab(loadingInfoTab);
            //Si no tenemos datos de ninguna capa: mostrar mensaje unico generico
            if (tabsFeatureInfo && tabsFeatureInfo.length == 0) {
              popup.addTab({
                icon: 'g-cartografia-info',
                title: this_.POPUP_TITLE,
                content: 'No hay información asociada.'
              });
            } else {
              //TODO: Posibilidad: crear aqui plantilla para generar informacion con los datos que tenemos y añadir al popup en un solo tab
              //Mostrar un tab por cada cada capa
              if (this_.groupResults == true) {
                for (let i = 0; i < tabsFeatureInfo.length; i++) {
                  popup.addTab(tabsFeatureInfo[i]);
                }
              } else {
                let data = [];
                //Generar contenidos para fusionar
                for (let i = 0; i < tabsFeatureInfo.length; i++) {
                  data.push(tabsFeatureInfo[i].content);
                }
                //Mostrar todos las capas en el mismo tab
                popup.addTab({
                  icon: 'g-cartografia-info',
                  title: this_.POPUP_TITLE,
                  content: data.join('')
                });
              }
            }
          }
        }
      });
    });
  }
}