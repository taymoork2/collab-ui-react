import { PrivateTrunkPrereqService } from './private-trunk-prereq.service';
import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

export class PrivateTrunkPrereqCtrl implements ng.IComponentController {
  public domains: string[];
  public hasVerifiedDomain: boolean;

  public checkboxes = {
    openPort5062: false,
    verifyDomains: false,
    obtainCertificates: false,
    openRequiredPorts: false,
    runSupportedSoftware: false,
    determinePSTN: false,
    prepareExpressway: false,
  };
  private flagPrefix = 'atlas.hybrid.ept.setup.';

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $window: ng.IWindowService,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
    private Notification: Notification,
  ) { }

  public $onInit(): void {
    this.getFlags();
    this.getDomainData();
  }

  private getFlags(): void {
    const prefixedFlags = this.HybridServicesPrerequisitesHelperService.getPrefixedFlags(this.flagPrefix, this.checkboxes);
    this.HybridServicesPrerequisitesHelperService.readFlags(prefixedFlags, this.flagPrefix, this.checkboxes)
      .then((checkboxes) => {
        this.checkboxes = checkboxes;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.commonPrerequisites.cannotReachFlagService');
      });
  }

  private getDomainData(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains()
      .then((verifiedDomains) => {
        this.hasVerifiedDomain = (_.isArray(verifiedDomains) && verifiedDomains.length > 0);
        this.domains = verifiedDomains;
      });
  }

  public gotoSettings(): void {
    this.PrivateTrunkPrereqService.dismissModal();
    this.$state.go('settings', {
      showSettings: 'domains',
    });
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }

  public openDocumentation(): void {
    this.$window.open('https://www.cisco.com/go/spark-calling-branch-office');
  }

  public processChange(flagName: string, newValue: boolean): void {
    this.HybridServicesPrerequisitesHelperService.processFlagChange(flagName, this.flagPrefix, newValue);
  }

}
export class PrivateTrunkPrereqComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkPrereqCtrl;
  public template = require('./private-trunk-prereq.html');
}
