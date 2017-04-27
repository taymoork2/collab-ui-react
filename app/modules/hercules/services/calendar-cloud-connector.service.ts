import { IToolkitModalService } from 'modules/core/modal';
import { HybridServiceId, StatusIndicatorCSSClass } from 'modules/hercules/hybrid-services.types';

interface IService {
  aclAdminAccount?: string;
  apiClientId?: string;
  errorCode: ProvisioningResult;
  provisioned: boolean;
  serviceId: string;
  setup: boolean;
  status: string;
  statusCss: string;
}

interface IConfig {
  aclAdminAccount?: string;
  apiClientId: string;
  testEmailAccount: string;
}

export interface IApiKey {
  apiClientId: string;
  scopes: string[];
  status: number;
}

/* List of error codes from https://sqbu-github.cisco.com/WebExSquared/calendar-cloud-connector/issues/390 */
enum ProvisioningResult {
  'OK' = 0,                       // All good
  'INVALID_API_ACCESS_KEY' = 1,   // Invalid API access key
  'DATABASE_ERROR' = 2,           // Database error
  'REQUIRED_SCOPE_MISSING' = 3,   // Missing required auth scope
  'SECURITY_FAILURE' = 4,         // Some kind of security issue
  'GENERAL_ERROR' = 6,            // Default error
  'TEST_ACCOUNT_NONEXISTENT' = 7, // No such account
}

export class CloudConnectorService {
  private setupModal: any;
  private serviceId: HybridServiceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private Authinfo,
    private ServiceDescriptor,
    private UrlConfig,
  ) {}

  private extractDataFromResponse(res) {
    return res.data;
  }

  public updateConfig = (config: IConfig): ng.IPromise<any> => {
    return this.$http
      .post(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}`, config)
      .then(() => {
        return this.ServiceDescriptor.enableService(this.serviceId);
      });
  }

  public getApiKey(orgId?: string): ng.IPromise<IApiKey> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get<IApiKey>(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}/apikey`)
      .then(this.extractDataFromResponse);
  }

  public openSetupModal(): ng.IPromise<any> {
    this.setupModal = this.$modal.open({
      template: '<google-calendar-setup class="modal-content"></google-calendar-setup>',
      type: 'full',
    });
    return this.setupModal.result;
  }

  public dismissSetupModal(): void {
    if (this.setupModal) {
      this.setupModal.dismiss();
      this.setupModal = undefined;
    }
  }

  public getService = (orgId?: string): ng.IPromise<IService> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}`)
      .then(this.extractDataFromResponse)
      .then((service: IService) => {
        // Align this with the FusionClusterService.getServiceStatus() to make the UI handling simpler
        service.serviceId = this.serviceId;
        service.setup = service.provisioned;
        service.statusCss = this.getStatusCss(service);
        service.status = this.translateStatus(service);
        return service;
      });
  }

  public deactivateService = (orgId?: string): ng.IPromise<any> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .delete(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}`)
      .then(() => this.ServiceDescriptor.disableService(this.serviceId));
  }

  public getProvisioningResultTranslationKey(provisioningResultCode: number): string {

    if (_.isUndefined(ProvisioningResult[provisioningResultCode])) {
      provisioningResultCode = 6;
    }

    return `hercules.settings.googleCalendar.provisioningResults.${ProvisioningResult[provisioningResultCode]}`;
  }

  private getStatusCss(service: IService): StatusIndicatorCSSClass {
    if (!service || !service.provisioned || !service.status) {
      return 'disabled';
    }
    switch (service.status.toLowerCase()) {
      case 'ok':
        return 'success';
      case 'error':
        return 'danger';
      case 'warn':
        return 'warning';
      default:
        return 'disabled';
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
