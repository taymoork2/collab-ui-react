import HybridServicesPrerequisitesHelperServiceModuleName, { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName, { Notification } from 'modules/core/notifications';

import '../_common-hybrid-prerequisites.scss';

export class HybridMediaPrerequisitesController {

  public checkboxes = {
    meetMinimumSystemRequirements: false,
    verifyDeploymentModels: false,
    ensureNetworkConnectivity: false,
    ensureBandwidth: false,
    acquireInformation: false,
    chooseSupportedHardware: false,
    verifyHypervisor: false,
  };
  private flagPrefix = 'atlas.hybrid.media.setup.';

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
    private Notification: Notification,
  ) {
    this.init();
  }

  public init() {
    const prefixedFlags = this.HybridServicesPrerequisitesHelperService.getPrefixedFlags(this.flagPrefix, this.checkboxes);
    this.HybridServicesPrerequisitesHelperService.readFlags(prefixedFlags, this.flagPrefix, this.checkboxes)
      .then((checkboxes) => {
        this.checkboxes = checkboxes;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.commonPrerequisites.cannotReachFlagService');
      });
  }

  public openDocumentation() {
    this.$window.open('https://www.cisco.com/go/video-mesh');
  }

  public processChange(flagName: string, newValue: boolean): void {
    this.HybridServicesPrerequisitesHelperService.processFlagChange(flagName, this.flagPrefix, newValue);
  }
}

export default angular
  .module('hybrid-media-prerequisites', [
    NotificationModuleName,
    HybridServicesPrerequisitesHelperServiceModuleName,
  ])
  .controller('HybridMediaPrerequisitesController', HybridMediaPrerequisitesController)
  .name;
