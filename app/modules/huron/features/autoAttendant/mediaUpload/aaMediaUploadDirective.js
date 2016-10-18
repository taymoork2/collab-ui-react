(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaMediaUpload', aaMediaUpload);

  function aaMediaUpload() {
    return {
      restrict: 'AE',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
      },
      controller: 'AAMediaUploadCtrl',
      controllerAs: 'aaMediaUpload',
      templateUrl: 'modules/huron/features/autoAttendant/mediaUpload/aaMedia.tpl.html'
    };
  }
})();
