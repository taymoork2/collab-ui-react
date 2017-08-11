import { HybridServiceId, IServiceAlarm, IAlarmReplacementValues, ConnectorType } from 'modules/hercules/hybrid-services.types';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';

export interface IAllowedRegistrationHost {
  ttlInSeconds: number;
  hostname: string;
  url: string;
}

/**
 * This service does HTTP requests to FMS endpoints that aren't clusters or connectors
 * The ones seldomly used (/allowedRegistrationHosts, /channels, etc.)
 */
export class HybridServicesExtrasService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private HybridServicesI18NService: HybridServicesI18NService,
    private UrlConfig,
  ) {
    this.extractDataAndTranslateAlarms = this.extractDataAndTranslateAlarms.bind(this);
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
    this.notifyReadOnlyLaunch = this.notifyReadOnlyLaunch.bind(this);
  }

  public addPreregisteredClusterToAllowList(hostname: string, clusterId: string): ng.IPromise<any> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/allowedRegistrationHosts`;
    return this.$http.post(url, {
      hostname: hostname,
    });
  }

  public getAlarms(serviceId: HybridServiceId, orgId?: string): ng.IPromise<IServiceAlarm[]> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/alarms?serviceId=${serviceId}&sourceType=cloud`;
    return this.$http.get(url)
      .then(this.extractDataAndTranslateAlarms);
  }

  public getPreregisteredClusterAllowList(clusterId: string): ng.IPromise<IAllowedRegistrationHost[]> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/allowedRegistrationHosts`;
    return this.$http.get(url)
      .then(this.extractDataFromResponse)
      .then(({ items }) => {
        return items as IAllowedRegistrationHost[];
      });
  }

  public getReleaseNotes(releaseChannel: string, connectorType: ConnectorType): ng.IPromise<string> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/channels/${releaseChannel}/packages/${connectorType}?fields=@wide`;
    return this.$http.get(url)
      .then(this.extractDataFromResponse)
      .then((data) => {
        return _.get(data, 'releaseNotes', '');
      });
  }

  public notifyReadOnlyLaunch(): ng.IPromise<any> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/internals/actions/invalidateUser/invoke`;
    return this.$http.post(url, null);
  }

  private convertToTranslateReplacements(alarmReplacementValues: IAlarmReplacementValues[]) {
    return _.reduce(alarmReplacementValues, (translateReplacements, replacementValue) => {
      translateReplacements[replacementValue.key] = replacementValue.type === 'timestamp' ? this.HybridServicesI18NService.getLocalTimestamp(replacementValue.value) : replacementValue.value;
      return translateReplacements;
    }, {});
  }

  private extractDataAndTranslateAlarms(res) {
    const alarms: IServiceAlarm[] = _.get(res, 'data.items', []);
    return _.chain(alarms)
      .sortBy(this.getAlarmSortOrder)
      .map((alarm) => {
        const translateReplacements = this.convertToTranslateReplacements(alarm.replacementValues);
        alarm.title = this.translateWithFallback(alarm.key + '.title', alarm.title, translateReplacements);
        alarm.description = this.translateWithFallback(alarm.key + '.description', alarm.description, translateReplacements);
        return alarm;
      })
      .value();
  }

  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): T {
    return _.get<T>(response, 'data');
  }

  private getAlarmSortOrder(alarm: IServiceAlarm): number {
    switch (alarm.severity) {
      case 'critical':
        return -1;
      case 'error':
        return 0;
      case 'warning':
        return 1;
      default:
        return 2;
    }
  }

  private translateWithFallback(alarmKey: string, fallback: string, translateReplacements: any) {
    const translationKey = `hercules.serviceAlarms.${alarmKey}`;
    const translation = this.$translate.instant(translationKey, translateReplacements);
    return _.includes(translation, translationKey) ? fallback : translation;
  }
}

export default angular
  .module('hercules.extras', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/hybrid-services-i18n.service').default,
    require('modules/core/config/urlConfig'),
  ])
  .service('HybridServicesExtrasService', HybridServicesExtrasService)
  .name;
