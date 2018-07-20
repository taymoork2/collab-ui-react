class BsftAssignNumberCtrl implements ng.IComponentController {
  public mainNumber: string;
  public vmNumber: string;
  public onChangeFn: Function;
  public messages: any = {};
  public numberOptions: string[] = ['+12145556666', '+12145556668', '+12145556667', '+12145559999', '+121455599889']; //to-do temp data
  public currentOptions: string[] = [];
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public $onInit() {
    this.currentOptions = _.clone(this.numberOptions);
  }

  public onChangeNumber(number): void {
    if (!_.isUndefined(this.vmNumber)) {
      this.numberOptions = _.pull(this.currentOptions, this.vmNumber);
    }
    this.mainNumber = number;
    this.numberOptions = _.pull(this.numberOptions, number);
  }

  public onChangeVmNumber(number): void {
    if (!_.isUndefined(this.mainNumber)) {
      this.numberOptions = _.pull(this.currentOptions, this.mainNumber);
    }
    this.vmNumber = number;
    this.numberOptions = _.pull(this.numberOptions, number);
  }
}

export class BsftAssignNumberComponent implements ng.IComponentOptions {
  public controller = BsftAssignNumberCtrl;
  public template = require('./bsft-assign-number.component.html');
  public bindings = {
    isFtsw: '<',
  };
}
