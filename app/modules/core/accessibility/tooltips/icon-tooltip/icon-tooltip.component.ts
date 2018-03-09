import { BaseTooltipCtrl, BASE_TOOLTIP_BINDINGS } from '../base-tooltip.controller';

const ICON_TOOLTIP_BINDINGS = _.cloneDeep(BASE_TOOLTIP_BINDINGS);

class IconTooltipCtrl extends BaseTooltipCtrl {
  /* @ngInject */
  constructor() {
    super();

    // defaults the icon trigger to (i)
    this.defaultClass = 'icon-information';
  }
}

export class IconTooltipComponent implements ng.IComponentOptions {
  public template = require('./icon-tooltip.tpl.html');
  public controller = IconTooltipCtrl;
  public bindings = ICON_TOOLTIP_BINDINGS;
}
