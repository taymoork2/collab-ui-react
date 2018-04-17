import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';

export class HybridServicesUtilsService {
  // Visual order to respect across Atlas UI
  private static readonly orderedConnectors: ConnectorType[] = [
    'c_mgmt',
    'c_cal',
    'c_ucmc',
    'cs_mgmt',
    'cs_context',
    'c_imp',
    'mf_mgmt',
    'hds_app',
    'ucm_mgmt',
    'c_serab',
  ];
  private static readonly orderedServices: HybridServiceId[] = [
    'squared-fusion-mgmt',
    'squared-fusion-cal',
    'squared-fusion-o365',
    'squared-fusion-gcal',
    'squared-fusion-uc',
    'squared-fusion-ec',
    'contact-center-context',
    'spark-hybrid-impinterop',
    'ept',
    'squared-fusion-media',
    'spark-hybrid-datasecurity',
    'squared-fusion-khaos',
    'squared-fusion-servicability',
  ];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
  ) {}

  public connectorType2ServicesId(connectorType: ConnectorType): HybridServiceId[] {
    switch (connectorType) {
      case 'c_cal':
        return ['squared-fusion-cal'];
      case 'c_ucmc':
        return ['squared-fusion-uc', 'squared-fusion-ec'];
      case 'c_imp':
        return ['spark-hybrid-impinterop'];
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

  public serviceId2ConnectorType(serviceId: HybridServiceId): ConnectorType {
    switch (serviceId) {
      case 'squared-fusion-cal':
        return 'c_cal';
      case 'squared-fusion-uc':
      case 'squared-fusion-ec':
        return 'c_ucmc';
      case 'squared-fusion-mgmt':
        return 'c_mgmt';
      case 'spark-hybrid-impinterop':
        return 'c_imp';
      case 'squared-fusion-media':
        return 'mf_mgmt';
      case 'spark-hybrid-datasecurity':
        return 'hds_app';
      case 'contact-center-context':
        return 'cs_mgmt';
    }
    throw new Error(`Unknown Service ID: ${serviceId}`);
  }

  public serviceId2Icon(serviceId: HybridServiceId): string {
    switch (serviceId) {
      case 'squared-fusion-cal':
      case 'squared-fusion-gcal':
        return 'icon icon-circle-calendar';
      case 'squared-fusion-uc':
      case 'ept':
        return 'icon icon-circle-call';
      case 'spark-hybrid-impinterop':
        return 'icon icon-circle-message';
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
  public hybridServicesComparator = (serviceType1: { value: HybridServiceId }, serviceType2: { value: HybridServiceId }): -1 | 0 | 1 => {
    if (serviceType1.value === serviceType2.value) {
      return 0;
    }
    if (_.indexOf(HybridServicesUtilsService.orderedServices, serviceType1.value) < _.indexOf(HybridServicesUtilsService.orderedServices, serviceType2.value)) {
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
  public hybridConnectorsComparator(connectorType1: { value: ConnectorType }, connectorType2: { value: ConnectorType }): -1 | 0 | 1 {
    if (connectorType1.value === connectorType2.value) {
      return 0;
    }
    if (_.indexOf(HybridServicesUtilsService.orderedConnectors, connectorType1.value) < _.indexOf(HybridServicesUtilsService.orderedConnectors, connectorType2.value)) {
      return -1;
    } else {
      return 1;
    }
  }

  public getAckFlagForHybridServiceId(entitlement: HybridServiceId): string {
    return `fms.services.${entitlement}.acknowledged`;
  }

  /* $q does not provide a function like Q.allSettled.
     Our own version is adapted from http://www.codeducky.org/q-allsettled-for-angular-promises/ */
  public allSettled = (promises: ng.IPromise<any>[]) => {
    const deferred = this.$q.defer();
    let counter = 0;
    const results = _.isArray(promises) ? [] : {};

    _.forEach(promises, (promise: ng.IPromise<any>, key: string) => {
      counter++;
      this.$q.resolve(promise)
        .then((value) => {
          if (results.hasOwnProperty(key)) {
            return;
          }
          results[key] = {
            status: 'fulfilled',
            value: value,
          };
          if (!(--counter)) {
            deferred.resolve(results);
          }
        })
        .catch((reason) => {
          if (results.hasOwnProperty(key)) {
            return;
          }
          results[key] = {
            status: 'rejected',
            reason: reason,
          };
          if (!(--counter)) {
            deferred.resolve(results);
          }
        });
    });

    if (counter === 0) {
      deferred.resolve(results);
    }

    return deferred.promise;
  }

}

export default angular
  .module('hercules.hybridServicesUtils', [])
  .service('HybridServicesUtilsService', HybridServicesUtilsService)
  .name;
