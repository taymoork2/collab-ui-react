'use strict';

describe('Controller: AAMediaUploadCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $httpBackend;
  var Upload;
  var AANotificationService;
  var AAUiModelService;
  var AutoAttendantCeMenuModelService;

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
  var uploadUrl = "https://angular-file-upload-cors-srv.appspot.com/upload";

  var fileDescription = {
    uploadFile: fileNameValid,
    uploadDate: fileDate,
    uploadUrl: uploadUrl,
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _Upload_, _AANotificationService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    Upload = _Upload_;
    AANotificationService = _AANotificationService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;

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
        spyOn(Upload, 'upload').and.callThrough();
        spyOn(AANotificationService, 'error');
      });

      it('should upload given a valid file name on upload call', function () {
        controller.upload(validFile);
        expect(Upload.upload.calls.argsFor(0)[0].url).toEqual(uploadUrl);
        expect(Upload.upload.calls.argsFor(0)[0].data).toEqual(validFile);
      });

      it('should upload and set variables given a valid file name on upload call', function () {
        controller.upload(validFile);
        expect(controller.uploadFile).toEqual(validFile.name);
        expect(controller.uploadDate).toMatch("[0-1][0-9][/][0-3][0-9][/][2][0][1-4][0-9]");
        expect(controller.state).toEqual(controller.DOWNLOAD);
      });

      it('should not upload given an invalid file name on upload call and print an error message', function () {
        controller.upload(invalidFileByName);
        expect(Upload.upload).not.toHaveBeenCalled();
        expect(AANotificationService.error).toHaveBeenCalledWith('fileUpload.errorFileType');
      });

      it('should not upload given an invalid file name on upload call and not set variables', function () {
        controller.upload(invalidFileByName);
        expect(Upload.upload).not.toHaveBeenCalled();
        expect(controller.state).toEqual(controller.WAIT);
      });

      it('should print an error with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500);
        controller.upload(validFile);
        expect(Upload.upload.calls.argsFor(0)[0].url).toEqual(uploadUrl);
        expect(Upload.upload.calls.argsFor(0)[0].data).toEqual(validFile);
        $httpBackend.flush();
        expect(AANotificationService.error).toHaveBeenCalledWith('autoAttendant.uploadFailed');
      });

      it('should not set upload file variables with a bad server response and a valid file', function () {
        $httpBackend.whenPOST(uploadUrl).respond(500);
        controller.upload(validFile);
        expect(Upload.upload).toHaveBeenCalled();
        $httpBackend.flush();
        expect(controller.uploadFile).toBeFalsy();
        expect(controller.uploadDate).toBeFalsy();
      });
    });
  });
});
