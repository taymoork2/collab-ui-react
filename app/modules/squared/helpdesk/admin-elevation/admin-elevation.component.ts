import { AdminElevationService } from './admin-elevation.service';

enum ElevationState {
  init = 'INIT',
  validSingature = 'VALID_SIGNATURE',
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
  //private readonly TEST_SIGNATURE: string = 'RmJLWlp5WDdNUGxUdnNJLzdPbXc1OEsrVlY5aXZoVE94SjVyNjZiYy9jcz0=';
  //private readonly INVALID_SIGNATURE: string = 'invalid';

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              private AdminElevationService: AdminElevationService) {
    this.$log.debug('orgId', this.orgId);
    this.$log.debug('signature', this.signature);
    this.$log.debug('customerUserId', this.customerUserId);
    this.$log.debug('userId', this.userId);
    this.$log.debug('timestamp', this.timestamp);
  }

  public $onInit() {
    if (!this.orgId || !this.signature || !this.customerUserId || !this.userId || !this.signature) {
      this.$state.go('404');
    } else {
      // TODO remove when testing done
      //if (this.signature !== this.INVALID_SIGNATURE) {
        //this.signature = this.TEST_SIGNATURE;
      //}
      this.AdminElevationService.validateSignature(this.orgId, this.signature, this.customerUserId, this.userId, this.timestamp).then((data) => {
        this.helpDeskOperatorName = data.helpDeskOperatorName;
        this.orgName = data.orgName;
        this.state = ElevationState.validSingature;
      }).catch((error) => {
        this.$log.error('validateSignature', error);
        // TODO other page ?
        this.state = ElevationState.invalidSignature;
        // TODO Figure out
        // this.$state.go('404');
      });
    }
  }

  public rejectElevation() {
    this.state = ElevationState.rejected;
    this.$log.debug('rejectElevation');
    this.AdminElevationService.invalidateSignature(this.orgId, this.signature, this.userId, this.timestamp, this.customerUserId).then((data) => {
      this.$log.info('rejectElevation ok', data);
    }).catch((error) => {
      this.state = ElevationState.error;
      this.$log.error('rejectElevation', error);
    });
  }

  public grantElevation() {
    this.$log.debug('grantElevation');
    this.state = ElevationState.elevationDone;
    this.AdminElevationService.elevateToAdmin(this.orgId, this.signature, this.userId, this.timestamp, this.customerUserId).then((data) => {
      this.$log.info('grantElevation ok', data);
    }).catch((error) => {
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
