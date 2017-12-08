import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

class Office365PrerequisitesComponentController implements ng.IComponentController {

  public checkboxes = {
    officeOrganization: false,
    webExSite: false,
    sparkOrganization: false,
    matchingEmails: false,
  };
  private flagPrefix = 'atlas.hybrid.setup.office365.';
  public close: Function;
  public dismiss: Function;

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
    private Notification: Notification,
  ) { }

  public $onInit(): void {
    const prefixedFlags = this.HybridServicesPrerequisitesHelperService.getPrefixedFlags(this.flagPrefix, this.checkboxes);
    this.HybridServicesPrerequisitesHelperService.readFlags(prefixedFlags, this.flagPrefix, this.checkboxes)
      .then((checkboxes) => {
        this.checkboxes = checkboxes;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.commonPrerequisites.cannotReachFlagService');
      });
  }

  public processChange(flagName: string, newValue: boolean): void {
    this.HybridServicesPrerequisitesHelperService.processFlagChange(flagName, this.flagPrefix, newValue);
  }

  public openDocumentation(): void {
    this.$window.open('https://www.cisco.com/go/hybrid-services-calendar');
  }

}

export class Office365PrerequisitesComponent implements ng.IComponentOptions {
  public controller = Office365PrerequisitesComponentController;
  public template = require('./office-365-prerequisites.component.html');
  public bindings = {
    close: '&',
    dismiss: '&',
  };
}
