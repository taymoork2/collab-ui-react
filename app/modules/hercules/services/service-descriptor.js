'use strict';

angular.module('Hercules')
  .service('ServiceDescriptor', [
    function ServiceDescriptor() {

      var mockServicesData = function () {
        return [{
          name: 'Fusion Management',
          icon: 'fa fa-tachometer',
          type: 'c_mgmt'
        }, {
          name: 'UCM Service',
          icon: 'fa fa-phone',
          type: 'c_ucmc',
          descs: [
            'Zero touch meetings, move calls between desk phones and soft clients, and reuse your enterprise phone number.'
          ]
        }, {
          name: 'Calendar Service',
          icon: 'fa fa-calendar',
          type: 'c_cal',
          descs: [
            'Calendar sync for consistent meeting times and In-app scheduling connected to Exchange.'
          ]
        }];
      };

      var services = function (cb) {
        cb(mockServicesData());
      };

      return {
        services: services
      };

    }
  ]);
