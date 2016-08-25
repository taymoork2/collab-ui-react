'use strict';

describe('Controller: ResetDeviceController', function () {
  var $httpBackend, controller, XhrNotificationService;
  var url = "http://dummyUrl";
  var fakeModal = {
    close: sinon.stub()
  };

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));

  describe('Expected Responses', function () {
    beforeEach(inject(function ($controller, _$httpBackend_, _XhrNotificationService_) {
      XhrNotificationService = _XhrNotificationService_;
      $httpBackend = _$httpBackend_;

      spyOn(XhrNotificationService, 'notify');
      spyOn(fakeModal, 'close');

      controller = $controller('ResetDeviceController', {
        $modalInstance: fakeModal,
        deviceOrCode: {
          url: url
        }
      });
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not notify on successful reset', function () {
      $httpBackend.whenPUT(url).respond([200, {}]);
      controller.resetDevice();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(XhrNotificationService.notify).not.toHaveBeenCalled();
    });

    it('should notify on failed reset', function () {
      $httpBackend.whenPUT(url).respond(500);
      controller.resetDevice();
      $httpBackend.flush();

      expect(fakeModal.close).not.toHaveBeenCalled();
      expect(XhrNotificationService.notify).toHaveBeenCalled();
    });
  });
});
