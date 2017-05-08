import callFeaturesShared from './shared';
import huntGroup from './hunt-group';

export default angular
  .module('call.features', [
    callFeaturesShared,
    huntGroup,
  ])
  .name;
