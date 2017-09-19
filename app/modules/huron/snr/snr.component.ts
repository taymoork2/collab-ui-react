import { SnrService } from './snr.service';
import { SingleNumberReach } from './snr';
import { HuronCustomerService } from 'modules/huron/customer/customer.service';
import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}
const SNR_WAIT_SECONDS_OPTIONS = [{
  name: '20',
  value: '20000',
}, {
  name: '30',
  value: '30000',
}, {
  name: '45',
  value: '45000',
}, {
  name: '60',
  value: '60000',
}];
const CALLDESTINPUTS = ['external', 'uri', 'custom'];

class SnrCtrl implements ng.IComponentController {

  public ownerId: string;
  public snrInfo: SingleNumberReach;
  private snrWaitSeconds: any;
  private snrWaitSecondsOptions: any;
  private callDestInputs: string[];
  private snrEnabled: boolean = false;
  private form: ng.IFormController;
  private customTranslations: ITranslationMessages;
  private inputTranslations: ICallDestinationTranslate;
  private snrId: string = '';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronCustomerService: HuronCustomerService,
    private SnrService: SnrService,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private $modal,
    private Notification,
    private $scope: ng.IScope,

  ) {
    this.callDestInputs = CALLDESTINPUTS;
    this.snrWaitSeconds = SNR_WAIT_SECONDS_OPTIONS[0];
    this.snrWaitSecondsOptions = SNR_WAIT_SECONDS_OPTIONS;
    this.customTranslations = {
      placeholderText: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      helpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
    };
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
    this.init();
  }

  public init(): void {
    this.snrId = '';
    this.snrInfo = new SingleNumberReach();
    this.snrEnabled = false;
    this.SnrService.getSnrList(this.ownerId).then((data) => {
      if (data && data.length > 0) {
        this.snrId = data[0].uuid;
        this.snrInfo = {
          enableMobileConnect: data[0].enableMobileConnect,
          destination: data[0].destination,
          answerTooLateTimer: data[0].answerTooLateTimer,
        };
        this.snrWaitSeconds = _.find(SNR_WAIT_SECONDS_OPTIONS, { value: this.snrInfo.answerTooLateTimer });
        this.snrEnabled = (this.snrInfo.enableMobileConnect === 'true');
      }
      this.resetForm();
    });
  }

  public resetForm() {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

  public reset() {
    this.init();
  }

  public showRemove(): boolean {
    return ( !_.isEmpty(this.snrId) && !this.snrEnabled);
  }

  public remove(): void {
    this.$modal.open({
      template: require('modules/huron/snr/snrDeleteConfirmation.tpl.html'),
      type: 'dialog',
    }).result.then(() => {
      this.save(true);
    });
  }

  public save(isDelete: boolean = false): void {
    let snr: SingleNumberReach = new SingleNumberReach({
      destination: this.snrInfo.destination,
      answerTooLateTimer: this.snrWaitSeconds.value,
      enableMobileConnect: (this.snrEnabled) ? 'true' : 'false',
    });
    if (isDelete) {
      snr = new SingleNumberReach();
    }
    this.SnrService.saveSnr(this.ownerId, this.snrId, snr).then(() => {
      const msg = (isDelete) ? this.$translate.instant('singleNumberReachPanel.removeSuccess') : this.$translate.instant('singleNumberReachPanel.success');
      this.Notification.notify([msg], 'success');
      this.$scope.$emit('SNR_CHANGE', this.snrEnabled);
      this.init();
    }).catch(() => {
      const msg = this.$translate.instant('singleNumberReachPanel.error');
      this.Notification.notify([msg], 'error');
    });
  }

  public getRegionCode(): any {
    return this.HuronCustomerService.getVoiceCustomer();
  }

  public setSnr(destination: string): void {
    this.snrInfo.destination = destination;
  }

}

export class SnrComponent implements ng.IComponentOptions {
  public controller = SnrCtrl;
  public template = require('modules/huron/snr/snr.html');
  public bindings = {
    ownerId: '<',
  };
}
