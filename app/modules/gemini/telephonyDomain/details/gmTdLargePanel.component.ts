class GmTdLargePanelCtrl implements ng.IComponentController {

  public data: Object;
  public fullpanelTitle: string;

  /* @ngInject */
  public constructor(
    private gemService,
    private PreviousState,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {

  }

  public $onInit() {
    this.getCurrentTelepony();
    this.fullpanelTitle = this.gemService.getStorage('fullpanelTitle');
    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.overview');
  }

  public onCancel() {
    this.PreviousState.go();
  }

  private getCurrentTelepony() {
    this.data = this.gemService.getStorage('currentTelephonyDomain');

  }
}

export class GmTdLargePanelComponent implements ng.IComponentOptions {
  public controller = GmTdLargePanelCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdLargePanel.html';
}
