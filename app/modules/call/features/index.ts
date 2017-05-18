import callFeaturesShared from './shared';
import huntGroup from './hunt-group';
import callPark from './call-park';

export default angular
  .module('call.features', [
    callFeaturesShared,
    huntGroup,
    callPark,
  ])
  .name;
