
class BsftNumbersCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public loading: boolean = false;
  public form: ng.IFormController;
  public prevNumbers: string[] = [];
  public bsftNumbers: string[] = [];
  public isBsftPorted: boolean = false;
  public tokenNumbers: string[] = [];
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    // private Authinfo, //todo
    ) {}

  public $onInit(): void {
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);

    if (this.ftsw) {
      this.$scope.$watch(() => {
        return _.get(this.form, '$invalid');
      }, invalid => {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      });

      this.$scope.$watch(() => {
        return this.loading;
      }, loading => {
        this.$scope.$emit('wizardNextButtonDisable', !!loading);
      });
    }
  }

  private initComponentData() {
    //todo
  }

  public onAdd(numbers, isBsftPorted): void {
    this.isBsftPorted = isBsftPorted;
    if (isBsftPorted) {
      this.onChangeBsftPortedNumbers(numbers);
    } else {
      this.onChangePrevPortedNumbers(numbers);
    }
    this.$onInit();
  }

  public onChangePrevPortedNumbers(numbers): void {
    this.prevNumbers = _.concat(this.prevNumbers, numbers);
  }

  public onChangeBsftPortedNumbers(numbers): void {
    this.bsftNumbers = _.concat(this.bsftNumbers, numbers);
  }

  public onChange(numbers: string[]): void {
    this.tokenNumbers = numbers;
  }
}

export class BsftNumbersComponent implements ng.IComponentOptions {
  public controller = BsftNumbersCtrl;
  public template = require('modules/call/bsft/numbers/bsft-numbers.component.html');
  public bindings = {
    ftsw: '<',
    uuid: '<',
  };
}
