import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

class GoogleCalendarPrerequisitesComponentController implements ng.IComponentController {

  public checkboxes = {
    gSuiteOrganization: false,
    webExSite: false,
    sparkOrganization: false,
    matchingEmails: false,
    aclAdminAccount: false,
    removeHangouts: false,
  };
  private flagPrefix = 'atlas.hybrid.setup.google.calendar.';
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
    this.$window.open('https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cloudCollaboration/spark/hybridservices/calendarservice/cmgt_b_deploy-spark-hybrid-calendar-service/cmgt_b_deploy-spark-hybrid-calendar-service_chapter_01001.html');
  }

}

export class GoogleCalendarPrerequisitesComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarPrerequisitesComponentController;
  public template = require('./google-calendar-prerequisites.component.html');
  public bindings = {
    close: '&',
    dismiss: '&',
  };
}
