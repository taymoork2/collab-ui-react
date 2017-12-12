import { StringUtilService } from 'modules/core/shared';

class CrCheckboxItemController implements ng.IComponentController {
  public formItemId: string | undefined;
  private itemId: string;
  private onUpdate: Function;

  /* @ngInject */
  constructor(
    private StringUtilService: StringUtilService,
  ) {}

  public $onInit(): void {
    this.formItemId = this.StringUtilService.sanitizeIdForJs(this.itemId);
  }

  public recvChange(): void {
    this.onUpdate({
      $event: {
        itemId: this.itemId,
        item: _.pick(this, ['isSelected', 'isDisabled']),
      },
    });
  }
}

export class CrCheckboxItemComponent implements ng.IComponentOptions {
  public controller = CrCheckboxItemController;
  public template = require('./cr-checkbox-item.html');
  public transclude = true;
  public bindings = {
    itemId: '<',
    isSelected: '<',
    isDisabled: '<',
    l10nLabel: '@',
    onUpdate: '&',
  };
}
