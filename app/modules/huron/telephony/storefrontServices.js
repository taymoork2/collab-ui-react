'use strict';

angular.module('Huron')
  .factory('StorefrontEmailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getStorefrontUrl() + '/email/:recipient', {
      'recipient': '@recipient'
    }, {});
  })

;
