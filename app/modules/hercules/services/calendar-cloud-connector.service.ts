import { IToolkitModalService } from 'modules/core/modal';
import { HybridServiceId, ServiceStatusCSSClass } from 'modules/hercules/hybrid-services.types';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';

export interface ICCCService {
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

export type CCCService = 'squared-fusion-gcal' | 'squared-fusion-o365';

enum ProvisioningResult {
  'OK' = 0,                                // All good
  'INVALID_API_ACCESS_KEY' = 1,            // Invalid API access key
  'DATABASE_ERROR' = 2,                    // Database error
  'REQUIRED_SCOPE_MISSING' = 3,            // Missing required auth scope
  'SECURITY_FAILURE' = 4,                  // Some kind of security issue
  'GENERAL_ERROR' = 6,                     // Default error
  'TEST_ACCOUNT_NONEXISTENT' = 7,          // No such account
  'SYNC_KMS_ROLE_FAILURE' = 8,             // Error adding sync KMS role
  'MACHINE_ACCOUNT_CREATION_FAILURE' = 9,  // Error creating machine account
  'PASSWORD_CREATION_FAILURE' = 10,        // Error creating passwords
  'INVALID_SESSION_ID' = 11,               // Invalid session id
  'BAD_ADMIN_CONSENT' = 12,                // Invalid admin consent
  'PRECONDITIONS_NOT_MET' = 13,            // Session timeout
  'MACHINE_ACCOUNT_DELETION_FAILURE' = 14, // Error creating machine account
  'ORGANIZATION_ADDITION_FAILURE' = 15,    // Error adding organization
}

interface IRequestAdminConsentResponse {
  redirectUrl: string;
}

export class CloudConnectorService {
  private setupModal: any;
  private secondSetupModal: any;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private Authinfo,
    private OAuthConfig,
    private ServiceDescriptorService: ServiceDescriptorService,
    private UrlConfig,
  ) {}

  private extractDataFromResponse(res) {
    return res.data;
  }

  public getOffice365AdminConsentUrl(): ng.IPromise<string> {
    const returnUrl = `${this.OAuthConfig.getAdminPortalUrl()}/services`;
    return this.$http.get<IRequestAdminConsentResponse>(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/squared-fusion-cal/provisioning/requestAdminConsent`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      params: {
        atlasUrl: returnUrl,
      },
    }).then(response => response.data.redirectUrl);
  }

  public confirmO365Provisioning(email: string): ng.IPromise<''> {
    return this.$http.get<any>(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/squared-fusion-cal/provisioning/confirmO365Provisioning`, {
      params: {
        testEmail: email,
      },
    }).then(r => r.data);
  }

  public updateConfig = (config: IConfig): ng.IPromise<any> => {
    const serviceId = 'squared-fusion-gcal';
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
        // We should be able to only update aclAdminAccount, but there is a bug in CCC which forces us to always provide
        // testEmailAccount, and testEmailAccount needs apiClientId! Thankfully apiClientId is always present, but if
        // aclAdminAccount is provided without testEmailAccount, let's use the same value for both.
        if (config.aclAdminAccount && !config.testEmailAccount) {
          config.testEmailAccount = config.aclAdminAccount;
        }
        return this.$http.post(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${serviceId}`, config);
      })
      .then(() => {
        return this.ServiceDescriptorService.enableService(serviceId);
      });
  }

  public getApiKey(orgId?: string): ng.IPromise<IApiKey> {
    const serviceId = 'squared-fusion-gcal';
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get<IApiKey>(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${serviceId}/apikey`)
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

  public getService = (serviceId: CCCService, orgId?: string): ng.IPromise<ICCCService> => {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    // Transform fake entitlement to existing entitlement
    let requestedService = serviceId;
    if (requestedService === 'squared-fusion-o365') {
      requestedService = 'squared-fusion-cal' as CCCService;
    }
    return this.$http.get(`${this.UrlConfig.getCccUrl()}/orgs/${orgId}/services/${requestedService}`)
      .then(this.extractDataFromResponse)
      .then((service: ICCCService) => {
        // Align this with the HybridServicesClusterService.getServiceStatus() to make the UI handling simpler
        service.serviceId = serviceId;
        service.setup = service.provisioned;
        service.cssClass = this.getStatusCss(service);
        service.status = this.translateStatus(service);
        return service;
      });
  }

  public deactivateService = (serviceId: CCCService, orgId?: string): ng.IPromise<any> => {
    // Transform fake entitlement to existing entitlement
    let requestedService = serviceId;
    if (requestedService === 'squared-fusion-o365') {
      requestedService = 'squared-fusion-cal' as CCCService;
    }
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .delete(`${this.UrlConfig.getCccUrl()}/orgs/${this.Authinfo.getOrgId()}/services/${requestedService}`)
      .then(() => {
        if (requestedService === 'squared-fusion-gcal') {
          return this.ServiceDescriptorService.disableService(serviceId);
        }
        return undefined;
      });
  }

  public getProvisioningResultTranslationKey(provisioningResultCode: number): string {
    // All other result codes than below are convidering "generic errors" because the admin can't
    // do anything to fix them
    if (!_.includes([0, 6, 7, 11, 12], provisioningResultCode)) {
      provisioningResultCode = 6;
    }
    return `hercules.settings.googleCalendar.provisioningResults.${ProvisioningResult[provisioningResultCode]}`;
  }

  private getStatusCss(service: ICCCService): ServiceStatusCSSClass {
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

  private translateStatus(service: ICCCService): HighLevelStatusForService {
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
    require('@collabui/collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/service-descriptor.service').default,
    require('modules/core/config/urlConfig'),
  ])
  .service('CloudConnectorService', CloudConnectorService)
  .name;
