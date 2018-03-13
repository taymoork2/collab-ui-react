import testModule from './index';

describe('crUserCsvResults Component', () => {

  /////////////////////////

  function initMocks() {

    this.fakeModal = {
      result: {
        then: function (okCallback, cancelCallback) {
          this.okCallback = okCallback;
          this.cancelCallback = cancelCallback;
        },
      },
      close: function (item) {
        this.result.okCallback(item);
      },
      dismiss: function (type) {
        this.result.cancelCallback(type);
      },
    };

    this.fakeCsv = {
      isCancelledByUser: false,
      isDirSyncEnabled: false,

      model: {
        fileName: 'test-filename.csv',

        isRetrying: false,
        usersToRetry: [],
        retryTimerParts: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },

        isProcessing: true,
        processProgress: 0,
        numTotalUsers: 0,
        numNewUsers: 0,
        existingUsers: 0,
        numMaxUsers: 0,
        userErrorArray: [],
      },
    };
  }

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight', testModule);
    this.injectDependencies('$componentController', '$scope', '$httpBackend');

    initMocks.apply(this);
    initDependencySpies.apply(this);
    initUtils.apply(this);
  }

  function initDependencySpies() {
  }

  function initUtils() {

    this.clickElement = function clickElement(selector) {
      this.view.find(selector)[0].click();
    };

    this.setElementValue = function setElementValue(selector, value) {
      $(this.view.find(selector)[0]).val(value).triggerHandler('input');
    };

    this.getElementValue = function getElementValue(selector) {
      return $(this.view.find(selector)[0]).val();
    };

  }

  function initComponent(bindings) {
    this.compileComponent('crUserCsvResults', bindings);
  }

  function initController(bindings) {
    this.controller = this.$componentController('crUserCsvResults', {
      $scope: this.$scope,
      $element: angular.element(''),
    }, bindings);
    this.$scope.$apply();
    this.controller.$onInit();
  }

  afterEach(function () {
    if (this.view) {
      this.view.remove();
    }
  });

  beforeEach(init);

  /////////////

  describe('Component', () => {

    beforeEach(function () {

      this.$scope.handleCancelImport = jasmine.createSpy('handleCancelImport');
      this.$scope.fakeCsv = this.fakeCsv;

      const bindings = {
        csvData: 'fakeCsv',
        onCancelImport: 'handleCancelImport()',
      };
      initComponent.apply(this, [bindings]);
    });

    it('should have required HTML for non-DirSync org', function () {

      // ensure we have our initial settings
      expect(this.controller.csvData.isDirSyncEnabled).toBeFalsy();
      expect(this.controller.csvData.model.isProcessing).toBeTruthy();
      expect(this.controller.csvData.model.isRetrying).toBeFalsy();
      expect(this.controller.csvData.model.usersToRetry).toHaveLength(0);
      expect(this.controller.csvData.model.userErrorArray).toHaveLength(0);

      // make sure the required elements exist in the DOM
      expect(this.view.find('.progress-striped')).toHaveLength(1);
      expect(this.view.find('.icon-close')).toHaveLength(1);
      expect(this.view.find('.stat.new-users')).toHaveLength(1);
      expect(this.view.find('.stat.updated-users')).toHaveLength(1);
      expect(this.view.find('.stat.error-users')).toHaveLength(1);

      expect(this.view.find('.upload-errors')).toHaveLength(0);

    });

    it('should have required HTML for DirSync org', function () {

      this.controller.csvData.isDirSyncEnabled = true;
      this.$scope.$apply();

      // ensure we have our initial settings
      expect(this.controller.csvData.isDirSyncEnabled).toBeTruthy();
      expect(this.controller.csvData.model.isProcessing).toBeTruthy();
      expect(this.controller.csvData.model.isRetrying).toBeFalsy();
      expect(this.controller.csvData.model.usersToRetry).toHaveLength(0);
      expect(this.controller.csvData.model.userErrorArray).toHaveLength(0);

      // make sure the required elements exist in the DOM
      expect(this.view.find('.progress-striped')).toHaveLength(1);
      expect(this.view.find('.icon-close')).toHaveLength(1);
      expect(this.view.find('.stat.new-users')).toHaveLength(0);
      expect(this.view.find('.stat.updated-users')).toHaveLength(1);
      expect(this.view.find('.stat.error-users')).toHaveLength(1);

      expect(this.view.find('.upload-errors')).toHaveLength(0);

    });

    it('should show new users count when there are new users', function () {
      this.controller.csvData.isDirSyncEnabled = false;
      this.controller.csvData.model.numNewUsers = 0;
      this.$scope.$apply();
      expect(this.view.find('.stat.new-users')).toHaveClass('disabled');
      expect(this.view.find('.stat.new-users .total').text()).toEqual('0');

      this.controller.csvData.model.numNewUsers = 9;
      this.$scope.$apply();
      expect(this.view.find('.stat.new-users')).not.toHaveClass('disabled');
      expect(this.view.find('.stat.new-users .total').text()).toEqual('9');
    });

    it('should show updated users count when there are updated users', function () {
      this.controller.csvData.model.numExistingUsers = 0;
      this.$scope.$apply();
      expect(this.view.find('.stat.updated-users')).toHaveClass('disabled');
      expect(this.view.find('.stat.updated-users .total').text()).toEqual('0');

      this.controller.csvData.model.numExistingUsers = 7;
      this.$scope.$apply();
      expect(this.view.find('.stat.updated-users')).not.toHaveClass('disabled');
      expect(this.view.find('.stat.updated-users .total').text()).toEqual('7');
    });

    it('should show error users count when there are users with errors', function () {
      this.controller.csvData.model.userErrorArray = [];
      this.$scope.$apply();
      expect(this.view.find('.stat.error-users')).toHaveClass('disabled');
      expect(this.view.find('.stat.error-users .total').text()).toEqual('0');
      expect(this.view.find('.upload-errors')).toHaveLength(0);

      this.controller.csvData.model.userErrorArray = [
        { row: 1, error: 'line 1' },
        { row: 2, error: 'line 2' },
        { row: 3, error: 'line 3' },
        { row: 4, error: 'line 4' },
      ];
      this.$httpBackend.whenGET(/.*\/me.*/g).respond(true);
      this.$scope.$apply();
      expect(this.view.find('.stat.error-users')).not.toHaveClass('disabled');
      expect(this.view.find('.stat.error-users .total').text()).toEqual('4');
      expect(this.view.find('.upload-errors')).toHaveLength(1);
      expect(this.view.find('.table-body .row')).toHaveLength(4);
      expect(this.view.find('.csv-download .stat')).not.toHaveClass('ng-hide');

    });

    it('should show cancel dialog when close dialog is pressed', function () {

      const closeBtn = this.view.find('.close-button a');
      expect(closeBtn).toHaveLength(1);
      closeBtn.click();
      this.$scope.$apply();
      expect(this.$scope.handleCancelImport).toHaveBeenCalled();

    });

  });

  /////////////

  describe('Controller', function () {
    beforeEach(function () {
      this.bindings = {
        csvData: this.fakeCsv,
        onCancelImport: jasmine.createSpy('onStatusChange'),
      };
      initController.call(this, this.bindings);
    });

    it('should set csv data in scope to supplied', function () {
      expect(this.controller.csvData).toBe(this.bindings.csvData);
    });

    it('should call cancel callback when onCancelImport() called', function () {
      this.controller.onCancelImport();
      expect(this.bindings.onCancelImport).toHaveBeenCalled();
    });

  });

});
