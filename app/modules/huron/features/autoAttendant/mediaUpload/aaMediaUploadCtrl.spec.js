'use strict';

describe('Controller: AAMediaUploadCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $httpBackend;
  var AANotificationService;
  var AAUiModelService;
  var AutoAttendantCeMenuModelService;
  var AAMediaUploadService;

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
  var fileSize = 41236;
  var fileModified = 1470671405088;
  var fileDate = '09/01/16';

  var validFile = {
    lastModified: fileModified,
    name: fileNameValid,
    size: fileSize
  };
  var invalidFileByName = {
    lastModified: fileModified,
    name: fileNameInvalid,
    size: fileSize
  };
  var uploadUrl = 'http://54.183.25.170:8001/api/notify/upload' + '?customerId=' + null;

  var fileDescription = {
    uploadFile: fileNameValid,
    uploadDate: fileDate,
    uploadUrl: uploadUrl,
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _AANotificationService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_, _AAMediaUploadService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    AANotificationService = _AANotificationService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AAMediaUploadService = _AAMediaUploadService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);

    $scope.schedule = schedule;
    $scope.index = index;

    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    controller = $controller('AAMediaUploadCtrl', {
      $scope: $scope
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
    });

    describe('activate with good previously uploaded media', function () {
      var controller;

      beforeEach(inject(function ($controller) {
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        playAction.setValue(uploadUrl);
        playAction.setDescription(JSON.stringify(fileDescription));
        menuEntry.addAction(playAction);
        controller = $controller('AAMediaUploadCtrl', {
          $scope: $scope
        });
        $scope.$apply();
      }));

      it('should activate and set variables', function () {
        expect(controller.uploadFile).toEqual(fileNameValid);
        expect(controller.uploadDate).toEqual(fileDate);
        expect(controller.state).toEqual(controller.UPLOADED);
      });
    });
  });


  describe('upload', function () {

    describe('upload calls', function () {
      beforeEach(function () {
        spyOn(AAMediaUploadService, 'upload').and.callThrough();
        spyOn(AANotificationService, 'error');
      });

      it('should upload and set variables given a valid file name on upload call', function () {
        controller.upload(validFile);
        expect(controller.uploadFile).toEqual(validFile.name);
        expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
        expect(controller.state).toEqual(controller.DOWNLOAD);
      });

      it('should not upload given an invalid file name on upload call and print an error message', function () {
        controller.upload(invalidFileByName);
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
        menuEntry.addAction(playAction);
        $httpBackend.whenPOST(uploadUrl).respond(200, true);
        controller.upload(validFile);
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(controller.uploadFile).toEqual(validFile.name);
        expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
        expect(controller.state).toEqual(controller.UPLOADED);
      });

      it('should print an error with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500, false);
        controller.upload(validFile);
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
      });

      it('should not set upload file variables with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500, false);
        controller.upload(validFile);
        expect(AAMediaUploadService.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(controller.uploadFile).toBeFalsy();
        expect(controller.uploadDate).toBeFalsy();
      });
    });
  });
});
