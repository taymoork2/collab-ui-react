import { PrivateTrunkPrereqService } from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import { IOption } from 'modules/hercules/private-trunk/private-trunk-setup/private-trunk-setup';

export enum DomainRadioType {
  DOMAIN = <any>'domain',
  NONE = <any>'none',
}

export class PrivateTrunkDomainCtrl implements ng.IComponentController {
  public domainOptions: IOption[];
  public domains: string[];
  public domainSelected: IOption[];
  public domainOptionRadio: DomainRadioType;
  public selectPlaceHolder: string;
  public onChangeFn: Function;
  public domainDesc: { title: string, desc: string };
  public isFirstTimeSetup: boolean;

  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
  ) {
  }

  public $onInit(): void {
    if ( _.isUndefined(this.domainSelected)) {
      this.domainSelected = [];
    }
    this.selectPlaceHolder = this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');
    if (_.isUndefined(this.domainOptionRadio)) {
      this.domainOptionRadio = DomainRadioType.DOMAIN;
    }
    if (this.isFirstTimeSetup) {
      this.domainDesc = {
        title: this.$translate.instant('servicesOverview.cards.privateTrunk.select'),
        desc: this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomainDesc'),
      };
    } else {
      this.domainDesc = {
        title: this.$translate.instant('servicesOverview.cards.privateTrunk.domains'),
        desc: this.$translate.instant('servicesOverview.cards.privateTrunk.domainDesc'),
      };
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { domains, domainSelected, isDomain } = changes;
    if ( !_.isUndefined(domainSelected) && _.isArray(domainSelected.currentValue) && domainSelected.currentValue.length) {
      this.setSelected(domainSelected);
    }

    if (domains && _.isArray(domains.currentValue) && domains.currentValue.length) {
      this.setDomainInfo(domains);
    }
    this.domainOptions = _.map(this.domains, (domain) => {
      if (_.isArray(this.domainSelected) && this.isDomainSelected(domain)) {
        return ({ value: domain, label: domain, isSelected: true });
      } else {
        return ({ value: domain, label: domain, isSelected: false });
      }
    });
    if (!_.isUndefined(isDomain) && !_.isUndefined(isDomain.currentValue)) {
      this.domainOptionRadio =  isDomain.currentValue ? DomainRadioType.DOMAIN : DomainRadioType.NONE;
    }
  }

  public isDomainSelected(domain: string): boolean {
    const temp = _.find(this.domainSelected, (selected) => {
      return (selected.value === domain) ? true : false ;
    });
    return (temp !== undefined);
  }

  public setDomainInfo(domain: ng.IChangesObject<any>): void {
    this.domains = _.cloneDeep(domain.currentValue);
  }

  public setSelected(domainSelected: ng.IChangesObject<any>): void {
    if (!_.isUndefined(domainSelected) && domainSelected.currentValue) {
      this.domainSelected = _.cloneDeep(domainSelected.currentValue);
      this.selectPlaceHolder = this.domainSelected.length > 1 ? this.domainSelected.length + this.$translate.instant('servicesOverview.cards.privateTrunk.plural') : (this.domainSelected.length === 1 ) ? this.domainSelected.length + this.$translate.instant('servicesOverview.cards.privateTrunk.singular') : this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');
    }
  }

  public changeRadio(): void {
    if (this.domainOptionRadio === DomainRadioType.NONE) {
      _.forEach(this.domainOptions, (options) => {
        options.isSelected = false;
      });
      this.selectPlaceHolder = this.$translate.instant('servicesOverview.cards.privateTrunk.selectDomain');
    }
    this.change([]);
  }

  public changeSelected(): void {
    if (this.domainSelected && _.isArray(this.domainSelected)) {
      this.change(this.domainSelected);
    }
  }

  public change(domainSelected: IOption[]): void {
    this.onChangeFn({
      isDomain: (this.domainOptionRadio === DomainRadioType.DOMAIN),
      domainSelected: domainSelected,
    });
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }

  public gotoSettings(): void {
    this.PrivateTrunkPrereqService.dismissModal();
    this.$state.go('settings', {
      showSettings: 'domains',
    });
  }

}

export class PrivateTrunkDomainComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkDomainCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-domain/private-trunk-domain.html');
  public bindings = {
    isFirstTimeSetup: '<',
    domains: '<',
    domainSelected: '<',
    isDomain: '<',
    onChangeFn: '&',
  };
}
