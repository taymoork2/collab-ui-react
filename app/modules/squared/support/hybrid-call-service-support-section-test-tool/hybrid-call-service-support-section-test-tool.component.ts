import { IToolkitModalService } from 'modules/core/modal/index';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

class HybridCallServiceSupportSectionTestToolCtrl implements ng.IComponentController {

  public callServiceConnectIsEnabled = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

  public $onInit() {
    this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
      .then((isEnabled: boolean) => {
        this.callServiceConnectIsEnabled = isEnabled;
      });
  }

  public openTool(): void {
    this.$modal.open({
      template: require('modules/hercules/user-sidepanel/hybrid-call-service-test-call-tool/hybrid-call-service-test-call-tool-modal.html'),
      controller: 'HybridCallServiceTestToolModalController',
      controllerAs: 'vm',
      resolve: {
        incomingCallerUserId: () => undefined,
        allowChangingCaller: () => true,
      },
    });
  }

}

export class HybridCallServiceSupportSectionTestToolComponent implements ng.IComponentOptions {
  public controller = HybridCallServiceSupportSectionTestToolCtrl;
  public template = require('modules/squared/support/hybrid-call-service-support-section-test-tool/hybrid-call-service-support-section-test-tool.component.html');
}
