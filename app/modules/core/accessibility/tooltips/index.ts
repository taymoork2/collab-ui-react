import { ButtonTooltipComponent } from './button-tooltip/button-tooltip.component';
import { IconTooltipComponent } from './icon-tooltip/icon-tooltip.component';
import { LinkTooltipComponent } from './link-tooltip/link-tooltip.component';
import { ProPackTooltipComponent } from './pro-pack-tooltip/pro-pack-tooltip.component';
import { TextTooltipComponent } from './text-tooltip/text-tooltip.component';

import './base-tooltip.scss';

export { TooltipUtil, IBaseTooltipController } from './tooltip.util';

export default angular
  .module('core.accessibility.tooltips', [
    require('@collabui/collab-ui-ng').default,
  ])
  .component('buttonTooltip', new ButtonTooltipComponent())
  .component('iconTooltip', new IconTooltipComponent())
  .component('linkTooltip', new LinkTooltipComponent())
  .component('proPackTooltip', new ProPackTooltipComponent())
  .component('textTooltip', new TextTooltipComponent())
  .name;
