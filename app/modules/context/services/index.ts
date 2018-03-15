import { FieldUtils } from './fieldUtils';
import { PropertyService } from './context-property-service';
import { ContextAdminAuthorizationService } from './context-authorization-service';

export default angular
  .module('context.services', [])
  .service('FieldUtils', FieldUtils)
  .service('PropertyService', PropertyService)
  .service('ContextAdminAuthorizationService', ContextAdminAuthorizationService);
