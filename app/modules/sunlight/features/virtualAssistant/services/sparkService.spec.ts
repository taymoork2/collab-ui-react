
function createSparkResponseMockObject(responseData) {
  return {
    body: responseData,
    headers: {
      link: null, // used in PAGE object instantiation
    },
  };
}

describe('Care Spark Service', function () {
  let sdkRequestDeferred;
  let requestSpy;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(function() {
    this.injectDependencies(
      'SparkService',
      '$q',
      '$rootScope',
    );
    sdkRequestDeferred = this.$q.defer();
    requestSpy = jasmine.createSpy('request');
    const spiedSparkSDK = {
      request: requestSpy.and.callFake(function () {
        return sdkRequestDeferred.promise;
      }),
    };
    spyOn(this.SparkService, 'sdk').and.callFake(function () {
      return spiedSparkSDK;
    });
  });

  it('getPerson Success', function () {
    const expectedResult = { id: 'HERE I AM' };
    sdkRequestDeferred.resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.getPerson('me').then(function (user) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'people/me' }));
      expect(user['id']).toBe(expectedResult['id']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('getPersonByEmail Success', function () {
    const email = 'me@sparkbot.io';
    const expectedResult = { items: [ 'abc@sparkbot.io' ] };
    sdkRequestDeferred.resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.getPersonByEmail(email).then(function (existingEmails) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: `people/?email=${email}` }));
      expect(existingEmails['items']).toBe(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listMemberships Success', function () {
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred.resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listMemberships().then(function (memberships) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'memberships' }));
      expect(memberships['items']).toBe(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listRooms Success', function () {
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred.resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listRooms().then(function (rooms) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'rooms' }));
      expect(rooms['items']).toBe(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listRoomMemberships Success', function () {
    const roomId = 'HI';
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred.resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listRoomMemberships(roomId).then(function (memberships) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'memberships', qs: { roomId: roomId } }));
      expect(memberships['items']).toBe(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('getPerson Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred.reject(expectedError);
    this.SparkService.getPerson('me').then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('getPersonByEmail Failure', function () {
    const email = 'me@sparkbot.io';
    const expectedError = new Error('OOPS');
    sdkRequestDeferred.reject(expectedError);
    this.SparkService.getPersonByEmail(email).then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('listMemberships Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred.reject(expectedError);
    this.SparkService.listMemberships().then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('listRooms Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred.reject(expectedError);
    this.SparkService.listRooms().then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('listRoomMemberships Failure', function () {
    const roomId = 'HI';
    const expectedError = new Error('OOPS');
    sdkRequestDeferred.reject(expectedError);
    this.SparkService.listRoomMemberships(roomId).then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });
});
