class BsftSiteStateCtrl implements ng.IComponentController {
  public state;
  public onChangeFn: Function;
  public messages: any = {};
  public stateList = require('modules/huron/pstn/pstnAreaService/states.json');

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public onStateChanged(): void {
    this.onChangeFn({
      state: this.state,
    });
  }
}

export class BsftSiteStateComponent implements ng.IComponentOptions {
  public controller = BsftSiteStateCtrl;
  public template = require('modules/call/bsft/settings/settings-site-state/settings-site-state.component.html');
  public bindings = {
    state: '<',
    onChangeFn: '&',
  };
}
