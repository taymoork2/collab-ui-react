import { StringUtilService } from 'modules/core/shared';

export interface ICrCheckboxItemState {
  isSelected: boolean;
  isDisabled: boolean;
}

class CrCheckboxItemController implements ng.IComponentController {
  public formItemId: string | undefined;
  public itemId: string;
  public onUpdate: Function;
  public useStrictItemId: boolean;

  /* @ngInject */
  constructor(
    private StringUtilService: StringUtilService,
  ) {}

  public $onInit(): void {
    let itemId = this.itemId;
    if (!this.useStrictItemId) {
      itemId = `${itemId}__${Date.now()}`;
    }
    this.formItemId = this.StringUtilService.sanitizeIdForJs(itemId);
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
    useStrictItemId: '<?',
  };
}
