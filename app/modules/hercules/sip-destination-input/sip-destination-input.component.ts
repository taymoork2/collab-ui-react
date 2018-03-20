import { IUSSOrg, USSService } from 'modules/hercules/services/uss.service';
import { Notification } from 'modules/core/notifications/notification.service';
import { IFormattedResult } from 'modules/hercules/services/l2sip-service';
import { IToolkitModalService } from 'modules/core/modal/index';

interface ITestResultSet {
  succeeded: boolean;
  resultSet: IFormattedResult[];
}

export class SipDestinationInputController implements ng.IComponentController {
  public clusterId: string;
  public sipDestination: string;
  public savingSip: boolean = false;
  public originalValue: string;
  public sipDestinationTestSucceeded: boolean | undefined;
  public sipDestinationTestResultSet: ITestResultSet;
  public onDestinationSaved?: Function;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private Authinfo,
    private Notification: Notification,
    private USSService: USSService,
  ) {}

  private updateSipDomain(): void {
    this.savingSip = true;
    const orgInfo: IUSSOrg = {
      id: this.Authinfo.getOrgId(),
      sipDomain: this.sipDestination,
    };
    (this.clusterId ? this.USSService.addSipDomainForCluster(this.clusterId, this.sipDestination) : this.USSService.updateOrg(orgInfo))
      .then(() => {
        this.Notification.success('hercules.errors.sipDomainSaved');
        if (this.onDestinationSaved) {
          this.onDestinationSaved({
            sipDestination: this.sipDestination,
          });
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.errors.sipDomainInvalid');
      })
      .finally(() => {
        this.savingSip = false;
      });
  }

  /* Callback from the verify-sip-destination component  */
  public onDestinationSave = () => {
    this.updateSipDomain();
  }

  /* Callback from the verify-sip-destination component  */
  public onResultReady = (succeeded: boolean, resultSet: ITestResultSet) => {
    this.sipDestinationTestSucceeded = succeeded;
    this.sipDestinationTestResultSet = resultSet;
    this.originalValue = _.clone(this.sipDestination);
  }

  /* Callback from the verify-sip-destination component  */
  public onTestStarted = () => {
    this.sipDestinationTestSucceeded = undefined;
  }

  public openSipTestResults(): void {
    this.$modal.open({
      resolve: {
        resultSet: () => this.sipDestinationTestResultSet,
      },
      controller: 'VerifySipDestinationModalController',
      controllerAs: 'vm',
      template: require('modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html'),
      type: 'full',
    });
  }

  public warnSipDestination(): boolean {
    return this.sipDestinationTestSucceeded !== undefined && !this.sipDestinationTestSucceeded;
  }
}

export class SipDestinationInputComponent implements ng.IComponentOptions {
  public controller = SipDestinationInputController;
  public template = require('./sip-destination-input.html');
  public bindings = {
    clusterId: '<?',
    sipDestination: '<',
    onDestinationSaved: '&?',
  };
}
