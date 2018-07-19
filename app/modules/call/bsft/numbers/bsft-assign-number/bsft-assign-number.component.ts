import { FtswConfigService, Site } from 'modules/call/bsft/shared';

class BsftAssignNumberCtrl implements ng.IComponentController {
  public isFtsw: boolean;
  public mainNumber: string;
  public vmNumber: string;
  public onChangeFn: Function;
  public site: Site;
  public messages: any = {};
  public numberOptions: string[] = ['+12145556666', '+12145556668', '+12145556667', '+12145559999', '+121455599889']; //to-do temp data
  public currentOptions: string[] = [];

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private FtswConfigService: FtswConfigService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public $onInit() {
    if (this.isFtsw) {
      this.$scope.$emit('wizardNextText', 'saveLocation');
    }

    this.currentOptions = _.clone(this.numberOptions);

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }
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

  public assignNumberBsftNext() {
    this.FtswConfigService.addSite(this.site); //move to number assignment when available
  }
}

export class BsftAssignNumberComponent implements ng.IComponentOptions {
  public controller = BsftAssignNumberCtrl;
  public template = require('./bsft-assign-number.component.html');
  public bindings = {
    isFtsw: '<',
  };
}
