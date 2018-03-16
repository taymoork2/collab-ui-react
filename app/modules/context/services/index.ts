import { FieldUtils } from './fieldUtils';
import { PropertyService } from './context-property-service';
import { ContextAdminAuthorizationService } from './context-authorization-service';
import * as contextFieldsService from 'modules/context/services/context-fields-service';
import * as contextFieldsetsService from 'modules/context/services/context-fieldset-service';
import * as contextDiscoveryService from 'modules/context/services/context-discovery';

export default angular
  .module('context.services', [])
  .service('ContextAdminAuthorizationService', ContextAdminAuthorizationService)
  .service('ContextDiscovery', contextDiscoveryService)
  .service('ContextFieldsService', contextFieldsService)
  .service('ContextFieldsetsService', contextFieldsetsService)
  .service('FieldUtils', FieldUtils)
  .service('PropertyService', PropertyService)
  .name;
