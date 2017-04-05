import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';
import * as jstz from 'jstimezonedetect';

export class HybridServicesUtils {
  // Visual order to respect accross Atlas UI
  private static readonly orderedConnectors: ConnectorType[] = [
    'c_mgmt',
    'c_cal',
    'c_ucmc',
    'mf_mgmt',
    'hds_app',
    'cs_mgmt',
    'cs_context',
    'ucm_mgmt',
    'c_serab',
  ];
  private static readonly orderedServices: HybridServiceId[] = [
    'squared-fusion-mgmt',
    'squared-fusion-cal',
    'squared-fusion-gcal',
    'squared-fusion-uc',
    'squared-fusion-ec',
    'squared-fusion-media',
    'spark-hybrid-datasecurity',
    'contact-center-context',
    'squared-fusion-khaos',
    'squared-fusion-servicability',
  ];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public connectorType2ServicesId(connectorType: ConnectorType): HybridServiceId[] {
    switch (connectorType) {
      case 'c_cal':
        return ['squared-fusion-cal'];
      case 'c_ucmc':
        return ['squared-fusion-uc', 'squared-fusion-ec'];
      case 'c_mgmt':
        return ['squared-fusion-mgmt'];
      case 'mf_mgmt':
        return ['squared-fusion-media'];
      case 'hds_app':
        return ['spark-hybrid-datasecurity'];
      case 'cs_mgmt':
        return ['contact-center-context'];
      default:
        return [];
    }
  }

  public serviceId2ConnectorType(serviceId: HybridServiceId): ConnectorType | undefined {
    switch (serviceId) {
      case 'squared-fusion-cal':
        return 'c_cal';
      case 'squared-fusion-uc':
      case 'squared-fusion-ec':
        return 'c_ucmc';
      case 'squared-fusion-mgmt':
        return 'c_mgmt';
      case 'squared-fusion-media':
        return 'mf_mgmt';
      case 'spark-hybrid-datasecurity':
        return 'hds_app';
      case 'contact-center-context':
        // Will it become ['cs_mgmt', 'cs_context']?
        return 'cs_mgmt';
      default:
        return undefined;
    }
  }

  public serviceId2Icon(serviceId): string {
    switch (serviceId) {
      case 'squared-fusion-cal':
      case 'squared-fusion-gcal':
        return 'icon icon-circle-calendar';
      case 'squared-fusion-uc':
        return 'icon icon-circle-call';
      case 'squared-fusion-media':
        return 'icon icon-circle-telepresence';
      case 'spark-hybrid-datasecurity':
        return 'icon icon-circle-lock';
      case 'contact-center-context':
        return 'icon icon-circle-world';
      default:
        return 'icon icon-circle-question';
    }
  }

  /**
   * To be used with the `orderBy` AngularJS filter:
   * `ng-repeat="service in $ctrl.servicesStatuses | orderBy:'serviceId':false:$ctrl.hybridServicesComparator"`
   * @param serviceType1 service id
   * @param serviceType2 service id
   */
  public hybridServicesComparator(serviceType1: HybridServiceId, serviceType2: HybridServiceId): -1 | 0 | 1 {
    if (serviceType1 === serviceType2) {
      return 0;
    }
    if (_.indexOf(HybridServicesUtils.orderedServices, serviceType1) < _.indexOf(HybridServicesUtils.orderedServices, serviceType2)) {
      return -1;
    } else {
      return 1;
    }
  }

  /**
   * To be used with the `orderBy` AngularJS filter:
   * `ng-repeat="connector in $ctrl.connectors | orderBy:'connectorType':false:$ctrl.hybridConnectorsComparator"`
   * @param connectorType1 connector type
   * @param connectorType2 connector type
   */
  public hybridConnectorsComparator(connectorType1: ConnectorType, connectorType2: ConnectorType): -1 | 0 | 1 {
    if (connectorType1 === connectorType2) {
      return 0;
    }
    if (_.indexOf(HybridServicesUtils.orderedConnectors, connectorType1) < _.indexOf(HybridServicesUtils.orderedConnectors, connectorType2)) {
      return -1;
    } else {
      return 1;
    }
  }

  // TODO: Move to another service, like ReleaseChannel (yet to be created)
  public getLocalizedReleaseChannel = (channel: string): string => {
    return this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + channel);
  }

  // TODO: Move to an Internationalization service (yet to be created)
  public getTimeSinceText(timestamp: number): string {
    let timestampText = moment(timestamp).calendar(moment(), {
      sameElse: 'LL', // e.g. December 15, 2016
    });
    if (_.startsWith(timestampText, 'Last') || _.startsWith(timestampText, 'Today') || _.startsWith(timestampText, 'Tomorrow') || _.startsWith(timestampText, 'Yesterday')) {
      // Lowercase the first letter for some well known English terms (it just looked bad with these uppercase). Other languages are left alone.
      timestampText = timestampText[0].toLowerCase() + timestampText.slice(1);
    }
    return this.$translate.instant('hercules.cloudExtensions.sinceTime', {
      timestamp: timestampText,
    });
  }

  public getLocalTimestamp(timestamp: number, format: string): string {
    let timezone = jstz.determine().name();
    if (timezone === null || _.isUndefined(timezone)) {
      timezone = 'UTC';
    }
    return moment(timestamp).local().tz(timezone).format(format || 'LLL (z)');
  }
}

angular
  .module('Hercules')
  .service('HybridServicesUtils', HybridServicesUtils);
