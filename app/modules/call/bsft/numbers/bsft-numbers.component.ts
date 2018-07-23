import { FtswConfigService, Site } from 'modules/call/bsft/shared';

class BsftNumbersCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public uuid: string;
  public siteid: string;
  public loading: boolean = false;
  public form: ng.IFormController;
  public prevNumbers: string[] = [];
  public bsftNumbers: string[] = [];
  public isBsftPorted: boolean = false;
  public numbers: string[] = [];
  public site: Site;

  public totalNumbers: string[];
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private FtswConfigService: FtswConfigService,
    // private Authinfo, //todo
    ) {}

  public $onInit(): void {
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = true);

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }

    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'nextAssignNumbers');

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
    if (this.totalNumbers.length === 2) {
      this.loading = false;
    }
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
  }
}

export class BsftNumbersComponent implements ng.IComponentOptions {
  public controller = BsftNumbersCtrl;
  public template = require('modules/call/bsft/numbers/bsft-numbers.component.html');
  public bindings = {
    ftsw: '<',
  };
}
