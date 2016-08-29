(function () {
  'use strict';

  angular.module('uc.autoattendant')
    .controller('AAMediaUploadCtrl', AAMediaUploadCtrl);

  /* @ngInject */
  function AAMediaUploadCtrl($rootScope, $scope, $timeout, Upload, AANotificationService, AACommonService) {

    var vm = this;

    vm.uploadFile = '';
    vm.uploadDate = '';
    vm.uploadUrl = 'https://angular-file-upload-cors-srv.appspot.com/upload';

    vm.WAIT = "WAIT";
    vm.DOWNLOAD = "DOWNLOAD";
    vm.UPLOADED = "UPLOADED";

    vm.state = vm.WAIT;

    vm.upload = upload;

    var saveOn = 'uploadingInProgress';

    //////////////////////////////////////////////////////

    function upload(files) {
      if (files) {
        if (validateFile(files.name)) {
          AACommonService.setIsValid(saveOn, false);
          vm.state = vm.DOWNLOAD;
          vm.uploadFile = files.name;
          vm.uploadDate = moment().format("MM/DD/YYYY");
          vm.progress = 10;
          Upload.upload({
            url: vm.uploadUrl,
            data: files,
          }).then(uploadSuccess, uploadError, uploadProgress)
          .finally(cleanUp);
        }
      }
    }

    function validateFile(fileName) {
      if (_.endsWith(fileName, '.wav')) { //change to .wav
        return true;
      } else {
        AANotificationService.error('fileUpload.errorFileType');
      }
    }

    function cleanUp() {
      AACommonService.setIsValid(saveOn, true);
    }

    function uploadSuccess() {
      $timeout(function () {
        $rootScope.$broadcast('AAUploadSuccess', {
          uploadFname: vm.uploadFile,
          uploadUrl: vm.uploadUrl,
          uploadFdate: vm.uploadDate,
          uploadSchedule: $scope.schedule,
          uploadIndex: $scope.index,
        });
        vm.state = vm.UPLOADED;
      }, 3000);
    }

    function uploadError() {
      vm.state = vm.WAIT;
      vm.progress = 0;
      vm.uploadFile = '';
      vm.uploadDate = '';
      AANotificationService.error('autoAttendant.uploadFailed');
    }

    function uploadProgress(evt) {
      vm.progress = parseInt((100.0 * (evt.loaded / evt.total)), 10);
    }

    function getPreviousMedia() {
      if (!(_.isEmpty($scope.aaUploadedFname)) && !(_.isEmpty($scope.aaUploadedFdate))) {
        vm.state = vm.UPLOADED;
        vm.uploadFile = $scope.aaUploadedFname;
        vm.uploadDate = $scope.aaUploadedFdate;
      }
    }


    function activate() {
      getPreviousMedia();
    }

    activate();

  }

})();
