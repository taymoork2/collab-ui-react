class MultiStepModalController implements ng.IComponentController {
  public cancel?: Function;
  public back?: Function;
  public next?: Function;
  public save?: Function;
  public custom?: Function;
  public showBodyScrollIndicator?: string;
  public customFinish?: Function;

  public showFooter(): boolean {
    const buttonFunction = this.cancel || this.back || this.next || this.save || this.customFinish;
    return !!buttonFunction;
  }

  public get showScrollIndicator() {
    return _.isUndefined(this.showBodyScrollIndicator) ? false : this.showBodyScrollIndicator;
  }
}

export class MultiStepModalComponent implements ng.IComponentOptions {
  public controller = MultiStepModalController;
  public template = require('./multi-step-modal.html');
  public transclude = true;
  public bindings = {
    l10nTitle: '@',
    l10nTitleValues: '<',
    l10nWarningFooter: '@?',
    dismiss: '&?',
    close: '&?',
    cancel: '&?',
    cancelDisabled: '<?',
    cancelRemoved: '<?',
    back: '&?',
    backDisabled: '<?',
    backRemoved: '<?',
    next: '&?',
    nextDisabled: '<?',
    nextRemoved: '<?',
    nextLoading: '<?',
    save: '&?',
    saveDisabled: '<?',
    saveRemoved: '<?',
    saveLoading: '<?',
    custom: '&?',
    customButtonRemoved: '<?',
    customDisabled: '<?',
    customButtonL10n: '@?',
    showBodyScrollIndicator: '@?',
    customFinish: '&?',
    customFinishDisabled: '<?',
    customFinishRemoved: '<?',
    customFinishLoading: '<?',
    customFinishL10nLabel: '@?',
  };
}
