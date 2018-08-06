import { FtswConfigService, Site, BsftOrder, IPortedNumber } from 'modules/call/bsft/shared';

class BsftNumbersCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public siteid: string;
  public form: ng.IFormController;
  public prevNumbers: string[] = [];
  public bsftNumbers: string[] = [];
  public isBsftPorted: boolean = false;
  public numbers: string[] = [];
  public site: Site;
  public bsftOrder: BsftOrder;
  public modalInvalid: Function;

  public totalNumbers: string[];
  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private FtswConfigService: FtswConfigService,
    ) {}

  public $onInit(): void {
    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }

    this.$scope.$watch(() => {
      return _.get(this.totalNumbers, 'length');
    }, numbers => {
      if (this.ftsw) {
        this.$scope.$emit('wizardNextButtonDisable', numbers < 2);
      } else {
        this.modalInvalid({
          invalid: numbers < 2,
        });
      }
    });

    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'nextAssignNumbers');
    } else {
      this.$scope.$on('bsftNumbersNext', () => this.setupNumberBsftNext());
    }
    this.initComponentData();
  }

  private initComponentData() {
    if (!_.isUndefined(this.site)) {
      this.bsftOrder = this.FtswConfigService.getOrder(this.site.uuid);
      const nums: IPortedNumber[] = _.get(this.bsftOrder, 'portedNumbers');
      if (!_.isEmpty(nums)) {
        //existing order
        this.bsftNumbers = _.map(_.filter(nums, num => !num.provisionAsActive), num => _.get(num.portingNumber, 'telephoneNumber.e164'));
        this.prevNumbers = _.map(_.filter(nums, num => num.provisionAsActive), num => _.get(num.portingNumber, 'telephoneNumber.e164'));
      }
      this.updateTotal();
    }
  }

  public onAdd(numbers, isBsftPorted): void {
    this.isBsftPorted = isBsftPorted;

    if (isBsftPorted) {
      this.bsftNumbers = _.uniq(_.concat(this.bsftNumbers, numbers));
    } else {
      this.prevNumbers = _.uniq(_.concat(this.prevNumbers, numbers));
    }
    this.updateTotal();
  }

  public onChangePrevPortedNumbers(numbers): void {
    this.prevNumbers = numbers;
    this.updateTotal();
  }

  public updateTotal(): void {
    this.totalNumbers = _.concat(this.prevNumbers, this.bsftNumbers);
  }

  public onChangeBsftPortedNumbers(numbers): void {
    this.bsftNumbers = numbers;
    this.updateTotal();
  }

  public onChange(numbers: string[]): void {
    this.numbers = numbers;
  }

  public setupNumberBsftNext() {
    this.FtswConfigService.setCurrentSite(this.site);
    this.bsftOrder.portedNumbers = [];
    _.forEach(this.bsftNumbers, (number) => {
      this.bsftOrder.portedNumbers.push({ portingNumber: { telephoneNumber: { e164: number } }, provisionAsActive: false });
    });
    _.forEach(this.prevNumbers, (number) => {
      this.bsftOrder.portedNumbers.push({ portingNumber: { telephoneNumber: { e164: number } }, provisionAsActive: true });
    });
    this.FtswConfigService.setOrder(this.bsftOrder);
  }
}

export class BsftNumbersComponent implements ng.IComponentOptions {
  public controller = BsftNumbersCtrl;
  public template = require('modules/call/bsft/numbers/bsft-numbers.component.html');
  public bindings = {
    ftsw: '<',
    modalInvalid: '&?',
  };
}
