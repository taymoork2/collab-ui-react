import { ExpresswayContainerController } from 'modules/hercules/service-specific-pages/common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class ImpServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
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
      firstTimeSetup: false,
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
    type: 'small',
  };

  /* @ngInject */
  constructor(
    $modal,
    $state: ng.ui.IStateService,
    $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    public clusterId: string,
    Notification: Notification,
    ServiceDescriptorService: ServiceDescriptorService,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $state, $timeout, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['spark-hybrid-impinterop'], 'c_imp');
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
  }

}

angular
  .module('Hercules')
  .controller('ImpServiceContainerController', ImpServiceContainerController);
