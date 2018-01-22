class MultiStepModalController implements ng.IComponentController {
  public cancel?: Function;
  public back?: Function;
  public next?: Function;
  public save?: Function;
  public showBodyScrollIndicator?: string;

  public showFooter(): boolean {
    const buttonFunction = this.cancel || this.back || this.next || this.save;
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
    showBodyScrollIndicator: '@?',
  };
}
