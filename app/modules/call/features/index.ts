import callFeaturesShared from './shared';
import huntGroup from './hunt-group';
import callPark from './call-park';
import pagingGroup from './paging-group';
import callPickup from './call-pickup';

export default angular
  .module('call.features', [
    callFeaturesShared,
    huntGroup,
    callPark,
    pagingGroup,
    callPickup,
  ])
  .name;
