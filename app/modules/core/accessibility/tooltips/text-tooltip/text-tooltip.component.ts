import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const TEXT_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();

class TextTooltipController implements ng.IComponentController, IBaseTooltipController {

  /* @ngInject */
  constructor() {
    _.assignInWith(this, TooltipUtil.mkBaseTooltipController(), TooltipUtil.assignBindings);
  }
}

export class TextTooltipComponent implements ng.IComponentOptions {
  public template = require('./text-tooltip.html');
  public controller = TextTooltipController;
  public bindings = TEXT_TOOLTIP_BINDINGS;
  public transclude = true;
}
