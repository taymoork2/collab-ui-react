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
    vm.fileLengthLowerLimit = 12;
    vm.fileLengthUpperLimit = 15;
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
    vm.isSquishable = isSquishable;

    var maxLanes = 3;

    var mediaTypes = {
      musicOnHold: 'musicOnHold',
      initialAnnouncement: 'initialAnnouncement',
      periodicAnnouncement: 'periodicAnnouncement',
    };

    var properties = {
      NAME: ['play', 'say', 'runActionsOnInput', 'routeToQueue'],
      HEADER_TYPE: 'MENU_OPTION_ANNOUNCEMENT'
    };

    var messageType = {
      ACTION: 1,
      MENUHEADER: 2,
      MENUKEY: 3,
      SUBMENU_HEADER: 4,
      ROUTE_TO_QUEUE: 5,
    };

    var sourceType = messageType.ACTION;
    var uniqueCtrlIdentifer = 'mediaUploadCtrl';
    var modalOpen = false;
    var modalCanceled = false;
    var uploadServProm = undefined;
    var menuKeyIndex;
    var isMenuHeader;
    var numLanes;

    //////////////////////////////////////////////////////

    function upload(file) {
      if (!_.isUndefined(file) && file) {
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
        if (!_.isUndefined(uploadServProm)) {
          uploadServProm.then(uploadSuccess, uploadError, uploadProgress).finally(cleanUp);
        } else {
          uploadError();
        }
      }, function () {
        uploadError();
      });
    }

    function uploadSuccess(result) {
      if (!modalCanceled) {
        var get = AAMediaUploadService.retrieve(result);
        if (get) {
          setUploadValues(get);
        } else {
          uploadError();
        }
      }
    }

    function setUploadValues(value) {
      vm.state = vm.UPLOADED;
      var fd = {};
      fd.uploadFile = vm.uploadFile;
      fd.uploadDate = vm.uploadDate;
      fd.uploadDuration = vm.uploadDuration;
      vm.actionEntry.setValue(value);
      vm.actionEntry.setDescription(JSON.stringify(fd));
      setActionCopy();
      $scope.change();
    }

    function uploadError() {
      rollBack();
      if (!modalCanceled) {
        AANotificationService.error('autoAttendant.uploadFailed');
      }
    }

    function uploadProgress(evt) {
      //dont divide by zero for progress calculation
      if (!_.isUndefined(evt) && !_.isEqual(evt.total, 0)) {
        vm.progress = parseInt((100.0 * ((evt.loaded - 1) / evt.total)), 10);
      } else {
        vm.progress = 0;
      }
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
      if (!_.isUndefined(uploadServProm)) {
        uploadServProm.abort();
        uploadServProm = undefined;
      }
      if (angular.isDefined(vm.actionCopy)) {
        revert(vm.actionEntry);
      } else {
        reset(vm.actionEntry);
      }
    }

    function revert(playAction) {
      try {
        var desc = JSON.parse(vm.actionCopy.description);
        vm.uploadFile = desc.uploadFile;
        vm.uploadDate = desc.uploadDate;
        vm.uploadDuration = desc.uploadDuration;
        if (!_.isUndefined(playAction)) {
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
      if (!_.isUndefined(playAction)) {
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
        var action = vm.actionEntry;
        if (angular.isDefined(action)) {
          if (!_.isEmpty(action.getValue())) {
            vm.actionCopy = {};
            vm.actionCopy.description = action.getDescription();
            vm.actionCopy.value = action.getValue();
            vm.actionCopy.voice = action.getVoice();
          }
        }
      }
    }

    function getAction(menuEntry) {
      var action;
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        action = _.find(menuEntry.actions, function (action) {
          return _.indexOf(properties.NAME, action.name) >= 0;
        });
        return action;
      }
    }

    function getActionHeader(menuEntry) {
      if (menuEntry && menuEntry.headers && menuEntry.headers.length > 0) {
        var header = _.find(menuEntry.headers, function (header) {
          return header.type === properties.HEADER_TYPE;
        });
        return header;
      }
    }

    function fromMenuHeader() {
      vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
      var actionHeader = getActionHeader(vm.menuEntry);
      var action = getAction(actionHeader);
      if (action) {
        // existing say action from the existing header
        vm.actionEntry = action;
      }
    }

    function fromMenuKey() {
      vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
      if (vm.menuEntry.entries.length > $scope.menuKeyIndex && vm.menuEntry.entries[$scope.menuKeyIndex]) {
        var keyAction = getAction(vm.menuEntry.entries[$scope.menuKeyIndex]);
        if (keyAction) {
          vm.actionEntry = keyAction;
        }
      }
    }

    function fromRouteToQueue() {
      var sourceMenu, sourceQueue, queueAction;
      if ($scope.menuId) {
        sourceMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        sourceQueue = sourceMenu.entries[$scope.menuKeyIndex];
        queueAction = sourceQueue.actions[0];
        vm.menuEntry = queueAction.queueSettings[$scope.type];
        vm.actionEntry = getAction(vm.menuEntry);
      } else {
        var ui = AAUiModelService.getUiModel();
        var uiMenu = ui[$scope.schedule];
        vm.menuEntry = uiMenu.entries[$scope.index];
        queueAction = vm.menuEntry.actions[0];
        sourceMenu = queueAction.queueSettings[$scope.type];
        vm.actionEntry = getAction(sourceMenu);
      }
    }

    function fromAction() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      vm.actionEntry = getAction(vm.menuEntry);

    }

    function setActionEntry() {
      switch (sourceType) {
        case messageType.MENUHEADER:
        case messageType.SUBMENU_HEADER:
          {
            fromMenuHeader();
            break;
          }
        case messageType.MENUKEY:
          {
            fromMenuKey();
            break;
          }
        case messageType.ROUTE_TO_QUEUE:
          {
            fromRouteToQueue();
            break;
          }
        case messageType.ACTION:
          {
            fromAction();
            break;
          }
      }
      return;
    }

    function gatherMediaSource() {
      if ($scope.type && _.includes(mediaTypes, $scope.type)) { //case of route to queue types
        //type will be used to differentiate between the different media uploads on the queue modal
        //get the entry mapped to a particular route to queue and
        //mapped to a particular queue setting
        sourceType = messageType.ROUTE_TO_QUEUE;
      } else if ($scope.isMenuHeader) { //case of coming from menu header
        //get the menu entry mapped to the top level menu header
        sourceType = messageType.MENUHEADER;
      } else if ($scope.menuId && (!$scope.menuKeyIndex || $scope.menuKeyIndex <= -1)) {
        //get the menu entry mapped to the submenu header location
        sourceType = messageType.SUBMENU_HEADER;
      } else if ($scope.menuKeyIndex && $scope.menuKeyIndex > -1) {
        //case of coming from phone key set in a type of phone menu
        //get the entry mapped to menu key type
        sourceType = messageType.MENUKEY;
      } else {
        //case of no key input message types
        //get the entry mapped to a plain message type
        sourceType = messageType.ACTION;
      }
      setActionEntry();
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
      //set up the view according to the play
      setUpEntry(vm.actionEntry);
    }

    $scope.$on('$destroy', function () {
      if (!_.isUndefined(uploadServProm)) {
        modalCanceled = true;
        uploadServProm.abort();
      }
    });

    function isSquishable() {
      // if it is submenu header in the phone menu slightly squish the html to fit when open/closed and holidays are exposed.

      var toSquish = (numLanes == maxLanes) && ((menuKeyIndex !== '') || (_.isEmpty(menuKeyIndex) && (isMenuHeader === 'false')));
      return toSquish;
    }

    function countLanes(ui) {
      var n = 1; // always one lane, open hours

      if (ui.isClosedHours) {
        n++;
      }
      if (ui.isHolidays) {
        if (ui.holidaysValue !== 'closedHours') {
          n++;
        }
      }
      return n;

    }

    function determineSquishability() {
      var ui = AAUiModelService.getUiModel();

      numLanes = countLanes(ui);

      menuKeyIndex = $scope.menuKeyIndex;
      isMenuHeader = $scope.isMenuHeader;
    }

    function activate() {
      determineSquishability();
      populateUiModel();
      setActionCopy();
    }

    activate();

  }

})();
