import callFeaturesShared from './shared';
import huntGroup from './hunt-group';
import callPark from './call-park';
import pagingGroup from './paging-group';

export default angular
  .module('call.features', [
    callFeaturesShared,
    huntGroup,
    callPark,
    pagingGroup,
  ])
  .name;
