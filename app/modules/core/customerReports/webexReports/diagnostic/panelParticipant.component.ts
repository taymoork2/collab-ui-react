import './_search.scss';

class PanelParticipant implements ng.IComponentController {

  /* @ngInject */
  public constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {

  }

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
  }
}

export class PanelParticipantComponent implements ng.IComponentOptions {
  public controller = PanelParticipant;
  public template = require('modules/core/customerReports/webexReports/diagnostic/panelParticipant.html');
}
