import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const TEXT_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();

class TextTooltipController implements ng.IComponentController, IBaseTooltipController {
  /* @ngInject */
  constructor() {
    _.assignIn(this, TooltipUtil.mkBaseTooltipController());
  }
}

export class TextTooltipComponent implements ng.IComponentOptions {
  public template = require('./text-tooltip.tpl.html');
  public controller = TextTooltipController;
  public bindings = TEXT_TOOLTIP_BINDINGS;
  public transclude = true;
}
