import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ITrunkStatus } from 'modules/hercules/services/enterprise-private-trunk-service';

interface IServiceStatus {
  alarmsUrl: string;
  id: HybridServiceId;
  state: string; //  'operational' | ?
  url: string;
  resources?: ITrunkStatus[]; // ok?
}

export interface IServiceDescription {
  emailSubscribers: string;
  enabled: boolean;
  id: HybridServiceId;
  url: string;
}

export class ServiceDescriptorService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private Orgservice,
    private UrlConfig,
  ) {
    this.extractData = this.extractData.bind(this);
    this.extractItems = this.extractItems.bind(this);
  }

  public getServiceStatus(serviceId: HybridServiceId, orgId?: string): ng.IPromise<IServiceStatus> {
    return this.$http.get<IServiceStatus>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/services/${serviceId}/status`)
      .then(response => response.data);
  }

  public getServices(orgId?: string): ng.IPromise<IServiceDescription[]> {
    return this.$http.get(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/services`)
      .then(this.extractItems);
  }

  public filterEnabledServices (services: IServiceDescription[]): IServiceDescription[] {
    return _.filter(services, service => service.id !== 'squared-fusion-mgmt' && service.enabled);
  }

  public getEmailSubscribers(serviceId: HybridServiceId): ng.IPromise<string[]> {
    return this.getServices()
      .then((services: IServiceDescription[]) => {
        const service = _.find(services, { id: serviceId });
        if (service !== undefined) {
          return _.without(service.emailSubscribers.split(','), '');
        }
        return [];
      });
  }

  public setEmailSubscribers(serviceId: HybridServiceId, emailSubscribers: string): ng.IHttpPromise<''> {
    return this.$http
      .patch(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/services/${serviceId}`, { emailSubscribers: emailSubscribers });
  }

  public getOrgSettings(): ng.IPromise<any> {
    const params = {
      basicInfo: true,
      disableCache: true,
    };
    return this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId(), params)
      .then(response => {
        if (!_.isEmpty(response.data.orgSettings)) {
          return response.data.orgSettings;
        }
      });
  }

  public setDisableEmailSendingToUser(calSvcDisableEmailSendingToEndUser: boolean): ng.IPromise<''> {
    const settings = {
      calSvcDisableEmailSendingToEndUser: !!calSvcDisableEmailSendingToEndUser,
    };
    return this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
  }

  public setDefaultWebExSiteOrgLevel(defaultWebExSiteOrgLevel: string): ng.IPromise<''> {
    const settings = {
      calSvcDefaultWebExSite: defaultWebExSiteOrgLevel,
    };
    return this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
  }

  public setOneButtonToPushIntervalMinutes(bgbIntervalMinutes: number | null): ng.IPromise<''> {
    const settings = {
      bgbIntervalMinutes: bgbIntervalMinutes,
    };
    return this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
  }

  public getAllWebExSiteOrgLevel(): string[] {
    const conferenceServices = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    const webexSiteUrls = _.map(conferenceServices, (conferenceService: any) => {
      return conferenceService.license.siteUrl;
    });
    return _.uniq(webexSiteUrls);
  }

  public enableService(serviceId: HybridServiceId): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/services/${serviceId}`;
    return this.$http.patch(url, { enabled: true })
      .then(this.extractData);
  }

  public disableService = (serviceId: HybridServiceId): ng.IPromise<''> => {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/services/${serviceId}`;
    return this.$http.patch(url, { enabled: false })
      .then(this.extractData);
  }

  public isServiceEnabled(serviceId: HybridServiceId): ng.IPromise<boolean> {
    return this.getServices()
      .then((services) => {
        const service = _.find(services, { id: serviceId });
        return service ? service.enabled : false;
      });
  }

  private extractData(res) {
    return res.data;
  }

  private extractItems(res) {
    return this.extractData(res).items;
  }
}

export default angular
  .module('core.service-descriptor-service', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/core/config/urlConfig'),
  ])
  .service('ServiceDescriptorService', ServiceDescriptorService)
  .name;
