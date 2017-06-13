import { LocationComponent } from './location.component';
import { LocationService } from './location.service';
let callLocation = 'call.locations';
export default angular.module('call.location', [
  callLocation,
])
  .component('callLocation', new LocationComponent())
  .service('LocationService', LocationService)
  .name;
