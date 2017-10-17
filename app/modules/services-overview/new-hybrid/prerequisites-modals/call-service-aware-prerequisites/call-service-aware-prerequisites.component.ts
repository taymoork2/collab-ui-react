import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

export class CallServiceAwarePrerequisitesComponentController implements ng.IComponentController {

  public checkboxes = {
    determineCertificateTrust: false,
    registerAllDomains: false,
    installOrUpgradeUCM: false,
    configureRouting: false,
    setFormat: false,
    enableUCMServices: false,
    enableServiceability: false,
  };
  private flagPrefix = 'atlas.hybrid.setup.call.aware.';
  public onChange: Function;

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

export class CallServiceAwarePrerequisitesComponent implements ng.IComponentOptions {
  public controller = CallServiceAwarePrerequisitesComponentController;
  public template = require('modules/services-overview/new-hybrid/prerequisites-modals/call-service-aware-prerequisites/call-service-aware-prerequisites.component.html');
  public bindings = {
    onChange: '&',
  };
}
