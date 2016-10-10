(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaMediaUpload', aaMediaUpload);

  function aaMediaUpload() {
    return {
      restrict: 'AE',
      controller: 'AAMediaUploadCtrl',
      controllerAs: 'aaMediaUpload',
      templateUrl: 'modules/huron/features/autoAttendant/mediaUpload/aaMedia.tpl.html',
      require: '^ngModel',
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        keyIndex: '@aaKeyIndex',
        type: '@aaMediaType',
        ngModel: "=",
        ngChange: "&",
      },
    };
  }
})();
