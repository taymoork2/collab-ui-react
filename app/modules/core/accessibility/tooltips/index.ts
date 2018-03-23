import { IconTooltipComponent } from './icon-tooltip/icon-tooltip.component';
import { TextTooltipComponent } from './text-tooltip/text-tooltip.component';

import './base-tooltip.scss';

export { TooltipUtil, IBaseTooltipController } from './tooltip.util';

export default angular
  .module('core.accessibility.tooltip', [
    require('@collabui/collab-ui-ng').default,
  ])
  .component('iconTooltip', new IconTooltipComponent())
  .component('textTooltip', new TextTooltipComponent())
  .name;
