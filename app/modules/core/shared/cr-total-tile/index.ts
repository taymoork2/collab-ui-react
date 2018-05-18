import './cr-total-tile.scss';
import './cr-total-tile-container.scss';

import { CrTotalTileComponent } from './cr-total-tile.component';
import { CrTotalTileContainerDirectiveFactory } from './cr-total-tile-container.directive';
import * as ngTranslateModuleName from 'angular-translate';

export default angular.module('core.shared.cr-total-tile', [
  ngTranslateModuleName,
])
  .component('crTotalTile', new CrTotalTileComponent())
  .directive('crTotalTileContainer', CrTotalTileContainerDirectiveFactory)
  .name;
