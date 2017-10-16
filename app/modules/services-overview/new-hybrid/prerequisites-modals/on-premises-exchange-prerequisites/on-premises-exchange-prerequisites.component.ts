import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';

export class OnPremisesExchangePrerequisitesComponentController implements ng.IComponentController {

  public checkboxes = {
    configureImpersonation: false,
    runSupportedExchange: false,
    ensureActiveDirectory: false,
    providePortAccess: false,
    configureWebEx: false,
    setUpTMS: false,
    configureTMSXE: false,
    reviewLicensing: false,
  };
  private flagPrefix = 'atlas.hybrid.setup.calendar.onpremises.';
  public onChange: Function;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
  ) { }

  public $onInit(): void {
    const prefixedFlags = this.HybridServicesPrerequisitesHelperService.getPrefixedFlags(this.flagPrefix, this.checkboxes);
    this.HybridServicesPrerequisitesHelperService.readFlags(prefixedFlags, this.flagPrefix, this.checkboxes)
      .then((checkboxes) => {
        this.checkboxes = checkboxes;
        this.onChange(this.HybridServicesPrerequisitesHelperService.buildNumbersCheckedObject(this.checkboxes));
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.commonPrerequisites.cannotReachFlagService');
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

export class OnPremisesExchangePrerequisitesComponent implements ng.IComponentOptions {
  public controller = OnPremisesExchangePrerequisitesComponentController;
  public template = require('modules/services-overview/new-hybrid/prerequisites-modals/on-premises-exchange-prerequisites/on-premises-exchange-prerequisites.component.html');
  public bindings = {
    onChange: '&',
  };
}
