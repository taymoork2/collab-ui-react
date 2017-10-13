import { IOption } from 'modules/huron/dialing';

class CompanyMediaOnHoldCtrl implements ng.IComponentController {
  public companyMoh: string;
  public selected: IOption;
  public companyMohOptions: IOption[];
  public mediaMgrModal;
  public onChangeFn: Function;

  /* @ngInject */
  constructor(
    private $modal,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { companyMoh } = changes;
    if (companyMoh && companyMoh.currentValue === this.companyMoh) {
      this.selected = _.find(this.companyMohOptions, { value: this.companyMoh });
    }
  }

  public openMediaMgrModal(): void {
    this.mediaMgrModal = this.$modal.open({
      scope: this.$scope,
      component: 'MediaMgrComponent',
      template: '<media-mgr close="$close()" dismiss="$dismiss()"></media-mgr>',
      type: 'full',
    }).result.finally(() => {
      this.$state.reload();
    });
  }

  public onCompanyMohChanged(): void {
    this.onChangeFn({
      companyMoh: _.get(this.selected, 'value'),
    });
  }
}

export class CompanyMediaOnHoldComponent implements ng.IComponentOptions {
  public controller = CompanyMediaOnHoldCtrl;
  public template = require('modules/call/settings/settings-company-moh/settings-company-moh.component.html');
  public bindings = {
    companyMoh: '<',
    companyMohOptions: '<',
    onChangeFn: '&',
  };
}
