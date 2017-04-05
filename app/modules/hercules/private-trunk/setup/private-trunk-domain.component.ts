import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq';

export interface IOption {
  value: string;
  label: string;
  isSelected: boolean;
}

export enum DomainRadioType {
  DOMAIN = <any>'domain',
  NONE = <any>'none',
}

export class PrivateTrunkDomainCtrl implements ng.IComponentController {
  public domainOptions: Array<IOption> = [];
  public domains: Array<string>;
  public domainSelected: Array<IOption> = [];
  public domainOptionRadio: DomainRadioType = DomainRadioType.DOMAIN;
  public selectPlaceHolder: string;
  public onChangeFn: Function;
  public isNext: boolean = false;
  public currentStepIndex: number;
  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.selectPlaceHolder = this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');

  }

  public $onInit(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains().then(verifiedDomains => {
      this.domainOptions = _.map(verifiedDomains, (domain) => {
        return({ value: domain, label: domain, isSelected: false });
      });
    });
    this.selectPlaceHolder = this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');
    this.domainOptionRadio = DomainRadioType.DOMAIN;
    this.currentStepIndex = 1;
  }

  public nextStepChange(): void {
  }
  public changeRadio(): void {
    if (this.domainOptionRadio === DomainRadioType.NONE) {
      this.domainSelected = [];
      _.forEach(this.domainOptions, (options) => {
        options.isSelected = false;
      });
      this.selectPlaceHolder = this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');
      this.change([]);
    }
  }

  public changeSelected(): void {
    if (this.domainSelected && _.isArray(this.domainSelected)) {
      let domainArrayStr: Array<any> = _.values(this.domainSelected); //.map('value').value();
      this.change(domainArrayStr);
    }
  }

  public checkNextButton(): boolean {
    let isNextButtonEnabled = false;
    if (this.domainOptionRadio === DomainRadioType.NONE || (this.domainOptionRadio === DomainRadioType.DOMAIN && this.domainSelected && this.domainSelected.length)) {
      isNextButtonEnabled = true;
    }
    return isNextButtonEnabled;
  }

  public change(domainArrayStr: Array<string>): void {
    this.onChangeFn({
      nextButton: this.checkNextButton(),
      domains: domainArrayStr,
    });
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }
}

export class PrivateTrunkDomainComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkDomainCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-domain.html';
  public bindings = {
    selected: '<',
    onChangeFn: '&',
  };
}
