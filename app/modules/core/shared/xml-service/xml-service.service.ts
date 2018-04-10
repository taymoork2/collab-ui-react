import * as X2JS from 'x2js';

export class XmlService {
  public readonly SINGLE_SIGN_ON_SERVICE = 'SingleSignOnService';
  public readonly _BINDINGS = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';

  // Get the reqBinding param in the XML
  public getReqBinding(metadataXml: string): string {
    // Get the SingleSignOnService keys into an array
    const ssoServices = this.filterKeyInXml(metadataXml, this.SINGLE_SIGN_ON_SERVICE);
    if (_.isEmpty(ssoServices)) {
      return '';
    }

    const hasPostBinding = _.some(ssoServices, (i) => {
      return i['_Binding'] === this._BINDINGS;
    });
    if (hasPostBinding) {
      return `&reqBinding=${this._BINDINGS}`;
    } else {
      return '';
    }
  }

  // Find the matched keys in the XML into an array
  public filterKeyInXml(xmlString: string, key: string) {
    if (_.isUndefined(xmlString) || _.isUndefined(key)) {
      return [];
    }

    // Convert xml to a json object
    const x2js = new X2JS();
    const obj = x2js.xml2js(xmlString);
    return _.isPlainObject(obj) ? this.filterKeyInObject(obj, key) : [];
  }

  // Find the matched keys in the JSON object into an array
  public filterKeyInObject(obj: any, key: string) {
    if (!_.isPlainObject(obj)) {
      return [];
    }

    if (_.has(obj, key)) {
      return [obj[key]];
    }

    // flatten the returned array
    return _.flattenDeep(_.map(obj, (i) => {
      return _.isObject(i) ? this.filterKeyInObject(i, key) : [];
    }));
  }
}
