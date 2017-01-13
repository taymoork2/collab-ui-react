interface InlineEditTextForm extends ng.IFormController {
  editInput: ng.INgModelController;
}

class InlineEditText implements ng.IComponentController {
  public value: string;
  public newValue: string;
  public asyncValidators: {[key: string]: Function};
  public validators: {[key: string]: Function};
  public validationMessages: Object;

  public editEnabled = false;
  public saveInProgress = false;
  public onSave: Function;
  public form: InlineEditTextForm;
  public modelOptions: ng.INgModelOptions = {
    updateOn: 'default submit blur',
    debounce: {
      blur: 0,
      default: 0,
      submit: 0,
    },
  };

  public isTextClickable: boolean | undefined;
  public onTextClick: Function | undefined;
  public showTextLink: boolean;

  private static readonly ESCAPE_KEY = 27;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
  ) {}

  public $onInit(): void {
    if (this.asyncValidators) {
      this.modelOptions.debounce.default = 250;
    }

    this.determineShowTextLink(this.isTextClickable);
  }

  public $onChanges(changes: { isTextClickable: ng.IChangesObject }): void {
    if (changes.isTextClickable) {
      this.determineShowTextLink(changes.isTextClickable.currentValue);
    }
  }

  private determineShowTextLink(isTextClickable: boolean | undefined): void {
    // Only show text link if onTextClick is a function and optional isTextClickable is defined and true
    this.showTextLink = _.isFunction(this.onTextClick) && (typeof isTextClickable === 'undefined' || isTextClickable);
  }

  public enableEdit(): void {
    this.newValue = _.clone(this.value);
    this.editEnabled = true;
  }

  public disableEdit(): void {
    this.editEnabled = false;
  }

  private saveSuccess(newValue: string): void {
    this.value = newValue;
    this.disableEdit();
  }

  public keyPress(e: KeyboardEvent): void {
    if (e.keyCode === InlineEditText.ESCAPE_KEY) {
      this.disableEdit();
    }
    e.stopPropagation();
  }

  public save(): void {
    this.saveInProgress = true;
    let newValue = this.form.$valid ? this.newValue : this.form.editInput.$viewValue;
    this.$q.resolve(this.onSave({
      newValue: newValue,
    }))
      .then(() => this.saveSuccess(newValue))
      .finally(() => this.saveInProgress = false);
  }
}

export class InlineEditTextComponent implements ng.IComponentOptions {
  public templateUrl = 'modules/core/inlineEditText/inlineEditText.html';
  public controller = InlineEditText;
  public bindings = {
    value: '<',
    isTextClickable: '<?',
    onTextClick: '&?',
    onSave: '&',
    validators: '<',
    asyncValidators: '<',
    validationMessages: '<',
  };
}
