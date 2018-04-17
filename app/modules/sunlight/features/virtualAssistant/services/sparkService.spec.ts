
function createSparkResponseMockObject(responseData) {
  return {
    body: responseData,
    headers: {
      link: null, // used in PAGE object instantiation
    },
  };
}

describe('Care Spark Service', function () {
  let requestSpyCall = 0;
  let sdkRequestDeferred;
  let requestSpy;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(function() {
    this.injectDependencies(
      'SparkService',
      '$q',
      '$rootScope',
    );
    requestSpyCall = 0;
    sdkRequestDeferred = [this.$q.defer(), this.$q.defer()];
    requestSpy = jasmine.createSpy('request');
    const spiedSparkSDK = {
      request: requestSpy.and.callFake(function () {
        const index = requestSpyCall;
        requestSpyCall += 1;
        return sdkRequestDeferred[index].promise;
      }),
    };
    spyOn(this.SparkService, 'sdk').and.callFake(function () {
      return spiedSparkSDK;
    });
  });

  it('getPerson Success', function () {
    const expectedResult = { id: 'HERE I AM' };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.getPerson('me').then(function (user) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'people/me' }));
      expect(user['id']).toEqual(expectedResult['id']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listPeopleByIds 4 elements should Success', function () {
    const peopleIds = ['1', '2,', '3', '4'];
    const expectedResult = { items: peopleIds };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listPeopleByIds(peopleIds).then(function (peoples) {
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: `people?id=${peopleIds.join(',')}` }));
      expect(peoples).toEqual(expectedResult);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listPeopleByIds 0 elements Success', function () {
    const peopleIds = [];
    const expectedResult = { items: peopleIds };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listPeopleByIds(peopleIds).then(function (peoples) {
      expect(requestSpy).not.toHaveBeenCalled();
      expect(peoples).toEqual(expectedResult);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listPeopleByIds 100 elements 2 chunked calls should success', function () {
    const numIds = 100;
    const peopleIds = Array.apply(null, { length: numIds }).map(Function.call, () => String(Math.random()));
    const expectedResults = [{ items: peopleIds.slice(0, 80) }, { items: peopleIds.slice(80, numIds) }];
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResults[0]));
    sdkRequestDeferred[1].resolve(createSparkResponseMockObject(expectedResults[1]));
    this.SparkService.listPeopleByIds(peopleIds).then(function (peoples) {
      expect(requestSpyCall).toEqual(2);
      expect(peoples.items.length).toEqual(numIds);
      expect(peoples.items).toEqual(peopleIds);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('getPersonByEmail Success', function () {
    const email = 'me@sparkbot.io';
    const expectedResult = { items: [ 'abc@sparkbot.io' ] };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.getPersonByEmail(email).then(function (existingEmails) {
      expect(requestSpyCall).toEqual(1);
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: `people/?email=${email}` }));
      expect(existingEmails['items']).toEqual(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listMemberships Success', function () {
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listMemberships().then(function (memberships) {
      expect(requestSpyCall).toEqual(1);
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'memberships' }));
      expect(memberships['items']).toEqual(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listRooms Success', function () {
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listRooms().then(function (rooms) {
      expect(requestSpyCall).toEqual(1);
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'rooms' }));
      expect(rooms['items']).toEqual(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('listRoomMemberships Success', function () {
    const roomId = 'HI';
    const expectedResult = { items: [{ id: 'HERE I AM' }] };
    sdkRequestDeferred[0].resolve(createSparkResponseMockObject(expectedResult));
    this.SparkService.listRoomMemberships(roomId).then(function (memberships) {
      expect(requestSpyCall).toEqual(1);
      expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ resource: 'memberships', qs: { roomId: roomId } }));
      expect(memberships['items']).toEqual(expectedResult['items']);
    }).catch(function (error) {
      fail(error.message);
    });
    this.$rootScope.$apply();
  });

  it('getPerson Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred[0].reject(expectedError);
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
    sdkRequestDeferred[0].reject(expectedError);
    this.SparkService.getPersonByEmail(email).then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('listMemberships Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred[0].reject(expectedError);
    this.SparkService.listMemberships().then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });

  it('listRooms Failure', function () {
    const expectedError = new Error('OOPS');
    sdkRequestDeferred[0].reject(expectedError);
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
    sdkRequestDeferred[0].reject(expectedError);
    this.SparkService.listRoomMemberships(roomId).then(function () {
      fail('unexpected success. should have failed');
    }).catch(function (error) {
      expect(error.message).toContainText(expectedError.message);
    });
    this.$rootScope.$apply();
  });
});
