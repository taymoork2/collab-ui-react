import './cr-users-tile-totals.scss';

class CrUsersTileTotalsController implements ng.IComponentController {

  public newTotal: number;
  public updatedTotal: number;
  public errorTotal: number;
  public newLabel?: string;
  public updatedLabel?: string;
  public errorLabel?: string;
  public hideNew?: boolean;

  private readonly NEW_LABEL = this.$translate.instant('userManage.bulk.newUsers');
  private readonly UPDATED_LABEL = this.$translate.instant('userManage.bulk.existingUsers');
  private readonly ERROR_LABEL = this.$translate.instant('userManage.bulk.errorUsers');

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public get newTileLabel() {
    return this.newLabel || this.NEW_LABEL;
  }

  public get updatedTileLabel() {
    return this.updatedLabel || this.UPDATED_LABEL;
  }

  public get errorTileLabel() {
    return this.errorLabel || this.ERROR_LABEL;
  }

}

export class CrUsersTileTotalsComponent implements ng.IComponentOptions {
  public controller = CrUsersTileTotalsController;
  public template = require('./cr-users-tile-totals.html');
  public bindings = {
    newTotal: '<',
    updatedTotal: '<',
    errorTotal: '<',
    newLabel: '<?',
    updatedLabel: '<?',
    errorLabel: '<?',
    hideNew: '<?',
  };
}
