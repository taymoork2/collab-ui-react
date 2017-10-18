import { PrivateTrunkPrereqService } from './private-trunk-prereq.service';
interface ITranslationMessages {
  helpText: string;
}
export class PrivateTrunkPrereqCtrl implements ng.IComponentController {
  public domains: string[];
  public hasVerifiedDomain: boolean = false;
  public connectivityHelpMessages: ITranslationMessages[];
  public fullServiceHelpMessages: ITranslationMessages[];

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
  ) {
    this.initModalHelpMessage();
  }

  public $onInit(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains().then(verifiedDomains => {
      this.hasVerifiedDomain = (_.isArray(verifiedDomains) && verifiedDomains.length > 0);
      this.domains = verifiedDomains;
    });
  }

  public initModalHelpMessage(): void {
    this.connectivityHelpMessages = [{
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.certificateHelp'),
    }, {
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.dNSzoneHelp'),
    }, {
      helpText: this.$translate.instant('servicesOverview.cards.privateTrunk.defaultTrustHelpNew'),
    }];
    this.fullServiceHelpMessages = [{
      helpText:  this.$translate.instant('servicesOverview.cards.privateTrunk.allZonesHelp'),
    }, {
      helpText:  this.$translate.instant('servicesOverview.cards.privateTrunk.routingHelp'),
    }];
  }

  public gotoSettings(): void {
    this.PrivateTrunkPrereqService.dismissModal();
    this.$state.go('settings', {
      showSettings: 'domains',
    });
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }

}
export class PrivateTrunkPrereqComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkPrereqCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-prereq/private-trunk-prereq.html');
  public bindings = {
  };
}
