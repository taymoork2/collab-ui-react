import { IToolkitModalService } from 'modules/core/modal/index';
class HybridCallServiceTestCallToolCtrl implements ng.IComponentController {

  private userId;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) { }

  public $onInit() {
  }

  public openTool(): void {
    this.$modal.open({
      template: require('modules/hercules/user-sidepanel/hybrid-call-service-test-call-tool/hybrid-call-service-test-call-tool-modal.html'),
      controller: 'HybridCallServiceTestToolModalController',
      controllerAs: 'vm',
      resolve: {
        incomingCallerUserId: () => this.userId,
        allowChangingCaller: () => false,
      },
    });
  }


}


export class HybridCallServiceTestCallToolComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceTestCallToolCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-call-service-test-call-tool/hybrid-call-service-test-call-tool.component.html');
  public bindings = {
    userId: '<',
  };
}
