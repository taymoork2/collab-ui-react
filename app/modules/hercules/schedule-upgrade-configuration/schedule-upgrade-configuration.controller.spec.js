'use strict';

describe('Directive Controller: ScheduleUpgradeConfigurationCtrl', function () {
  beforeEach(angular.mock.module('Hercules'));

  var vm, $rootScope, $translate, $modal, Authinfo, ScheduleUpgradeService, NotificationService;

  var UIDataFixture = {
    scheduleTime: {
      label: '03:00 AM',
      value: '03:00'
    },
    scheduleDay: {
      label: 'Every Monday',
      value: 1
    },
    scheduleTimeZone: {
      label: 'United States: America/New_York',
      value: 'America/New_York'
    }
  };

  var serverDataFixture = {
    scheduleTime: '03:00',
    scheduleTimeZone: 'America/New_York',
    scheduleDay: 1,
    isAdminAcknowledged: false,
    postponed: false
  };

  beforeEach(angular.mock.module(function ($provide) {
    Authinfo = {
      getOrgId: sinon.stub().returns('dead-beef-123')
    };
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $q, $controller, _$translate_) {
    $rootScope = _$rootScope_;
    $translate = _$translate_;

    sinon.stub($translate, 'use', function () {
      return 'en_US';
    });

    ScheduleUpgradeService = {
      get: sinon.stub().returns($q.when(angular.copy(serverDataFixture))),
      patch: sinon.stub().returns($q.when(angular.extend({
        isAdminAcknowledged: true
      }, angular.copy(serverDataFixture))))
    };

    NotificationService = {
      removeNotification: sinon.stub()
    };

    $modal = {
      open: sinon.stub().returns({
        result: {
          then: function (callback) {
            callback({
              postponed: 12
            });
          }
        }
      })
    };

    vm = $controller('ScheduleUpgradeConfigurationCtrl', {
      $scope: $rootScope.$new(),
      $translate: $translate,
      $modal: $modal,
      Authinfo: Authinfo,
      ScheduleUpgradeService: ScheduleUpgradeService,
      NotificationService: NotificationService
    });
  }));

  it('should start in the syncing state', function () {
    expect(vm.state === 'syncing').toBe(true);
  });

  it('should start with no error message', function () {
    expect(vm.errorMessage === '').toBe(true);
  });

  it('should have all the 24 time options', function () {
    var timeOptions = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    expect(_.map(vm.timeOptions, 'value')).toEqual(timeOptions);
  });

  it('should have all the 7 day options', function () {
    var valueOptions = [7, 1, 2, 3, 4, 5, 6];
    expect(vm.dayOptions.length).toEqual(7);
    expect(_.map(vm.dayOptions, 'value')).toEqual(valueOptions);
  });

  it('should have many timezone options', function () {
    expect(vm.timezoneOptions.length > 20).toBe(true);
  });

  it('should have called ScheduleUpgradeService.get', function () {
    expect(ScheduleUpgradeService.get.calledOnce).toBe(true);
  });

  it('should have called ScheduleUpgradeService.patch when acknowledging', function () {
    expect(ScheduleUpgradeService.patch.called).toBe(false);
    var data = angular.copy(UIDataFixture);
    vm.acknowledge(data);
    $rootScope.$digest();
    expect(ScheduleUpgradeService.patch.calledOnce).toBe(true);
  });

  it('should open a modal when calling openModal', function () {
    vm.data = angular.copy(UIDataFixture);
    vm.openModal({
      preventDefault: function () {}
    });
    $rootScope.$digest();
    expect($modal.open.calledOnce).toBe(true);
  });

  it('should changed vm.postponed when the modal is closed with success', function () {
    vm.data = angular.copy(UIDataFixture);
    expect(vm.postponed).toBe(false);
    vm.openModal({
      preventDefault: function () {}
    });
    expect(vm.postponed).toBe(12);
  });

  it('should have called ScheduleUpgradeService.patch when UI data changed', function () {
    expect(ScheduleUpgradeService.patch.called).toBe(false);
    // let's pretend the first time is from the API
    vm.data = angular.copy(UIDataFixture);
    $rootScope.$digest();
    // and now it's because the user changed it
    vm.data.scheduleTime = {
      label: '04:00 AM',
      value: '04:00'
    };
    $rootScope.$digest();
    expect(ScheduleUpgradeService.patch.calledOnce).toBe(true);
  });
});
