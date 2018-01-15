
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

class SnrWaitTimerCtrl implements ng.IComponentController {

  public answerTooLateTimer: string;
  public onChangeFn: Function;
  private snrWaitSeconds: any;
  private snrWaitSecondsOptions: any;

  /* @ngInject */
  constructor() {
    this.snrWaitSeconds = SNR_WAIT_SECONDS_OPTIONS[0];
    this.snrWaitSecondsOptions = SNR_WAIT_SECONDS_OPTIONS;
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { answerTooLateTimer } = changes;

    if (answerTooLateTimer && answerTooLateTimer.currentValue) {
      this.snrWaitSeconds = this.setCurrentOption(answerTooLateTimer.currentValue);
    }
  }

  public onAnswerTooLateTimerChanged(): void {
    this.onChange(this.snrWaitSeconds.value);
  }

  private onChange(answerTooLateTimer: string): void {
    this.onChangeFn({
      answerTooLateTimer: answerTooLateTimer,
    });
  }

  private setCurrentOption(currentValue: string) {
    const existingOption = _.find(this.snrWaitSecondsOptions, { value: currentValue });
    if (!existingOption) {
      return SNR_WAIT_SECONDS_OPTIONS[0];
    } else {
      return existingOption;
    }
  }
}

export class SnrWaitTimerComponent implements ng.IComponentOptions {
  public controller = SnrWaitTimerCtrl;
  public template = require('./snr-wait-timer.component.html');
  public bindings = {
    answerTooLateTimer: '<',
    onChangeFn: '&',
  };
}
