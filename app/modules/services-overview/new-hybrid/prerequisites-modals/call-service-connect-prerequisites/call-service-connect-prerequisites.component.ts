import { HybridServicesPrerequisitesHelperService } from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class CallServiceConnectPrerequisitesComponentController implements ng.IComponentController {

  public checkboxes = {
    isAwareSetup: false,
    prepareEdge: false,
    deployPair: false,
    installOrUpgrade: false,
    downloadDirectoryConnector: false,
    followUCMrequirements: false,
    useSupportedCodecs: false,
    configureSettingsForCTI: false,
    configureToAvoidAudioOnly: false,
  };
  private flagPrefix = 'atlas.hybrid.setup.call.connect.';
  public onChange: Function;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private HybridServicesPrerequisitesHelperService: HybridServicesPrerequisitesHelperService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

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
        this.findCallServiceAwareStatus();
      });
  }

  private findCallServiceAwareStatus() {
    return this.ServiceDescriptorService.isServiceEnabled('squared-fusion-uc')
      .then((setup) => {
        this.checkboxes['isAwareSetup'] = setup;
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

export class CallServiceConnectPrerequisitesComponent implements ng.IComponentOptions {
  public controller = CallServiceConnectPrerequisitesComponentController;
  public template = require('modules/services-overview/new-hybrid/prerequisites-modals/call-service-connect-prerequisites/call-service-connect-prerequisites.component.html');
  public bindings = {
    onChange: '&',
  };
}
