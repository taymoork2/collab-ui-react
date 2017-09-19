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
      template: require('modules/huron/features/autoAttendant/mediaUpload/aaMedia.tpl.html'),
      scope: {
        schedule: '@aaSchedule',
        menuId: '@aaMenuId',
        index: '=aaIndex',
        aaFileSize: '@aaMediaUploadSize',
        isMenuHeader: '@aaMenuHeader',
        menuKeyIndex: '@aaKeyIndex',
        fromSubMenu: '@aaFromSubMenu',
        type: '@aaMediaType',
        change: '&aaChange',
        mediaState: '=aaMediaState',
      },
    };
  }
})();
