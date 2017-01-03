'use strict';

describe('Component: cbgEditCountry', function () {
  var $q, $state, $scope, $componentCtrl;
  var ctrl, cbgService, Notification, PreviousState;
  var preData = getJSONFixture('gemini/common.json');
  var csvFile = 'COUNTRY\r\nAlbania\r\nAnguilla\r\nUnited Kingdom';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $scope = $componentCtrl = ctrl = cbgService = Notification = PreviousState = undefined;
  });
  afterAll(function () {
    preData = csvFile = undefined;
  });

  function dependencies(_$q_, _$state_, _$rootScope_, _$componentController_, _cbgService_, _Notification_, _PreviousState_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    PreviousState = _PreviousState_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(PreviousState, 'go');
    spyOn(Notification, 'error');
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(cbgService, 'getCountries').and.returnValue($q.resolve());
    spyOn(cbgService, 'updateCallbackGroup').and.returnValue($q.resolve());
    spyOn(cbgService, 'getDownloadCountryUrl').and.returnValue($q.resolve());
  }

  function initController() {
    $state.current.data = {};
    ctrl = $componentCtrl('cbgEditCountry', { $scope: $scope, $state: $state });
  }


  function initReturnValue() {
    var allCountries = preData.getCountries;
    ctrl.model.info.countries = [];
    cbgService.getCountries.and.returnValue($q.resolve(allCountries));
    cbgService.getDownloadCountryUrl.and.returnValue($q.resolve(''));
  }

  describe('$onInit', function () {
    it('should initialize the options', function () {
      ctrl.model.info.groupId = 'ff8080815823e72c0158244952240022';
      initReturnValue();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.options.length > 0).toBe(true);
    });
  });

  describe('click event', function () {
    it('should call PreviousState.go in onCancel', function () {
      ctrl.onCancel();
      expect(PreviousState.go).toHaveBeenCalled();
    });

    it('should btnDisable false after onGroupNameChange execute', function () {
      ctrl.model.info.groupName = 'test_group';
      $scope.$apply();
      ctrl.onGroupNameChange();
      expect(ctrl.flags.groupNameFlag).toBe(true);
      expect(ctrl.btnDisable).toBe(false);
    });

    it('test onResetFile', function () {
      ctrl.onResetFile();
      expect(ctrl.model.file).toBe(null);
      expect(ctrl.model.info.countries.length).toBe(0);
      expect(ctrl.btnDisable).toBe(true);
    });

    it('function onFileSizeError response error message', function () {
      ctrl.onFileSizeError();
      expect(Notification.error).toHaveBeenCalled();
    });

    it('function onFileTypeError response error message', function () {
      ctrl.onFileTypeError();
      expect(Notification.error).toHaveBeenCalled();
    });

    it('test function onRemoveCountry', function () {
      ctrl.model.info.countries = [{
        'countryId': 1,
        'countryName': 'Albania'
      }, {
        'countryId': 2,
        'countryName': 'Algeria'
      }];
      ctrl.onRemoveCountry('Albania');
      expect(ctrl.model.info.countries.length).toBe(1);
    });

    it('test function onSelectChange', function () {
      ctrl.selected = [{ value: 1, label: 'Albania', isSelected: true }, { value: 2, label: 'Algeria', isSelected: false }];
      ctrl.model.info.countries = [{
        'countryId': 1,
        'countryName': 'Albania'
      }, {
        'countryId': 2,
        'countryName': 'Algeria'
      }];
      ctrl.onSelectChange();
      expect(ctrl.model.info.countries.length).toBe(1);
    });

    it('test function validateCsv', function () {
      ctrl.isCsvValid = true;
      ctrl.model = {
        file: csvFile,
        uploadProgress: 0,
        processProgress: 0,
        isProcessing: false,
        fileName: 'aasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasassd.csv', // when the filename is too long
        fullFileName: '',
        info: {
          countries: [{
            'countryId': 1,
            'countryName': 'Albania'
          }, {
            'countryId': 2,
            'countryName': 'Algeria'
          }]
        }
      };

      ctrl.validateCsv();
      expect(ctrl.isCsvValid).toBe(true);
    });

    describe('onSave', function () {
      function initOnsave() {
        ctrl.model.info.countries = [{
          'countryId': 1,
          'countryName': 'Albania'
        }, {
          'countryId': 2,
          'countryName': 'Algeria'
        }];
        ctrl.customerId = 'ff808081527ccb3f0152e39ec555010c';
        ctrl.model.info.groupId = '';
        ctrl.model.info.groupName = 'Feng Wu';
        ctrl.model.info.callbackGroupSites = [];
        ctrl.model.info.customerAttribute = 'CB group name';
        ctrl.model.info.ccaGroupId = 'ff8080815823e72c0158244952240022';
      }

      beforeEach(initOnsave);
      it('should call $state.go when return correct response', function () {
        var cbgUpdateResData = preData.common;
        cbgUpdateResData.content.data.body = preData.saveCbgResponse;
        cbgService.updateCallbackGroup.and.returnValue($q.resolve(cbgUpdateResData));

        ctrl.onSave();
        $scope.$apply();
        expect($state.go).toHaveBeenCalled();
      });

      it('should call Notification.error when return error response', function () {
        var cbgUpdateResData = preData.common;
        cbgUpdateResData.content.data.returnCode = 1000;
        cbgService.updateCallbackGroup.and.returnValue($q.resolve(cbgUpdateResData));

        ctrl.onSave();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalled();
      });

      it('should throw Notification.errorResponse', function () {
        cbgService.updateCallbackGroup.and.returnValue($q.reject({ 'status': 404 }));

        ctrl.onSave();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
      });
    });
  });
});
