'use strict';

describe('Service: AANotificationService', function () {
  var AANotificationService, Notification, $translate;
  var key = 'CES0005';
  var trackingId = 'ATLAS_09d583dc-e55a-2574-7862-ff14fe6b9aed_2';
  var description = 'No Database Entries found for the specified criteria';
  var description = {
    description: description
  };
  var error = {
    key: key,
    message: [description],
    trackingId: trackingId
  };
  var data = {
    error: error
  };
  var response = {
    data: data
  };
  var message = 'autoAttendant.errorCreateCe';
  var parameters = {
    name: 'AA',
    statusText: 'failure',
    status: '500'
  };

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AANotificationService_, _Notification_, _$translate_) {
    AANotificationService = _AANotificationService_;
    $translate = _$translate_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');
  }));

  afterEach(function () {

  });

  describe('error', function () {
    it('should parse through response and call core Notification', function () {
      AANotificationService.error(response, message, parameters);
      expect(Notification.notify).toHaveBeenCalledWith(
        "autoAttendant.errorCreateCe Key: CES0005 Description: No Database Entries found for the specified criteria TrackingId: ATLAS_09d583dc-e55a-2574-7862-ff14fe6b9aed_2", 'error');
    });
  });
});
