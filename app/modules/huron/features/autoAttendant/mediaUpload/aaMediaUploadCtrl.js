(function () {
  'use strict';

  angular.module('uc.autoattendant')
  .controller('AAMediaUploadCtrl', AAMediaUploadCtrl);

  /* @ngInject */
  function AAMediaUploadCtrl($scope, $translate, Upload, ModalService, AANotificationService, AACommonService, AAMediaUploadService, AAUiModelService, AutoAttendantCeMenuModelService) {
    var vm = this;

    vm.uploadFile = '';
    vm.uploadDate = '';
    vm.uploadDuration = '';
    vm.WAIT = "WAIT";
    vm.DOWNLOAD = "DOWNLOAD";
    vm.UPLOADED = "UPLOADED";
    vm.state = vm.WAIT;
    vm.menuEntry = {};
    vm.dialogModalTypes = {
      cancel: 'cancel',
      overwrite: 'overwrite',
    };

    vm.upload = upload;
    vm.openModal = openModal;
    vm.progress = 0;
    vm.actionCopy = undefined;

    var myActions = ["play", "runActionsOnInput"];
    var mediaTypes = {
      musicOnHold: 'musicOnHold',
      initialAnnouncement: 'initialAnnouncement',
      periodicAnnouncement: 'periodicAnnouncement',
    };
    var uniqueCtrlIdentifer = 'mediaUploadCtrl';
    var modalOpen = false;
    var modalCanceled = false;
    var uploadServProm = undefined;

    //////////////////////////////////////////////////////

    function upload(file) {
      if (angular.isDefined(file)) {
        if (AAMediaUploadService.validateFile(file.name)) {
          if (isOverwrite()) {
            confirmOverwrite(file);
          } else {
            continueUpload(file);
          }
        } else {
          AANotificationService.error('fileUpload.errorFileType');
        }
      }
    }

    function isOverwrite() {
      return _.isEqual(vm.state, vm.UPLOADED);
    }

    function confirmOverwrite(file) {
      var modalInstance = dialogModal(vm.dialogModalTypes.overwrite, vm.dialogModalTypes);
      modalInstance.result.then(function () {
        continueUpload(file);
      }).finally(modalClosed);
    }

    //upload set up ui model and state info
    function continueUpload(file) {
      Upload.mediaDuration(file).then(function (durationInSeconds) {
        uniqueCtrlIdentifer += AACommonService.getUniqueId();
        AACommonService.setIsValid(uniqueCtrlIdentifer, false);
        vm.uploadFile = file.name;
        vm.uploadDate = moment().format("MM/DD/YYYY");
        vm.uploadDuration = '(' + moment.utc(durationInSeconds * 1000).format('mm:ss') + ')';
        vm.state = vm.DOWNLOAD;
        vm.progress = 0;
        modalCanceled = false;
        uploadServProm = AAMediaUploadService.upload(file);
        uploadServProm.then(uploadSuccess, uploadError, uploadProgress).finally(cleanUp);
      }, function () {
        uploadError();
      });
    }

    function uploadSuccess(result) {
      if (!modalCanceled) {
        vm.state = vm.UPLOADED;
        var action = getPlayAction(vm.menuEntry);
        var fd = {};
        fd.uploadFile = vm.uploadFile;
        fd.uploadDate = vm.uploadDate;
        fd.uploadDuration = vm.uploadDuration;
        action.setDescription(JSON.stringify(fd));
        action.setValue('http://' + result.data.PlaybackUri);
        setActionCopy();
        $scope.ngModel = action.description;
        $scope.ngChange();
      }
    }

    function uploadError() {
      rollBack();
      if (!modalCanceled) {
        AANotificationService.error('autoAttendant.uploadFailed');
      }
    }

    function uploadProgress(evt) {
      vm.progress = parseInt((100.0 * ((evt.loaded - 1) / evt.total)), 10);
    }

    //global media upload for save
    function cleanUp() {
      uploadServProm = undefined;
      AACommonService.setIsValid(uniqueCtrlIdentifer, true);
      AACommonService.setMediaUploadStatus(true);
    }

    function openModal(uploadModal) {
      var modalInstance = dialogModal(uploadModal, vm.dialogModalTypes);
      modalInstance.result.then(function () {
        modalAction();
      }).finally(modalClosed);
    }

    function dialogModal(type, types) {
      var modalInstance = undefined;
      switch (type) {
        case types.cancel:
          modalInstance = ModalService.open({
            title: $translate.instant('common.cancel'),
            message: $translate.instant('autoAttendant.cancelUpload'),
            close: $translate.instant('common.cancel'),
            dismiss: $translate.instant('common.no'),
            type: 'negative'
          });
          break;
        case types.overwrite:
          modalInstance = ModalService.open({
            title: $translate.instant('autoAttendant.overwrite'),
            message: $translate.instant('autoAttendant.overwriteUpload'),
            close: $translate.instant('common.yes'),
            dismiss: $translate.instant('common.no'),
            type: 'primary'
          });
          break;
      }
      modalOpen = true;
      return modalInstance;
    }

    //the dialog modal user selected action option
    //else the dismiss is called and no action taken
    function modalAction() {
      rollBack();
      modalCanceled = true;
    }

    function modalClosed() {
      modalOpen = false;
    }

    //roll back, revert if history exists, else hard reset
    function rollBack() {
      if (angular.isDefined(uploadServProm)) {
        uploadServProm.abort();
        uploadServProm = undefined;
      }
      var playAction = getPlayAction(vm.menuEntry);
      if (angular.isDefined(vm.actionCopy)) {
        revert(playAction);
      } else {
        reset(playAction);
      }
    }

    function revert(playAction) {
      try {
        var desc = JSON.parse(vm.actionCopy.description);
        vm.uploadFile = desc.uploadFile;
        vm.uploadDate = desc.uploadDate;
        vm.uploadDuration = desc.uploadDuration;
        if (angular.isDefined(playAction)) {
          playAction.setDescription(vm.actionCopy.description);
          playAction.setValue(vm.actionCopy.value);
        }
        vm.state = vm.UPLOADED;
        vm.progress = 0;
      } catch (exception) {
        reset(playAction);
      }
    }

    function reset(playAction) {
      vm.uploadFile = '';
      vm.uploadDate = '';
      vm.uploadDuration = '';
      if (angular.isDefined(playAction)) {
        playAction.setDescription('');
        playAction.setValue('');
      }
      vm.state = vm.WAIT;
      vm.progress = 0;
      vm.actionCopy = undefined;
    }

    //if user cancels upload & previously uploaded media -> re-init/revert copy
    function setActionCopy() {
      if (!modalOpen) {
        var playAction = getPlayAction(vm.menuEntry);
        if (angular.isDefined(playAction)) {
          if (!_.isEmpty(playAction.getValue())) {
            vm.actionCopy = {};
            vm.actionCopy.description = playAction.getDescription();
            vm.actionCopy.value = playAction.getValue();
            vm.actionCopy.voice = playAction.getVoice();
          }
        }
      }
    }

    function createPlayAction() {
      return AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
    }


    function getPlayAction(menuEntry) {
      var playAction;
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        playAction = _.find(menuEntry.actions, function (action) {
          return _.indexOf(myActions, action.getName()) >= 0;
        });
        return playAction;
      }
    }

    function gatherMediaSource() {
      if ($scope.type && _.includes(mediaTypes, $scope.type)) { //case of route to queue types
        //type will be used to differentiate between the different media uploads on the queue modal
        //get the entry mapped to a particular route to queue and
        //mapped to a particular queue setting
        var sourceMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        var sourceQueue = sourceMenu.entries[$scope.keyIndex];
        var queueAction = sourceQueue.actions[0];
        vm.menuEntry = queueAction.queueSettings[$scope.type];
      } else { //case of no key input message types
        //get the entry mapped to a plain message type
        var ui = AAUiModelService.getUiModel();
        var uiMenu = ui[$scope.schedule];
        vm.menuEntry = uiMenu.entries[$scope.index];
      }
    }

    function setUpEntry(action) {
      if (_.startsWith(action.getValue().toLowerCase(), 'http')) {
        try {
          // description holds the file name plus the date plus the duration
          //dont set up the vm until the desc is parsed properly
          var desc = JSON.parse(action.getDescription());
          vm.uploadFile = desc.uploadFile;
          vm.uploadDate = desc.uploadDate;
          vm.uploadDuration = desc.uploadDuration;
          vm.state = vm.UPLOADED;
          vm.progress = 0;
        } catch (exception) {
          //if somehow a bad format came through
          //catch and keep disallowed
          action.setValue('');
          action.setDescription('');
        }
      }
    }

    function populateUiModel() {
      gatherMediaSource();
      var action = getPlayAction(vm.menuEntry);
      if (angular.isDefined(action)) {
        setUpEntry(action);
      } else {
        // should not happen, created earlier but ..
        vm.menuEntry.addAction(createPlayAction());
      }
    }

    function activate() {
      populateUiModel();
      setActionCopy();
    }

    $scope.$on('$destroy', function () {
      if (angular.isDefined(uploadServProm)) {
        modalCanceled = true;
        uploadServProm.abort();
      }
    });

    activate();

  }

})();
