(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    UrlConfig
  ) {
    var vm = this;

    //TODO: link to Qlik https://ds2-qlikdemo.cisco.com/single/?appid=04385ccd-6286-416e-b34f-48a34370935e&sheet=hKpxwJe&select=clearall
    vm.metricsUrl = UrlConfig.getWebexMetricsUrl();
  }
})();
