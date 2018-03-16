import { ProPackService } from 'modules/core/proPack/proPack.service';

export class FirstTimeSetupController implements ng.IComponentController {

  public proPackEnabled: boolean;
  public clusterCreation: boolean = false;
  public ovaDownload: boolean = false;
  public radio: string;
  public ovaType: string;
  private onRadioUpdate?: Function;
  private onOvaTypeUpdate?: Function;

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

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterCreation , ovaDownload } = changes;
    if (clusterCreation && clusterCreation.currentValue) {
      this.clusterCreation = clusterCreation.currentValue;
    }
    if (ovaDownload && ovaDownload.currentValue) {
      this.ovaDownload = ovaDownload.currentValue;
    }
  }

  public getAppTitle() {
    return this.proPackEnabled ? this.$translate.instant('loginPage.titlePro') : this.$translate.instant('loginPage.titleNew');
  }

  public radioSelector () {
    if (_.isFunction(this.onRadioUpdate)) {
      this.onRadioUpdate({ response: { radio: this.radio } });
    }
  }

  public ovaTypeSelector() {
    if (_.isFunction(this.onOvaTypeUpdate)) {
      this.onOvaTypeUpdate({ response: { ovaType: this.ovaType } });
    }
  }
}

export class FirstTimeSetupComponent implements ng.IComponentOptions {
  public controller = FirstTimeSetupController;
  public template = require('./first-time-setup.html');
  public bindings = {
    clusterCreation: '<',
    ovaDownload: '<',
    onRadioUpdate: '&?',
    onOvaTypeUpdate: '&?',
  };
}
