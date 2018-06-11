'use strict';

describe('Controller: AAMediaUploadCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $httpBackend;
  var $q;
  var Upload;
  var ModalService;
  var AANotificationService;
  var AAUiModelService;
  var AACommonService;
  var AutoAttendantCeMenuModelService;
  var AAMediaUploadService;
  var Analytics;
  var Authinfo;
  var AAMetricNameService;
  var modal;
  var deferred;

  var ui = {
    openHours: {},
  };
  var uiMenu = {};
  var menuEntry = {};
  var playAction = {};
  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu0';
  var keyIndex = '0';

  var fileNameInvalid = 'ILTQq4.jpg';
  var fileNameValid = 'ILTQq4.wav';
  var fileNameValid2 = 'ILTQq5.wav';
  var fileSize = 41236;
  var fileSize2 = 43451;
  var fileSizeMax = 5 * 1024 * 1024;
  var fileSizeInvalid = (5 * 1024 * 1024) + 1;
  var fileModified = 1470671405088;
  var fileModified2 = 1470671405088;
  var fileDate = '09/01/16';
  var fileDate2 = '09/01/16';

  var validFile = {
    lastModified: fileModified,
    name: fileNameValid,
    size: fileSize,
  };
  var validFile2 = {
    lastModified: fileModified2,
    name: fileNameValid2,
    size: fileSize2,
  };
  var invalidFileByName = {
    lastModified: fileModified,
    name: fileNameInvalid,
    size: fileSize,
  };
  var invalidFileBySize = {
    lastModified: fileModified,
    name: fileNameValid,
    size: fileSizeInvalid,
  };
  var variantUrlPlayback = 'recordingPlayBackUrl';
  var uploadUrl = 'https://clio-manager-intb.ciscospark.com/clio-manager/api/v1/recordings/media';
  var voice = 'Vanessa';
  var fileDuration = '(00:39)';
  var fileDescription = {
    uploadFile: fileNameValid,
    uploadDate: fileDate,
    uploadUrl: uploadUrl,
    uploadDuration: fileDuration,
  };
  var fileDescription2 = {
    uploadFile: fileNameValid2,
    uploadDate: fileDate2,
    uploadUrl: uploadUrl,
    uploadDuration: fileDuration,
  };
  var menuOption = 'MENU_OPTION';
  var menuOptionAnnouncement = 'MENU_OPTION_ANNOUNCEMENT';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _$q_, _Upload_, _ModalService_, _AANotificationService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AAMediaUploadService_, _AACommonService_, _Analytics_, _Authinfo_, _AAMetricNameService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Upload = _Upload_;
    ModalService = _ModalService_;
    AANotificationService = _AANotificationService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AAMediaUploadService = _AAMediaUploadService_;
    AACommonService = _AACommonService_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    AAMetricNameService = _AAMetricNameService_;
    modal = $q.defer();
    deferred = $q.defer();
    $scope.change = function () {
      return true;
    };
    $scope.mediaState = {};
    $scope.mediaState.uploadInProgress = false;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    spyOn(ModalService, 'open').and.returnValue({
      result: modal.promise,
    });
    spyOn(Upload, 'mediaDuration').and.returnValue(deferred.promise);
    spyOn(Analytics, 'trackEvent').and.returnValue($q.resolve[{
      sizeInMB: 1,
      durationInSeconds: 1,
      uuid: jasmine.any(String),
      orgid: jasmine.any(String),
    }]);
    spyOn(Authinfo, 'getOrgId').and.returnValue('orgid');
    spyOn(Authinfo, 'getUserId').and.returnValue('uuid');

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaFileSize = fileSizeMax;

    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);
    playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
    menuEntry.actions[0] = playAction;
    controller = $controller('AAMediaUploadCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  afterEach(function () {
    controller = null;
    $rootScope = null;
    $scope = null;
    $httpBackend = null;
    $q = null;
    Upload = null;
    ModalService = null;
    AANotificationService = null;
    AutoAttendantCeMenuModelService = null;
    AAUiModelService = null;
    AAMediaUploadService = null;
    AACommonService = null;
    Analytics = null;
    AAMetricNameService = null;
    Authinfo = null;
  });

  describe('activate', function () {
    describe('routeToQueue activate functionality', function () {
      beforeEach(inject(function ($controller) {
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
        ui[schedule] = uiMenu;
        menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        uiMenu.addEntryAt(index, menuEntry);
        $scope.menuId = menuId;
        $scope.menuKeyIndex = keyIndex;
        $scope.type = 'musicOnHold';
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var queueSettings = {};
        var musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
        queueSettings.musicOnHold = musicOnHold;
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        musicOnHold.addAction(playAction);
        routeToQueue.queueSettings = queueSettings;
        menuEntry.actions[0] = routeToQueue;
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      }));

      it('should activate properly from routeToQueue musicOnHold path', function () {
        expect(controller).toBeDefined();
        expect(controller.uploadFile).toEqual('');
        expect(controller.uploadDate).toEqual('');
        expect(controller.uploadDuration).toEqual('');
        expect(controller.state).toEqual(controller.WAIT);
      });
    });

    describe('menu header activate functionality', function () {
      beforeEach(inject(function () {
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
        uiMenu.type = menuOption;
        ui[schedule].entries[index] = uiMenu;
        menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.type = menuOptionAnnouncement;
        menuEntry.voice = voice;
        var playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        playAction.voice = voice;
        menuEntry.addAction(playAction);
        ui[schedule].entries[index].headers.push(menuEntry);
        $scope.menuId = menuId;
      }));

      it('should activate properly from menu header path', function () {
        $scope.isMenuHeader = true;
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        expect(controller).toBeDefined();
        expect(controller.uploadFile).toEqual('');
        expect(controller.uploadDate).toEqual('');
        expect(controller.uploadDuration).toEqual('');
        expect(controller.state).toEqual(controller.WAIT);
      });

      it('should activate properly from sub menu header path', function () {
        $scope.menuKeyIndex = -1;
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        expect(controller).toBeDefined();
        expect(controller.uploadFile).toEqual('');
        expect(controller.uploadDate).toEqual('');
        expect(controller.uploadDuration).toEqual('');
        expect(controller.state).toEqual(controller.WAIT);
      });
    });

    describe('menu key activate functionality', function () {
      beforeEach(inject(function () {
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
        uiMenu.type = menuOption;
        ui[schedule].entries[index] = uiMenu;
        menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.type = menuOption;
        var playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        menuEntry.addAction(playAction);
        uiMenu.entries.push(menuEntry);
        $scope.menuId = menuId;
        $scope.menuKeyIndex = keyIndex;
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      }));

      it('should activate properly from menu key path', function () {
        expect(controller).toBeDefined();
        expect(controller.uploadFile).toEqual('');
        expect(controller.uploadDate).toEqual('');
        expect(controller.uploadDuration).toEqual('');
        expect(controller.state).toEqual(controller.WAIT);
      });
    });

    it('should activate and set variables to false', function () {
      expect(controller).toBeDefined();
      expect(controller.state).toEqual(controller.WAIT);
      expect(controller.uploadFile).toBeFalsy();
      expect(controller.uploadDate).toBeFalsy();
      expect(controller.uploadDuration).toBeFalsy();
    });

    describe('activate with good previously uploaded media', function () {
      var controller;

      beforeEach(inject(function ($controller) {
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        playAction.setValue(uploadUrl);
        playAction.setDescription(JSON.stringify(fileDescription));
        menuEntry.actions[0] = playAction;
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      }));

      it('should activate and set variables', function () {
        expect(controller.uploadFile).toEqual(fileNameValid);
        expect(controller.uploadDate).toEqual(fileDate);
        expect(controller.uploadDuration).toEqual(fileDuration);
        expect(controller.state).toEqual(controller.UPLOADED);
      });

      describe('on CE Saved', function () {
        beforeEach(function () {
          spyOn(AAMediaUploadService, 'notifyAsSaved');
          $rootScope.$broadcast('CE Saved');
          $rootScope.$apply();
        });

        it('should call notifyAsSaved on ce saved broadcast', function () {
          expect(AAMediaUploadService.notifyAsSaved).toHaveBeenCalled();
        });
      });
      describe('on Queue Cancelled', function () {
        beforeEach(function () {
          spyOn(AAMediaUploadService, 'notifyAsActive');
          $rootScope.$broadcast('Queue_Cancelled');
          $rootScope.$apply();
        });

        it('should call notifyAsActive to false on queue cancelled broadcast', function () {
          expect(AAMediaUploadService.notifyAsActive).toHaveBeenCalledWith(jasmine.any(String), false);
        });
      });
    });
  });

  describe('openModal', function () {
    describe('cancel modal', function () {
      it('should open and dismiss a cancel modal', function () {
        controller.openModal(controller.dialogModalTypes.cancel);
        $scope.$apply();
        expect(ModalService.open).toHaveBeenCalled();
        modal.reject();
        $scope.$apply();
      });

      it('should open and close a cancel modal', function () {
        controller.openModal(controller.dialogModalTypes.cancel);
        $scope.$apply();
        expect(ModalService.open).toHaveBeenCalled();
        modal.resolve();
        $scope.$apply();
      });

      describe('rollBack from openModal cancel type', function () {
        beforeEach(function () {
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          playAction.setValue(uploadUrl);
          playAction.setDescription(JSON.stringify(fileDescription2));
          menuEntry.actions[0] = playAction;
          controller.uploadFile = fileDescription2.uploadFile;
          controller.uploadDate = fileDescription2.uploadDate;
          controller.uploadDuration = fileDescription2.uploadDuration;
          controller.actionCopy = {};
          controller.actionCopy.description = JSON.stringify(fileDescription);
          controller.actionCopy.value = uploadUrl;
          controller.actionCopy.voice = voice;
          controller.openModal(controller.dialogModalTypes.cancel);
          $scope.$apply();
        });

        it('should ensure rollBack is called to revert to action copy', function () {
          modal.resolve();
          $scope.$apply();
          expect(controller.uploadFile).toEqual(fileNameValid);
        });

        it('should ensure rollBack is not called to revert to action copy', function () {
          modal.reject();
          $scope.$apply();
          expect(controller.uploadFile).toEqual(fileNameValid2);
        });

        it('should ensure reset is called to set to default', function () {
          controller.actionCopy = undefined;
          modal.resolve();
          $scope.$apply();
          expect(controller.uploadFile).toBeFalsy();
        });
      });
    });
  });

  describe('upload', function () {
    it('should not allow an empty file to upload', function () {
      spyOn(AAMediaUploadService, 'validateFile');
      controller.upload(undefined);
      $scope.$digest();
      expect(controller.uploadFile).toEqual('');
      controller.upload(null);
      $scope.$digest();
      expect(AAMediaUploadService.validateFile).not.toHaveBeenCalled();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });

    describe('when bad response data is sent back', function () {
      beforeEach(function () {
        spyOn(AAMediaUploadService, 'upload').and.callThrough();
        $httpBackend.whenPOST(uploadUrl).respond(200, true);
        spyOn(AANotificationService, 'error');
      });

      it('uploadSuccess empty return', function () {
        spyOn(AAMediaUploadService, 'retrieve').and.returnValue('');
        controller.upload(validFile);
        deferred.resolve(1);
        $scope.$digest();
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
        expect(Analytics.trackEvent).not.toHaveBeenCalled();
      });

      it('uploadSuccess rejected get promise', function () {
        spyOn(AAMediaUploadService, 'retrieve').and.returnValue('');
        controller.upload(validFile);
        deferred.resolve(1);
        $scope.$digest();
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
        expect(Analytics.trackEvent).not.toHaveBeenCalled();
      });

      it('uploadSuccess rejected get promise', function () {
        spyOn(AAMediaUploadService, 'retrieve').and.returnValue('');
        controller.upload(validFile);
        deferred.resolve(1);
        $scope.$digest();
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
        expect(Analytics.trackEvent).not.toHaveBeenCalled();
      });
    });

    describe('happy path', function () {
      beforeEach(function () {
        spyOn(AAMediaUploadService, 'retrieve').and.returnValue(variantUrlPlayback);
      });

      describe('when previous upload', function () {
        beforeEach(function () {
          spyOn(AAMediaUploadService, 'upload').and.callThrough();
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          playAction.setValue(uploadUrl);
          playAction.setDescription(JSON.stringify(fileDescription));
          menuEntry.actions[0] = playAction;
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
          controller.upload(validFile);
          deferred.resolve(1);
          $scope.$digest();
          $httpBackend.flush();
          expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
            sizeInMB: jasmine.any(Number),
            durationInSeconds: jasmine.any(Number),
            uuid: jasmine.any(String),
            orgid: jasmine.any(String),
          });
        });

        describe('with delete', function () {
          beforeEach(function () {
            spyOn(AACommonService, 'getUniqueId').and.returnValue(1);
            spyOn(AACommonService, 'setIsValid').and.callThrough();
            spyOn(AACommonService, 'setMediaUploadStatus').and.callThrough();
            spyOn(AAMediaUploadService, 'getResources').and.callThrough();
            spyOn(AAMediaUploadService, 'clearResourcesExcept').and.callThrough();
          });

          it('when upload length is greater than 1, should rollBack on delete', function () {
            controller.upload(validFile2);
            modal.resolve();
            $scope.$apply();
            deferred.resolve(1);
            $scope.$digest();
            $httpBackend.flush();
            $scope.$apply();
            controller.openModal('delete');
            $scope.$apply();
            modal.resolve();
            $scope.$apply();
            expect(AACommonService.setMediaUploadStatus).toHaveBeenCalledWith(true);
            expect(AACommonService.setIsValid).toHaveBeenCalledWith('mediaUploadCtrl' + AACommonService.getUniqueId(), true);
            expect(AAMediaUploadService.clearResourcesExcept).toHaveBeenCalled();
            expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
              sizeInMB: jasmine.any(Number),
              durationInSeconds: jasmine.any(Number),
              uuid: jasmine.any(String),
              orgid: jasmine.any(String),
            });
          });

          it('when delete is cancelled no action should be made', function () {
            controller.openModal('delete');
            modal.reject();
            $scope.$apply();
            expect(AACommonService.setIsValid).not.toHaveBeenCalled();
            expect(AACommonService.setMediaUploadStatus).not.toHaveBeenCalled();
            expect(AAMediaUploadService.clearResourcesExcept).not.toHaveBeenCalled();
          });
        });

        describe('with overwrite', function () {
          it('should confirm an overwrite and change the file', function () {
            $httpBackend.whenPOST(uploadUrl).respond(200, true);
            expect(controller.uploadFile).toEqual(validFile.name);
            expect(controller.uploadDate).toMatch('[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]');
            controller.upload(validFile2);
            deferred.resolve(1);
            $scope.$digest();
            modal.resolve();
            $scope.$apply();
            expect(controller.uploadFile).toEqual(validFile2.name);
            expect(controller.uploadDate).toMatch('[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]');
            expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
              sizeInMB: jasmine.any(Number),
              durationInSeconds: jasmine.any(Number),
              uuid: jasmine.any(String),
              orgid: jasmine.any(String),
            });
          });

          it('should open and dismiss an overwrite modal and not change the file', function () {
            controller.upload(validFile);
            $scope.$apply();
            expect(ModalService.open).toHaveBeenCalled();
            modal.reject();
            $scope.$apply();
            expect(AAMediaUploadService.upload.calls.count()).toEqual(1);
          });

          it('should open and close an overwrite modal', function () {
            controller.upload(validFile);
            $scope.$apply();
            expect(ModalService.open).toHaveBeenCalled();
            modal.resolve();
            $scope.$apply();
          });
        });
      });

      describe('when no previous upload', function () {
        beforeEach(function () {
          spyOn(AAMediaUploadService, 'upload').and.callThrough();
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          menuEntry.actions[0] = playAction;
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
        });

        describe('with delete', function () {
          beforeEach(function () {
            spyOn(AACommonService, 'getUniqueId').and.returnValue(1);
            spyOn(AACommonService, 'setIsValid').and.callThrough();
            spyOn(AACommonService, 'setMediaUploadStatus').and.callThrough();
            spyOn(AAMediaUploadService, 'clearResourcesExcept').and.callThrough();
          });

          it('when upload length is less than 1', function () {
            controller.openModal('delete');
            modal.resolve();
            $scope.$apply();
            expect(AACommonService.setMediaUploadStatus).toHaveBeenCalledWith(true);
            expect(AACommonService.setIsValid).toHaveBeenCalledWith('mediaUploadCtrl' + AACommonService.getUniqueId(), true);
            expect(AAMediaUploadService.clearResourcesExcept).not.toHaveBeenCalled();
          });
        });

        describe('with overwrite', function () {
          it('should not open an overwrite modal', function () {
            controller.upload(validFile);
            deferred.resolve(1);
            $scope.$digest();
            $httpBackend.flush();
            $scope.$apply();
            expect(ModalService.open).not.toHaveBeenCalled();
            expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
              sizeInMB: jasmine.any(Number),
              durationInSeconds: jasmine.any(Number),
              uuid: jasmine.any(String),
              orgid: jasmine.any(String),
            });
          });
        });

        describe('with cancel', function () {
          beforeEach(function () {
            playAction.setValue(uploadUrl);
            playAction.setDescription(JSON.stringify(fileDescription));
            controller.openModal(controller.dialogModalTypes.cancel);
          });

          it('should continue uploading when cancel gets dismissed', function () {
            controller.upload(validFile);
            deferred.resolve(1);
            $scope.$digest();
            $httpBackend.flush();
            $scope.$apply();
            modal.reject();
            $scope.$apply();
            expect(controller.uploadFile).toEqual(validFile.name);
            expect(controller.uploadDate).toMatch('[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]');
            expect(controller.state).toEqual(controller.UPLOADED);
            expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
              sizeInMB: jasmine.any(Number),
              durationInSeconds: jasmine.any(Number),
              uuid: jasmine.any(String),
              orgid: jasmine.any(String),
            });
          });

          it('should rollBack changes when cancel gets closed', function () {
            controller.upload(validFile);
            deferred.resolve(1);
            $scope.$digest();
            $httpBackend.flush();
            $scope.$apply();
            modal.resolve();
            $scope.$apply();
            expect(controller.uploadFile).toBeFalsy();
            expect(controller.uploadDuration).toBeFalsy();
            expect(controller.uploadDate).toBeFalsy();
            expect(controller.state).toEqual(controller.WAIT);
            expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
              sizeInMB: jasmine.any(Number),
              durationInSeconds: jasmine.any(Number),
              uuid: jasmine.any(String),
              orgid: jasmine.any(String),
            });
          });
        });
      });

      describe('calls', function () {
        beforeEach(function () {
          spyOn(AAMediaUploadService, 'upload').and.callThrough();
          spyOn(AANotificationService, 'error');
        });

        it('should receive an error from media duration and not upload', function () {
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          menuEntry.actions[0] = playAction;
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
          controller.upload(validFile);
          deferred.reject();
          $scope.$digest();
          expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
          expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
          expect(Analytics.trackEvent).not.toHaveBeenCalled();
          expect(controller.state).toEqual(controller.WAIT);
        });

        it('should upload and set variables given a valid file name on upload call', function () {
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          menuEntry.actions[0] = playAction;
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
          controller.upload(validFile);
          deferred.resolve(1);
          $scope.$digest();
          $httpBackend.flush();
          expect(controller.uploadFile).toEqual(validFile.name);
          expect(controller.uploadDate).toMatch('[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]');
          expect(controller.state).toEqual(controller.UPLOADED);
          expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
            sizeInMB: jasmine.any(Number),
            durationInSeconds: jasmine.any(Number),
            uuid: jasmine.any(String),
            orgid: jasmine.any(String),
          });
        });

        it('should not upload given an invalid file name on upload call and print an error message', function () {
          controller.upload(invalidFileByName);
          deferred.resolve(1);
          $scope.$digest();
          expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
          expect(AANotificationService.error).toHaveBeenCalledWith('fileUpload.errorFileType');
          expect(Analytics.trackEvent).not.toHaveBeenCalled();
        });

        it('should not upload given an invalid file size on upload call and print an error message', function () {
          controller.upload(invalidFileBySize);
          deferred.resolve(1);
          $scope.$digest();
          expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
          expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.fileUploadSizeIncorrect', { fileSize: fileSizeMax / 1024 / 1024 });
          expect(Analytics.trackEvent).not.toHaveBeenCalled();
        });

        it('should not upload given an invalid file name on upload call and not set variables', function () {
          controller.upload(invalidFileByName);
          expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
          expect(controller.state).toEqual(controller.WAIT);
          expect(Analytics.trackEvent).not.toHaveBeenCalled();
        });

        it('should upload and set variables given a valid file', function () {
          playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
          menuEntry.actions[0] = playAction;
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
          controller.upload(validFile);
          deferred.resolve(1);
          $scope.$digest();
          expect(AAMediaUploadService.upload).toHaveBeenCalled();
          $httpBackend.flush();
          expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.MEDIA_UPLOAD, {
            sizeInMB: jasmine.any(Number),
            durationInSeconds: jasmine.any(Number),
            uuid: jasmine.any(String),
            orgid: jasmine.any(String),
          });
          expect(controller.uploadFile).toEqual(validFile.name);
          expect(controller.uploadDate).toMatch('[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]');
          expect(controller.state).toEqual(controller.UPLOADED);
        });

        it('should print an error and not set upload file variables with a bad server response and a valid file', function () {
          // mocking Upload.http reject due to a PUR inside ng-file-upload-all.js
          // (see https://github.com/danialfarid/ng-file-upload/issues/2019)
          var httpDeferred = $q.defer();
          httpDeferred.promise.abort = function () {};
          spyOn(Upload, 'http').and.returnValue(httpDeferred.promise);

          controller.upload(validFile);
          deferred.resolve(1);
          httpDeferred.reject({ status: 500 });
          $scope.$apply();
          expect(AAMediaUploadService.upload).toHaveBeenCalled();
          expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
          expect(Analytics.trackEvent).not.toHaveBeenCalled();
          expect(controller.uploadFile).toBeFalsy();
          expect(controller.uploadDate).toBeFalsy();
          expect(controller.uploadDuration).toBeFalsy();
          expect(controller.state).toEqual(controller.WAIT);
        });
      });
    });
  });
  describe('Squishability', function () {
    // special case of sub menu header needs to be a little bit tighter
    // So.. if three lanes and no key action and it is a menu header then
    // it needs some squishing

    var controller;

    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      controller = $controller;

      spyOn(AutoAttendantCeMenuModelService, 'getCeMenu').and.returnValue(ui);
    }));

    it('should test Squishabilty for one lane', function () {
      var c;

      $scope.menuKeyIndex = '';
      $scope.isMenuHeader = '';

      c = controller('AAMediaUploadCtrl', {
        $scope: $scope,
      });

      expect(c.isSquishable()).toBeFalsy();
    });
    it('should test Squishabilty for two lanes', function () {
      var c;

      ui.isClosedHours = true;

      $scope.menuKeyIndex = '';
      $scope.isMenuHeader = '';

      c = controller('AAMediaUploadCtrl', {
        $scope: $scope,
      });

      expect(c.isSquishable()).toBeFalsy();
    });
    it('should test Squishabilty for two lanes (holiday follows closedHours)', function () {
      var c;

      ui.isClosedHours = true;
      ui.holidaysValue = 'closedHours';
      ui.isHolidays = true;

      $scope.menuKeyIndex = '';
      $scope.isMenuHeader = '';

      c = controller('AAMediaUploadCtrl', {
        $scope: $scope,
      });

      expect(c.isSquishable()).toBeFalsy();
    });

    it('should test Squishabilty for three lanes', function () {
      var c;

      ui.isClosedHours = true;
      ui.isHolidays = true;
      ui.holidaysValue = '';

      $scope.menuKeyIndex = '';
      $scope.isMenuHeader = '';

      c = controller('AAMediaUploadCtrl', {
        $scope: $scope,
      });

      expect(c.isSquishable()).toBeFalsy();
    });

    it('should test Squishabilty for three lanes should be squished', function () {
      // here is the one case where it needs squishing

      var c;

      ui.isClosedHours = true;
      ui.isHolidays = true;
      ui.holidaysValue = '';

      menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();

      var action = (AutoAttendantCeMenuModelService.newCeActionEntry('play', ''));

      menuEntry.actions.push(action);

      ui.type = 'MENU_OPTION_ANNOUNCEMENT';
      ui.headers = [];
      ui.headers[0] = menuEntry;
      ui.headers[0].type = 'MENU_OPTION_ANNOUNCEMENT';

      $scope.menuKeyIndex = '';
      $scope.isMenuHeader = 'false';

      c = controller('AAMediaUploadCtrl', {
        $scope: $scope,
      });

      expect(c.isSquishable()).toBeTruthy();
    });
  });
});
