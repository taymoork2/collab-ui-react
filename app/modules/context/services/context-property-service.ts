
export interface IPropertyService {
  getProperty(name: string, orgId: string): ng.IPromise<number>;
}

export namespace PropertyConstants {
  export const MAX_FIELDS_PROP_NAME: string = 'org.max.fields';
  export const MAX_FIELDS_DEFAULT_VALUE: number = 100;
  export const MAX_FIELDSETS_PROP_NAME: string = 'org.max.fieldsets';
  export const MAX_FIELDSETS_DEFAULT_VALUE: number = 1000;
  export const MAX_FIELDS_PER_FIELDSET_PROP_NAME: string = 'org.max.fields.per.fieldset';
  export const MAX_FIELDS_PER_FIELDSET_DEFAULT_VALUE: number = 50;
  export const PROPERTY_URL: string = '/management/property/v1/propertyName/';
}

export class PropertyService implements IPropertyService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private ContextDiscovery,
    private $q: ng.IQService,
  ) {}

  public getProperty(propertyName: string, orgId: string): ng.IPromise<number> {
    return this.getStringProperty(propertyName, orgId)
      .then(value => {
        if (isNaN(Number(value))) {
          return this.$q.reject('Not a number') as atlas.QRejectWorkaround<number>;
        }
        return Number(value);
      });
  }

  private getStringProperty(propertyName: string, orgId: string): ng.IPromise<string> {
    return this.ContextDiscovery.getEndpointForService('management')
      .then(managementUrl => {
        const propertyQueryUrl = `${managementUrl}${PropertyConstants.PROPERTY_URL}${propertyName}.org.${orgId}`;
        return this.$http.get(propertyQueryUrl);
      })
      .then(response => {
        return response.data.value;
      });
  }
}

export default angular
  .module('context.services.context-property-service', [])
  .service('PropertyService', PropertyService)
  .name;
