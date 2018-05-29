import { AdminElevationService } from './admin-elevation.service';

enum ElevationState {
  init = 'INIT',
  validSignature = 'VALID_SIGNATURE',
  elevationDone = 'ELEVATION_DONE',
  rejected = 'REJECTED',
  invalidSignature = 'INVALID_SIGNATURE',
  error = 'ERROR',
}

class HelpdeskAdminElevationComponentCtrl implements ng.IComponentController {

  public helpDeskOperatorName: string;
  public orgName: string;
  public state: ElevationState = ElevationState.init;

  private orgId: string;
  private signature: string;
  private customerUserId: string;
  private userId: string;
  private timestamp: string;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              private AdminElevationService: AdminElevationService) {
  }

  public $onInit() {
    if (!this.orgId || !this.signature || !this.customerUserId || !this.userId || !this.signature) {
      this.$state.go('404');
    } else {
      this.AdminElevationService.validateSignature(this.orgId, this.signature, this.customerUserId, this.userId, this.timestamp).then((data) => {
        this.helpDeskOperatorName = data.helpDeskOperatorName;
        this.orgName = data.orgName;
        this.state = ElevationState.validSignature;
      }).catch((error) => {
        this.$log.error('validateSignature', error);
        this.state = ElevationState.invalidSignature;
      });
    }
  }

  public rejectElevation() {
    this.state = ElevationState.rejected;
    this.AdminElevationService.invalidateSignature(this.orgId, this.signature, this.userId, this.timestamp, this.customerUserId).then(() => {
    }).catch((error) => {
      this.state = ElevationState.error;
      this.$log.error('rejectElevation', error);
    });
  }

  public grantElevation() {
    this.state = ElevationState.elevationDone;
    this.AdminElevationService.elevateToAdmin(this.orgId, this.signature, this.userId, this.timestamp, this.customerUserId).then(() => {
    }).catch((error) => {
      this.state = ElevationState.error;
      this.$log.error('grantElevation', error);
    });
  }
}

export class HelpdeskAdminElevationComponent implements ng.IComponentOptions {

  public controller = HelpdeskAdminElevationComponentCtrl;
  public template = require('./admin-elevation.html');

  public bindings = {
    orgId: '<',
    signature: '<',
    customerUserId: '<',
    userId: '<',
    timestamp: '<',
  };
}
