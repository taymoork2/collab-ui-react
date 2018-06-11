export interface ISpeechServicesResource extends ng.resource.IResourceClass<any> {
  update(any): any;
}

export class SparkAssistantService {

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
  }

  private getConfigResource(): ISpeechServicesResource {
    const  baseUrl = this.UrlConfig.getSpeechServiceUrl();
    return <ISpeechServicesResource>this.$resource(baseUrl + 'organizations/:orgId', {
      orgId: this.Authinfo.getOrgId(),
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  public updateSpeechService(optin: boolean): ng.IPromise<void> {
    return this.getConfigResource()
      .update({
        optIn: optin,
      }).$promise;
  }

  public getSpeechServiceOptIn(): ng.IPromise<any> {
    return this.getConfigResource().get().$promise;
  }
}
