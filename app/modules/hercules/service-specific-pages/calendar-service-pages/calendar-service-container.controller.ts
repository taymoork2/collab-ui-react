import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class CalendarServiceContainerController extends ExpresswayContainerController {
  public tabs = [{
    title: this.$translate.instant('common.resources'),
    state: 'calendar-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
    state: 'calendar-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_cal',
      serviceId: () => 'squared-fusion-cal',
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
    super($modal, $state, $timeout, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['squared-fusion-cal'], 'c_cal');
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
    if (this.hasCapacityFeatureToggle) {
      this.tabs.push({
        title: this.$translate.instant('common.users'),
        state: 'calendar-service.users',
      });
    }
  }
}

angular
  .module('Hercules')
  .controller('CalendarServiceContainerController', CalendarServiceContainerController);
