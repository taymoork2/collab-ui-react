import { PrivateTrunkDomainService } from './privateTrunkDomain.service';
interface IDomain {
  text: string;
}
interface ITranslationMessages {
  helpText: string;
}
export class PrivateTrunkDomainCtrl implements ng.IComponentController {
  public domain: Array<IDomain>;
  public hasVerifiedDomain: boolean = false;
  public connectivityHelpMessages: Array<ITranslationMessages>;
  public fullServiceHelpMessages: Array<ITranslationMessages>;
  public isSetup: boolean;
  public title: string;

  /* @ngInject */
  constructor(
    private $state,
    private DomainManagementService,
    private $translate: ng.translate.ITranslateService,
    private PrivateTrunkDomainService: PrivateTrunkDomainService,
  ) {
    this.initModalHelpMessage();
    this.title = (this.isSetup) ? this.$translate.instant('servicesOverview.cards.privateTrunk.setupTitle') : this.$translate.instant('servicesOverview.cards.privateTrunk.prereqTitle');
  }

  public $onInit(): void {
    this.getVerifiedDomains();
  }

  public getVerifiedDomains(): Array<IDomain> {
    let vm = this;
    return this.DomainManagementService.getVerifiedDomains().then(domains => {
      let verifiedDomains: Array<any> = _.chain(domains)
        .filter({ status : 'verified' })
        .map('text')
        .value();
      vm.hasVerifiedDomain = (_.isArray(verifiedDomains) && verifiedDomains.length > 0);
      return vm.domain = verifiedDomains;
    });
  }

  public initModalHelpMessage(): void {
    this.connectivityHelpMessages = [{
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.certificateHelp'),
    }, {
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.dNSzoneHelp'),
    }, {
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.defaultTrustHelp'),
    }];
    this.fullServiceHelpMessages = [{
      helpText:  this.$translate.instant('servicesOverview.cards.privateTrunk.allZonesHelp'),
    }, {
      helpText:  this.$translate.instant('servicesOverview.cards.privateTrunk.routingHelp'),
    }];
  }

  public gotoSettings(): void {
    this.PrivateTrunkDomainService.dismissModal();
    this.$state.go('settings', {
      showSettings: 'domains',
    });
  }

  public dismiss(): void {
    this.PrivateTrunkDomainService.dismissModal();
  }

}
export class PrivateTrunkDomainComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkDomainCtrl;
  public templateUrl = 'modules/hercules/privateTrunk/privateTrunkDomain/privateTrunkDomain.html';
  public bindings = {
    isSetup: '<',
  };
}
