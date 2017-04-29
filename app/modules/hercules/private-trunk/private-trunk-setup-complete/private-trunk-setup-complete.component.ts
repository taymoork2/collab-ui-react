
export class PrivateTrunkSetupCompleteCtrl implements ng.IComponentController {
  public verifiedDomains: string;
  public callSelection: Array<string>;
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
   ) {
  }

  public $onInit() {
    this.callSelection = [
      this.$translate.instant('servicesOverview.cards.privateTrunk.interSite'),
      this.$translate.instant('servicesOverview.cards.privateTrunk.pstn'),
    ];
  }
}

export class PrivateTrunkSetupCompleteComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCompleteCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-setup-complete/private-trunk-setup-complete.html';
  public bindings = {
    verifiedDomains: '<',
  };
}
