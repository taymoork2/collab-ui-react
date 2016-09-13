(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaMediaUpload', aaMediaUpload);

  function aaMediaUpload() {
    return {
      restrict: 'AE',
      scope: {
        aaUploadedFname: '@',
        aaUploadedFdate: '@',
        schedule: '@aaSchedule',
        index: '=aaIndex',
      },
      controller: 'AAMediaUploadCtrl',
      controllerAs: 'aaMediaUpload',
      templateUrl: 'modules/huron/features/autoAttendant/mediaUpload/aaMedia.tpl.html'
    };
  }
})();
