(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('GemspListCtrl', GemspListCtrl);

  /* @ngInject */
  function GemspListCtrl(gemService, Notification) {

    var vm = this;
    vm.loading = true;
    gemService.getSpData().then(function (res) {
      var resJson = _.get(res.content, 'data');
      if (resJson.returnCode) {
        // TODO: error message should be defined in frontend according to error code to support i18N
        Notification.error(resJson.message);
        return;
      }

      if (resJson.body.length) {
        vm.loading = false;
        vm.data = resJson.body;
      } else {
        Notification.error('gemini.msg.splsReponseErr');
      }
    });
  }
})();
