import { IOption } from 'modules/huron/dialing/dialing.service';

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
  public templateUrl = 'modules/call/settings/settings-company-moh/settings-company-moh.component.html';
  public bindings = {
    companyMoh: '<',
    companyMohOptions: '<',
    onChangeFn: '&',
  };
}
