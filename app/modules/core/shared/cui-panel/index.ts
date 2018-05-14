require('./cui-panel.scss');
import { CuiPanelDirectiveFactory } from './cui-panel.directive';

export default angular.module('core.shared.cui-panel', [])
  .directive('cuiPanel', CuiPanelDirectiveFactory)
  .name;
