import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const BUTTON_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();
BUTTON_TOOLTIP_BINDINGS.ttDisabled = '<?';
BUTTON_TOOLTIP_BINDINGS.ttLoading = '<?';

interface IButtonTooltipController extends IBaseTooltipController {
  ttDisabled?: boolean;
  ttLoading?: boolean;
}

class ButtonTooltipController implements ng.IComponentController, IButtonTooltipController {
  public ttDisabled?: boolean;
  public ttLoading?: boolean;

  /* @ngInject */
  constructor() {
    _.assignInWith(this, TooltipUtil.mkBaseTooltipController(), TooltipUtil.assignBindings);
  }

  get disabled(): boolean {
    return _.isBoolean(this.ttDisabled) ? this.ttDisabled : false;
  }

  get loading(): boolean {
    return _.isBoolean(this.ttLoading) ? this.ttLoading : false;
  }
}

export class ButtonTooltipComponent implements ng.IComponentOptions {
  public template = require('./button-tooltip.html');
  public controller = ButtonTooltipController;
  public bindings = BUTTON_TOOLTIP_BINDINGS;
  public transclude = true;
}
