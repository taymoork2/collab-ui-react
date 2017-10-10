class MultiStepModalController implements ng.IComponentController {
}

export class MultiStepModalComponent implements ng.IComponentOptions {
  public controller = MultiStepModalController;
  public template = require('./multi-step-modal.html');
  public transclude = true;
  public bindings = {
    l10nTitle: '@',
    dismiss: '&?',
    cancel: '&?',
    cancelDisabled: '<?',
    cancelRemoved: '<?',
    back: '&?',
    backDisabled: '<?',
    backRemoved: '<?',
    next: '&?',
    nextDisabled: '<?',
    nextRemoved: '<?',
    save: '&?',
    saveDisabled: '<?',
    saveRemoved: '<?',
  };
}
