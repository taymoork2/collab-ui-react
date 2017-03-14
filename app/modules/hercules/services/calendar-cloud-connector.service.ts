interface IService {
  errorCode: ProvisioningResult;
  provisioned: boolean;
  serviceAccountId: string;
  serviceId: string;
  setup?: boolean;
  status?: string;
  statusCss?: string;
}

/* List of error codes from https://sqbu-github.cisco.com/WebExSquared/calendar-cloud-connector/issues/390 */
enum ProvisioningResult {
  'OK' = 0, // All good
  'BAD_API_ACCESS_SETTINGS' = 1, // bad site verification token, need api access settings
  'DATABASE_ERROR' = 2, // Database error
  'SITE_VERIFICATION_FAILURE' = 3, // Site verification failure
  'SECURITY_FAILURE' = 4, // Some kind of security issue
  'INPUT_PARSING_FAILURE' = 5, // Some kind of issue parsing input
  'GENERAL_ERROR' = 6, // Default error
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

  public getProvisioningResultTranslationKey(provisioningResultCode: number): string {

    if (_.isUndefined(ProvisioningResult[provisioningResultCode])) {
      provisioningResultCode = 6;
    }

    return `hercules.settings.googleCalendar.provisioningResults.${ProvisioningResult[provisioningResultCode]}`;
  }

  private getStatusCss(service: IService): 'default' | 'success' | 'danger' | 'warning' {
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

  private translateStatus(service: IService): 'setupNotComplete' | 'operational' | 'outage' | 'impaired' | 'unknown' {
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
