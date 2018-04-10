import * as X2JS from 'x2js';

export class XmlService {
  private x2js: X2JS;

  /* @ngInject */
  constructor(
  ) {
    this.x2js = new X2JS();
  }

  // Find the matched keys in the XML into an array
  public filterKeyInXml(xmlString: string, key: string): any[] {
    if (_.isUndefined(xmlString) || _.isUndefined(key)) {
      return [];
    }

    // Convert xml to a json object
    const obj = this.x2js.xml2js(xmlString);
    return _.isPlainObject(obj) ? this.filterKeyInObject(obj, key) : [];
  }

  // Find the matched keys in the JSON object into an array
  public filterKeyInObject(obj: any, key: string): any[] {
    if (!_.isPlainObject(obj)) {
      return [];
    }

    if (_.has(obj, key)) {
      return [obj[key]];
    }

    // flatten the returned array
    return _.flattenDeep(_.map(obj, (i) => {
      return this.filterKeyInObject(i, key);
    }));
  }
}
