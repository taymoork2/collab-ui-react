'use strict';

describe('Controller: ResetDeviceController', function () {
  var $httpBackend, controller, Notification;
  var url = 'http://dummyUrl';
  var fakeModal;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));

  describe('Expected Responses', function () {
    beforeEach(inject(function ($controller, _$httpBackend_, _Notification_) {
      Notification = _Notification_;
      $httpBackend = _$httpBackend_;

      spyOn(Notification, 'errorResponse');
      fakeModal = {
        close: jasmine.createSpy('close'),
      };

      controller = $controller('ResetDeviceController', {
        $modalInstance: fakeModal,
        device: {
          url: url,
        },
      });
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not notify on successful reset', function () {
      $httpBackend.expectPUT(url).respond([200, {}]);
      controller.resetDevice();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('should notify on failed reset', function () {
      $httpBackend.expectPUT(url).respond(500);
      controller.resetDevice();
      $httpBackend.flush();

      expect(fakeModal.close).not.toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });
});
