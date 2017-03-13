interface IService {
  errorCode: number; // TODO: implement support for https://sqbu-github.cisco.com/WebExSquared/calendar-cloud-connector/issues/390
  provisioned: boolean;
  serviceAccountId: string;
  serviceId: string;
  setup?: boolean;
  status?: string;
  statusCss?: string;
}

export class CloudConnectorService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private ServiceDescriptor,
    private UrlConfig,
  ) { }

  private extractDataFromResponse(res) {
    return res.data;
  }

  public updateConfig = (newServiceAccountId: string, newAclAccount: string, privateKey: string, serviceId: string): ng.IPromise<any> => {
    let data = {
      serviceAccountId: newServiceAccountId,
      aclAdminAccount: newAclAccount,
      privateKeyData: privateKey.split(',')[1],
    };

    return this.$http
      .post(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${serviceId}`, data)
      .then(() => {
        return this.ServiceDescriptor.enableService(serviceId);
      });

  }

  public getService = (serviceId: string, orgId?: string): ng.IPromise<IService> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${serviceId}`)
      .then(this.extractDataFromResponse)
      .then((service: IService) => {
        // Align this with the FusionClusterService.getServiceStatus() to make the UI handling simpler
        service.serviceId = serviceId;
        service.setup = service.provisioned;
        service.statusCss = this.getStatusCss(service);
        service.status = this.translateStatus(service);
        return service;
      });
  }

  public deactivateService = (serviceId: string, orgId?: string): ng.IPromise<any> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .delete(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${serviceId}`)
      .then(() => {
        return this.ServiceDescriptor.disableService(serviceId);
      });
  }

  private getStatusCss(service: IService): string {
    if (!service || !service.provisioned || !service.status) {
      return 'default';
    }
    switch (service.status.toLowerCase()) {
      case 'ok':
        return 'success';
      case 'error':
        return 'danger';
      case 'warn':
        return 'warning';
      default:
        return 'default';
    }
  }

  private translateStatus(service: IService): string {
    if (!service || !service.provisioned || !service.status) {
      return 'setupNotComplete';
    }
    switch (service.status.toLowerCase()) {
      case 'ok':
        return 'operational';
      case 'error':
        return 'outage';
      case 'warn':
        return 'impaired';
      default:
        return 'unknown';
    }
  }

}

angular
  .module('Hercules')
  .service('CloudConnectorService', CloudConnectorService);
