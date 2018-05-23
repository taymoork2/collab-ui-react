import { SnrService, SnrData } from './snr.service';
import { IPatterns, Patterns } from './snr';
import { HuronCustomerService } from 'modules/huron/customer/customer.service';
import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';
import { Notification } from 'modules/core/notifications';

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}

const CALLDESTINPUTS = ['external', 'uri', 'custom'];

class SnrCtrl implements ng.IComponentController {

  public ownerId: string;
  public snrData: SnrData;
  public callDestInputs: string[];
  private form: ng.IFormController;
  public customTranslations: ITranslationMessages;
  public inputTranslations: ICallDestinationTranslate;
  public customNumberValidationPatern: RegExp;
  public loading: boolean = false;
  public processing: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronCustomerService: HuronCustomerService,
    private SnrService: SnrService,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private $modal,
    private Notification: Notification,
    private $scope: ng.IScope,
    private $q: ng.IQService,

  ) {
    this.callDestInputs = CALLDESTINPUTS;
    this.customTranslations = {
      placeholderText: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      helpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
    };
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
    this.customNumberValidationPatern = this.CallDestinationTranslateService.getCustomNumberValidationPatern();
  }

  public $onInit(): void {
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
  }

  private initComponentData(): ng.IPromise<any> {
    return this.SnrService.loadSnrData(this.ownerId).then(snr => this.snrData = snr);
  }

  public onCancel() {
    this.snrData = this.SnrService.getOriginalConfig();
    this.resetForm();
  }

  public remove(): void {
    this.$modal.open({
      template: require('modules/huron/snr/snrDeleteConfirmation.tpl.html'),
      type: 'dialog',
    }).result.then(() => {
      this.delete();
    });
  }

  public onSnrLinesChanged(patterns: string[]) {
    this.snrData.snr.patterns = new Patterns({
      pattern: patterns,
    } as IPatterns);
  }

  public onAnswerTooLateTimerChanged(answerTooLateTimer: string) {
    this.snrData.snr.answerTooLateTimer = answerTooLateTimer;
    this.checkForChanges();
  }

  public save(): void {
    this.processing = true;
    this.SnrService.saveSnr(this.ownerId, this.snrData.snr.uuid || '', this.snrData.snr).then(() => {
      this.Notification.success('singleNumberReachPanel.success');
      this.$scope.$emit('SNR_CHANGE', this.snrData.snr.enableMobileConnect);
    }).catch(() => {
      this.Notification.error('singleNumberReachPanel.error');
    }).finally(() => {
      this.processing = false;
      this.resetForm();
    });
  }

  public delete(): void {
    this.SnrService.deleteSnr(this.ownerId, this.snrData.snr.uuid || '').then(() => {
      this.initComponentData();
      this.Notification.success('singleNumberReachPanel.removeSuccess');
    }).catch(() => {
      this.Notification.error('singleNumberReachPanel.error');
    }).finally(() => {
      this.resetForm();
    });
  }

  public getRegionCode(): any {
    return this.HuronCustomerService.getVoiceCustomer();
  }

  public setSnr(destination: string): void {
    this.snrData.snr.destination = _.clone(destination);
    this.checkForChanges();
  }

  private checkForChanges(): void {
    if (this.SnrService.matchesOriginalConfig(this.snrData)) {
      this.resetForm();
    }
  }

  private resetForm() {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

}

export class SnrComponent implements ng.IComponentOptions {
  public controller = SnrCtrl;
  public template = require('./snr.component.html');
  public bindings = {
    ownerId: '<',
  };
}
