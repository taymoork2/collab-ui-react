import { FtswConfigService, Site } from 'modules/call/bsft/shared';
import { BsftOrder, IPortingNumber } from '../../shared';

class BsftAssignNumberCtrl implements ng.IComponentController {
  public isFtsw: boolean;
  public mainNumber: string;
  public vmNumber: string;
  public onChangeFn: Function;
  public site: Site;
  public messages: any = {};
  public numberOptions: string[] = [];
  public currentOptions: string[] = [];
  public loading: boolean;
  public ftsw: boolean;
  public form: ng.IFormController;
  public bsftOrder: BsftOrder;
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
    this.numberOptions = [];

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }

    this.initComponentData();
    this.loading = false;
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
    if (!_.isUndefined(this.site)) {
      this.bsftOrder = this.FtswConfigService.getOrder(this.site.uuid);
      const nums: IPortingNumber[] = _.get(this.bsftOrder, 'portedNumbers');
      if (!_.isEmpty(nums)) {
        //existing order
        this.numberOptions = _.map(nums, num => _.get(num.telephoneNumber, 'e164Number'));
      }
      if (!_.isUndefined(this.bsftOrder.mainNumber)) {
        this.mainNumber = _.get(_.get(this.bsftOrder.mainNumber, 'telephoneNumber'), 'e164Number');
      }
      if (!_.isUndefined(this.bsftOrder.vmNumber)) {
        this.vmNumber = _.get(_.get(this.bsftOrder.vmNumber, 'telephoneNumber'), 'e164Number');
      }
      this.currentOptions = _.clone(this.numberOptions);
    }
  }

  public onChangeNumber(number): void {
    if (!_.isUndefined(this.vmNumber)) {
      this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.vmNumber);
    }
    this.mainNumber = number;
    this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.mainNumber);
  }

  public onChangeVmNumber(number): void {
    if (!_.isUndefined(this.mainNumber)) {
      this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.mainNumber);
    }
    this.vmNumber = number;
    this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.vmNumber);
  }

  public assignNumberBsftNext() {
    this.FtswConfigService.addSite(this.site);
    this.FtswConfigService.assignNumbers(this.site.uuid, this.mainNumber, this.vmNumber);
    //move to number assignment when available
  }
}

export class BsftAssignNumberComponent implements ng.IComponentOptions {
  public controller = BsftAssignNumberCtrl;
  public template = require('./bsft-assign-number.component.html');
  public bindings = {
    ftsw: '<',
    mainNumber: '<',
    vmNumber: '<',
  };
}
