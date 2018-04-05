import { ExpresswayContainerController } from 'modules/hercules/service-specific-pages/common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class ImpServiceContainerController extends ExpresswayContainerController {
  public tabs = [{
    title: this.$translate.instant('common.resources'),
    state: 'imp-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
    state: 'imp-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_imp',
      serviceId: () => 'spark-hybrid-impinterop',
      options: {
        firstTimeSetup: false,
        hasCapacityFeatureToggle: this.hasCapacityFeatureToggle,
      },
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
    type: 'small',
  };

  public clusterId: string;

  /* @ngInject */
  constructor(
    $modal,
    $state: ng.ui.IStateService,
    $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    Notification: Notification,
    ServiceDescriptorService: ServiceDescriptorService,
    ServiceStateChecker,
    USSService,
    private hasCapacityFeatureToggle,
  ) {
    super($modal, $state, $timeout, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['spark-hybrid-impinterop'], 'c_imp');
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
    if (this.hasCapacityFeatureToggle) {
      this.tabs.push({
        title: this.$translate.instant('common.users'),
        state: 'imp-service.users',
      });
    }
  }
}

angular
  .module('Hercules')
  .controller('ImpServiceContainerController', ImpServiceContainerController);
