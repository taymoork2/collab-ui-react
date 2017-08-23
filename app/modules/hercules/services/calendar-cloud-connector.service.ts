import { IToolkitModalService } from 'modules/core/modal';
import { HybridServiceId, ServiceStatusCSSClass } from 'modules/hercules/hybrid-services.types';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface IService {
  aclAdminAccount?: string;
  apiClientId?: string;
  errorCode: ProvisioningResult;
  provisioned: boolean;
  serviceId: HybridServiceId;
  setup: boolean;
  status: HighLevelStatusForService;
  cssClass: ServiceStatusCSSClass;
}

interface IConfig {
  aclAdminAccount?: string;
  apiClientId?: string;
  testEmailAccount?: string;
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
  private secondSetupModal: any;
  private serviceId: HybridServiceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private Authinfo,
    private ServiceDescriptorService: ServiceDescriptorService,
    private UrlConfig,
  ) {}

  private extractDataFromResponse(res) {
    return res.data;
  }

  public updateConfig = (config: IConfig): ng.IPromise<any> => {
    let promiseStart;
    // Fetch apiClientId if it wasn't provided, since the server requires it
    if (config.apiClientId === undefined) {
      promiseStart = this.getApiKey()
        .then((data) => data.apiClientId);
    } else {
      promiseStart = this.$q.resolve(config.apiClientId);
    }
    return promiseStart
      .then((apiClientId) => {
        config = _.extend({}, config, {
          apiClientId: apiClientId,
        });
        return this.$http.post(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}`, config);
      })
      .then(() => {
        return this.ServiceDescriptorService.enableService(this.serviceId);
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
      template: '<google-calendar-first-time-setup class="modal-content" first-time-setup="true"></google-calendar-first-time-setup>',
      type: 'full',
    });
    return this.setupModal.result;
  }

  public openSecondSetupModal(): ng.IPromise<any> {
    this.secondSetupModal = this.$modal.open({
      template: '<google-calendar-second-time-setup class="modal-content"></google-calendar-second-time-setup>',
      type: 'full',
    });
    return this.secondSetupModal.result;
  }

  public dismissSetupModal(back?): void {
    if (this.setupModal) {
      if (back) {
        this.setupModal.close('back');
      } else {
        this.setupModal.dismiss();
      }
      this.setupModal = undefined;
    }
  }

  public dismissSecondSetupModal(): void {
    if (this.secondSetupModal) {
      this.secondSetupModal.close();
      this.secondSetupModal = undefined;
    }
  }

  public getService = (orgId?: string): ng.IPromise<IService> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${this.serviceId}`)
      .then(this.extractDataFromResponse)
      .then((service: IService) => {
        // Align this with the HybridServicesClusterService.getServiceStatus() to make the UI handling simpler
        service.serviceId = this.serviceId;
        service.setup = service.provisioned;
        service.cssClass = this.getStatusCss(service);
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
      .then(() => this.ServiceDescriptorService.disableService(this.serviceId));
  }

  public getProvisioningResultTranslationKey(provisioningResultCode: number): string {

    if (_.isUndefined(ProvisioningResult[provisioningResultCode])) {
      provisioningResultCode = 6;
    }

    return `hercules.settings.googleCalendar.provisioningResults.${ProvisioningResult[provisioningResultCode]}`;
  }

  private getStatusCss(service: IService): ServiceStatusCSSClass {
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

  private translateStatus(service: IService): HighLevelStatusForService {
    if (!service || !service.provisioned || !service.status) {
      return 'setupNotComplete';
    }
    switch (service.status.toLowerCase()) {
      case 'ok':
        return 'operational';
      default:
      case 'error':
        return 'outage';
      case 'warn':
        return 'impaired';
    }
  }
}

export default angular
  .module('hercules.cloud-connector', [
    require('collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/service-descriptor.service').default,
    require('modules/core/config/urlConfig'),
  ])
  .service('CloudConnectorService', CloudConnectorService)
  .name;
