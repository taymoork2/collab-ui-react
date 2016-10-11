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
  var AutoAttendantCeMenuModelService;
  var AAMediaUploadService;
  var modal;
  var deferred;

  var ui = {
    openHours: {}
  };
  var uiMenu = {};
  var menuEntry = {};
  var playAction = {};
  var schedule = 'openHours';
  var index = '0';

  var fileNameInvalid = "ILTQq4.jpg";
  var fileNameValid = "ILTQq4.wav";
  var fileNameValid2 = "ILTQq5.wav";
  var fileSize = 41236;
  var fileSize2 = 43451;
  var fileModified = 1470671405088;
  var fileModified2 = 1470671405088;
  var fileDate = '09/01/16';
  var fileDate2 = '09/01/16';

  var validFile = {
    lastModified: fileModified,
    name: fileNameValid,
    size: fileSize
  };
  var validFile2 = {
    lastModified: fileModified2,
    name: fileNameValid2,
    size: fileSize2
  };
  var invalidFileByName = {
    lastModified: fileModified,
    name: fileNameInvalid,
    size: fileSize
  };
  var uploadUrl = 'http://54.183.25.170:8001/api/notify/upload' + '?customerId=' + null;
  var voice = "Vanessa";
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

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _$q_, _Upload_, _ModalService_, _AANotificationService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AAMediaUploadService_) {
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
    modal = $q.defer();
    deferred = $q.defer();

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    spyOn(ModalService, 'open').and.returnValue({
      result: modal.promise
    });
    spyOn(Upload, 'mediaDuration').and.returnValue(deferred.promise);

    $scope.schedule = schedule;
    $scope.index = index;

    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    controller = $controller('AAMediaUploadCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('activate', function () {
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
        // menuEntry.addAction(playAction);
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
          expect(controller.uploadDate).toBeFalsy();
          expect(controller.uploadDuration).toBeFalsy();
          expect(playAction.value).toBeFalsy();
          expect(playAction.description).toBeFalsy();
        });
      });
    });
  });

  describe('upload', function () {

    describe('when previous upload', function () {
      beforeEach(function () {
        spyOn(AAMediaUploadService, 'upload').and.callThrough();
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        playAction.setValue(uploadUrl);
        playAction.setDescription(JSON.stringify(fileDescription));
        menuEntry.actions[0] = playAction;
        $httpBackend.whenPOST(uploadUrl).respond(200, true);
        controller.upload(validFile);
        deferred.resolve();
        $scope.$digest();
        $httpBackend.flush();
      });

      describe('with overwrite', function () {
        it('should confirm an overwrite and change the file', function () {
          $httpBackend.whenPOST(uploadUrl).respond(200, true);
          expect(controller.uploadFile).toEqual(validFile.name);
          expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
          controller.upload(validFile2);
          deferred.resolve();
          $scope.$digest();
          modal.resolve();
          $scope.$apply();
          expect(controller.uploadFile).toEqual(validFile2.name);
          expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
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

      describe('with overwrite', function () {
        it('should not open an overwrite modal', function () {
          controller.upload(validFile);
          deferred.resolve();
          $scope.$digest();
          $httpBackend.flush();
          $scope.$apply();
          expect(ModalService.open).not.toHaveBeenCalled();
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
          deferred.resolve();
          $scope.$digest();
          $httpBackend.flush();
          $scope.$apply();
          modal.reject();
          $scope.$apply();
          expect(controller.uploadFile).toEqual(validFile.name);
          expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
          expect(controller.state).toEqual(controller.UPLOADED);
        });

        it('should rollBack changes when cancel gets closed', function () {
          controller.upload(validFile);
          deferred.resolve();
          $scope.$digest();
          $httpBackend.flush();
          $scope.$apply();
          modal.resolve();
          $scope.$apply();
          expect(controller.uploadFile).toBeFalsy();
          expect(controller.uploadDuration).toBeFalsy();
          expect(controller.uploadDate).toBeFalsy();
          expect(controller.state).toEqual(controller.WAIT);
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
        expect(controller.state).toEqual(controller.WAIT);
      });

      it('should upload and set variables given a valid file name on upload call', function () {
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        menuEntry.actions[0] = playAction;
        $httpBackend.whenPOST(uploadUrl).respond(200, true);
        controller.upload(validFile);
        deferred.resolve();
        $scope.$digest();
        $httpBackend.flush();
        expect(controller.uploadFile).toEqual(validFile.name);
        expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
        expect(controller.state).toEqual(controller.UPLOADED);
      });

      it('should not upload given an invalid file name on upload call and print an error message', function () {
        controller.upload(invalidFileByName);
        deferred.resolve();
        $scope.$digest();
        expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
        expect(AANotificationService.error).toHaveBeenCalledWith('fileUpload.errorFileType');
      });

      it('should not upload given an invalid file name on upload call and not set variables', function () {
        controller.upload(invalidFileByName);
        expect(AAMediaUploadService.upload).not.toHaveBeenCalled();
        expect(controller.state).toEqual(controller.WAIT);
      });

      it('should upload and set variables given a valid file', function () {
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        menuEntry.actions[0] = playAction;
        $httpBackend.whenPOST(uploadUrl).respond(200, true);
        controller.upload(validFile);
        deferred.resolve();
        $scope.$digest();
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(controller.uploadFile).toEqual(validFile.name);
        expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
        expect(controller.state).toEqual(controller.UPLOADED);
      });

      it('should print an error with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500, false);
        controller.upload(validFile);
        deferred.resolve();
        $scope.$digest();
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
      });

      it('should not set upload file variables with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500, false);
        controller.upload(validFile);
        deferred.resolve();
        $scope.$digest();
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(controller.uploadFile).toBeFalsy();
        expect(controller.uploadDate).toBeFalsy();
        expect(controller.uploadDuration).toBeFalsy();
        expect(controller.state).toEqual(controller.WAIT);
      });
    });
  });
});
