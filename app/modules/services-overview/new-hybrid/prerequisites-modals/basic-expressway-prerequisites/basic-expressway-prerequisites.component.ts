import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

export class BasicExpresswayPrerequisitesComponentController implements ng.IComponentController {

  public onChange: Function;
  private flagPrefix = 'atlas.hybrid.setup.call.expressway.';
  public checkboxes = {
    planCapacity: false,
    redundancy: false,
    followRequirements: false,
    bypassFirstTimeWizard: false,
    configureExpresswayC: false,
    openPortOnFirewall: false,
  };

  /* @ngInject */
  constructor(
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    const prefixedFlags = this.HybridServicesPrerequisitesHelperService.getPrefixedFlags(this.flagPrefix, this.checkboxes);
    this.HybridServicesPrerequisitesHelperService.readFlags(prefixedFlags, this.flagPrefix, this.checkboxes)
      .then((checkboxes) => {
        this.checkboxes = checkboxes;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.commonPrerequisites.cannotReachFlagService');
      })
      .finally(() => {
        this.onChange(this.HybridServicesPrerequisitesHelperService.buildNumbersCheckedObject(this.checkboxes));
      });
  }

  public processChange(flagName: string, newValue: boolean): void {
    this.HybridServicesPrerequisitesHelperService.processFlagChange(flagName, this.flagPrefix, newValue);
    this.onChange(this.HybridServicesPrerequisitesHelperService.buildNumbersCheckedObject(this.checkboxes));
  }

  public openDocumentation(): void {
    this.onChange({
      options: {
        openDocumentation: true,
      },
    });
  }

}

export class BasicExpresswayPrerequisitesComponent implements ng.IComponentOptions {
  public controller = BasicExpresswayPrerequisitesComponentController;
  public template = require('modules/services-overview/new-hybrid/prerequisites-modals/basic-expressway-prerequisites/basic-expressway-prerequisites.component.html');
  public bindings = {
    onChange: '&',
  };
}
