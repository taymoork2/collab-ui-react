const TypeSelectorController = require('modules/hercules/fusion-pages/add-resource/common/type-selector.controller.js');
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';

export default angular
  .module('hercules.fusion-pages.add-resource.common', [
    authInfoModuleName,
    serviceDescriptorServiceModuleName,
  ])
  .controller('TypeSelectorController', TypeSelectorController)
  .name;
