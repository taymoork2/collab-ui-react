import { ProPackService } from 'modules/core/proPack/proPack.service';

export class FirstTimeSetupController implements ng.IComponentController {

  public proPackEnabled: boolean;


  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private ProPackService: ProPackService,
  ) { }

  public $onInit(): void {
    this.$q.all({
      proPackEnabled: this.ProPackService.hasProPackPurchased(),
    }).then((toggles) => {
      this.proPackEnabled = toggles.proPackEnabled;
    });
  }

  public getAppTitle() {
    return this.proPackEnabled ? this.$translate.instant('loginPage.titlePro') : this.$translate.instant('loginPage.titleNew');
  }
}

export class FirstTimeSetupComponent implements ng.IComponentOptions {
  public controller = FirstTimeSetupController;
  public template = require('./first-time-setup.html');
  public bindings = {};
}
