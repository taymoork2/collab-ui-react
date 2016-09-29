/**
 * Created by snzheng on 16/9/20.
 */
/**
 * Created by pso on 16-8-23.
 */

'use strict';

describe('Message service', function () {
  //var $httpBackend;
  var MessageService;
  //var getNoSiteURL = 'https://statusbts.webex.com/status/services/101/incidents';
  // var mockData = [{}];
  function dependencies(_MessageService_) {
    //  $httpBackend = _$httpBackend_;
    MessageService = _MessageService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(MessageService).toBeDefined();
  });
  it('Should getIncidentMsg', function () {
    MessageService.query({ messageId: 509 }).$promise.then(function (data) {
      expect(data).not.toBeEmpty();
    });
  });
  it('should modify successfully', function () {
    MessageService.modifyMsg({ messageId: 509 }, { postAt: "2016-09-21T01:02:00Z", email: "chaoluo@ciscoc.com", message: "hikhhkk" }).$promise.then(function (data) {
      expect(data).not.toBeEmpty();
    }, function () {
    });
  });
});
