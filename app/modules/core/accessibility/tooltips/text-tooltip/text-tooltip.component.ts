import { BaseTooltipCtrl, BASE_TOOLTIP_BINDINGS } from '../base-tooltip.controller';

const TEXT_TOOLTIP_BINDINGS = _.cloneDeep(BASE_TOOLTIP_BINDINGS);

class TextTooltipCtrl extends BaseTooltipCtrl {
  /* @ngInject */
  constructor() {
    super();
  }
}

export class TextTooltipComponent implements ng.IComponentOptions {
  public template = require('./text-tooltip.tpl.html');
  public controller = TextTooltipCtrl;
  public bindings = TEXT_TOOLTIP_BINDINGS;
  public transclude = true;
}
