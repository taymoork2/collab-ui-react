'use strict';

describe('controller: CbgRequestCtrl', function () {
  var $q, $state, $scope, $controller, $stateParams;
  var ctrl, cbgService, Notification;
  var cbgsData = getJSONFixture('gemini/callbackGroups.json');
  var preData = getJSONFixture('gemini/common.json');
  var csvFile = 'COUNTRY\r\nAlbania\r\nAnguilla\r\nUnited Kingdom';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $scope = $controller = $stateParams = ctrl = cbgService = Notification = undefined;
  });
  afterAll(function () {
    cbgsData = preData = csvFile = undefined;
  });

  function dependencies(_$q_, _$state_, $rootScope, _$controller_, _$stateParams_, _cbgService_, _Notification_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $stateParams = _$stateParams_;
    $controller = _$controller_;
    Notification = _Notification_;
  }

  function initSpecs() {
    spyOn(Notification, 'error');
    spyOn(Notification, 'notify');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn(cbgService, 'postRequest').and.returnValue($q.resolve());
    spyOn(cbgService, 'getCountries').and.returnValue($q.resolve());
  }

  function initController() {
    ctrl = $controller('CbgRequestCtrl', {
      $scope: $scope,
      cbgService: cbgService,
      $stateParams: $stateParams
    });
  }

  it('test resetFile', function () {
    ctrl.model.file = {
      file: null,
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
    };
    ctrl.model.postData = { countries: 'China' };
    ctrl.hideCountries = 'American';
    ctrl.resetFile();
    expect(ctrl.model.file).toBe(null);
    expect(ctrl.model.postData.countries.length).toBe(0);
    expect(ctrl.hideCountries).toBe(null);
  });

  it('function onFileSizeError response error message', function () {
    cbgService.postRequest.and.returnValue($q.reject({}));
    $stateParams.a = '';
    ctrl.onFileSizeError();
    expect(Notification.error).toHaveBeenCalled();
  });

  it('function onFileTypeError response error message', function () {
    ctrl.onFileTypeError();
    expect(Notification.error).toHaveBeenCalled();
  });

  it('test function removeCountry', function () {
    ctrl.model.postData.countries = [{ countryName: 'America' }, { countryName: 'Japan' }];
    ctrl.removeCountry('America');
    expect(ctrl.model.postData.countries.length).toBe(1);
  });

  it('test function removeCountry', function () {
    ctrl.model.file = '';
    ctrl.hideCountries = '';
    ctrl.model.postData.countries = [{ countryName: 'America' }];
    ctrl.removeCountry('America');
    expect(ctrl.model.file).toBe(null);
    expect(ctrl.hideCountries).toBe(null);
  });

  describe('onSubmit', function () {
    it('should return when customerId is null', function () {
      $stateParams.customerId = null;
      ctrl.loading = false;
      ctrl.onSubmit();
      $scope.$apply();
      expect(ctrl.loading).toBe(true);
    });

    it('', function () {
      $stateParams.customerId = 'ff808081582992dd01589a5b232410bb';
      cbgService.getCountries.and.returnValue($q.resolve(preData.getCountries));
      cbgService.postRequest.and.returnValue($q.resolve(cbgsData));
      ctrl.onSubmit();
      $scope.$apply();
      expect($state.modal.close).toHaveBeenCalled();
    });

    it('should compare ctrl.model.postData.countries with correct counries', function () {
      $stateParams.customerId = 'ff808081582992dd01589a5b232410bb';
      ctrl.model.postData.countries = [{
        'countryId': 1,
        'countryName': 'Albania'
      }, {
        'countryId': 2,
        'countryName': 'Algeria12'
      }];
      cbgService.getCountries.and.returnValue($q.resolve(preData.getCountries));
      cbgService.postRequest.and.returnValue($q.resolve(cbgsData));
      ctrl.onSubmit();
      $scope.$apply();
      expect(ctrl.model.postData.countries.length).toBe(1);
    });

    it('should call Notification.error', function () {
      $stateParams.customerId = 'ff808081582992dd01589a5b232410bb';
      cbgsData.content.data.returnCode = 1000;
      cbgService.getCountries.and.returnValue($q.resolve(preData.getCountries));
      cbgService.postRequest.and.returnValue($q.resolve(cbgsData));
      ctrl.onSubmit();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });
  });

  describe('csvFile', function () {
    it('should validate the csv file when the csv file is not empty', function () {
      ctrl.model.file = csvFile;
      ctrl.validateCsv();
      expect(ctrl.model.postData.countries.length).toBe(2);
    });

    it('should validate the csv file when the csv file is empty', function () {
      ctrl.model.file = '';
      ctrl.validateCsv();
      expect(ctrl.isCsvValid).toBe(false);
    });

    it('should return when the header of the csv file is empty', function () {
      ctrl.model.file = '\0\r\n\0';
      ctrl.validateCsv();
      expect(ctrl.isCsvValid).toBe(false);
    });
  });
});
