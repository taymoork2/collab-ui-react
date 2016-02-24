(function () {
  'use strict';

  angular
    .module('Core')
    .factory('TrackingIDInterceptor', TrackingIDInterceptor);

  /* @ngInject */
  function TrackingIDInterceptor() {
    var TRACKINGID = 'TrackingID';
    var ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
    var blackList = [
      'statuspage.io'
    ];
    var whiteList = [
      'huron-dev.com',
      'huron-int.com',
      'wbx2.com'
    ];

    function findListItemInUrl(list, url) {
      var index = _.findIndex(list, function (site) {
        return url.indexOf(site) !== -1;
      });
      return index !== -1;
    }

    return {
      'request': function (config) {
        var url = config.url;
        if (findListItemInUrl(blackList, url)) {
          config.headers.TrackingID = undefined;
        }
        if (findListItemInUrl(whiteList, url)) {
          var exposeHeaders = config.headers[ACCESS_CONTROL_EXPOSE_HEADERS];
          if (_.isUndefined(exposeHeaders)) {
            exposeHeaders = TRACKINGID;
          } else if (exposeHeaders.indexOf(TRACKINGID) === -1) {
            exposeHeaders += ',' + TRACKINGID;
          }
          config.headers[ACCESS_CONTROL_EXPOSE_HEADERS] = exposeHeaders;
        }
        return config;
      }
    };
  }
})();
