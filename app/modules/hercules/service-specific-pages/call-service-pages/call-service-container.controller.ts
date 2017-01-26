import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';

export class CallServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: this.$translate.instant('common.resources'),
    state: 'call-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
    state: 'call-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_ucmc',
      serviceId: () => 'squared-fusion-uc',
      firstTimeSetup: false,
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
    type: 'small',
  };

  /* @ngInject */
  constructor($modal,
              $state: ng.ui.IStateService,
              ClusterService,
              Notification: Notification,
              private $translate: ng.translate.ITranslateService,
              ServiceDescriptor,
              ServiceStateChecker,
              USSService, ) {
    super($modal, $state, ClusterService, Notification, ServiceDescriptor, ServiceStateChecker, USSService, ['squared-fusion-uc'], 'c_ucmc');
    this.addConnectIfEnabled();
  }

  private addConnectIfEnabled() {
    this.ServiceDescriptor.isServiceEnabled('squared-fusion-ec', (error, enabled) => {
      if (!error && enabled) {
        this.servicesId.push('squared-fusion-ec');
        this.subscribeStatusesSummary.cancel();
        this.extractSummary();
        this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
      }
    });
  }

}

angular
  .module('Hercules')
  .controller('CallServiceContainerController', CallServiceContainerController);
