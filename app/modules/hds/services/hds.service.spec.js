'use strict';

describe('Service: HDSService', function () {
  var HDSService, $q;

  beforeEach(angular.mock.module('HDS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));
  function dependencies(_HDSService_, _$q_) {
    HDSService = _HDSService_;
    $q = _$q_;
  }

  function mockDependencies($provide) {
    var response = {
      data: {
        orgSettings: {
          kmsServer: 'kms1',
        },
      },
    };
    $provide.value('Orgservice', {
      getOrg: function () {
        return $q.resolve(response);
      },
    });
  }

  it('getOrgSettings should return org settings when successfull', function () {
    var promise = HDSService.getOrgSettings();
    promise.then(function (result) {
      expect(result.kmsServer).toEqual({ kmsServer: 'kms1' });
    });
  });

});
