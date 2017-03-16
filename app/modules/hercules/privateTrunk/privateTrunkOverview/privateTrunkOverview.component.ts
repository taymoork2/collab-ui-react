interface ITranslationMessages {
  helpText: string;
}
export class PrivateTrunkOverviewCtrl implements ng.IComponentController {
  public title: string;
  public back: boolean = true;
  public backState = 'services-overview';
  // public hasPrivateTrunkToggle: boolean;
  public tabs = [{
    title: 'resources',
    state: 'private-trunk-setup',
  }, {
    title: 'Settings',
    state: 'test',
  }];
  public connectivityHelpMessages: ITranslationMessages[];
  public fullServiceHelpMessages: ITranslationMessages[];
  /* @ngInject */
  constructor(
  //  private $state,
   private $modal,
   private $translate: ng.translate.ITranslateService,
  ) {
  }

  public $onInit(): void {
    this.initModalHelpMessage();
    this.setupModal();
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

  public $onChange(): void {
  }

  public setupModal(): void {
    let vm = this;
    this.$modal.open({
      templateUrl: 'modules/hercules/privateTrunk/privateTrunkSetup/privateTrunkSetupModal.html',
      controller: function () {
        this.connectivityHelpMessages = vm.connectivityHelpMessages;
        this.fullServiceHelpMessages = vm.fullServiceHelpMessages;
      },
      controllerAs: 'setup',
      type: 'large',
    }).result
      .then(() => {
        vm.next();
      });
      // .then(() => {
      //   vm.$state.go('services-overview');
      // });
  }

  public next(): void {
    // return true;
  }
}

export class PrivateTrunkOverviewComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewCtrl;
  public templateUrl = 'modules/hercules/privateTrunk/privateTrunkOverview/privateTrunkOverview.html';
}
