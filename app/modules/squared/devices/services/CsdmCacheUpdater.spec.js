'use strict';

describe('Service: CsdmCacheUpdaterSpec', function () {
  beforeEach(angular.mock.module('Squared'));

  var Updater;

  beforeEach(inject(function (CsdmCacheUpdater) {
    Updater = CsdmCacheUpdater;
  }));

  it('keep object reference for unchanged collections', function () {
    var a = {
      foo: {
        a: 1
      }
    };
    var b = {
      foo: {
        a: 1
      }
    };

    var aRef = a.foo;

    Updater.update(a, b);
    expect(a.foo == aRef).toBeTruthy();
    expect(a.foo.a).toBe(1);
  });

  it('should update when props are changed', function () {
    var a = {
      foo: {
        a: 1
      }
    };
    var b = {
      foo: {
        a: 2
      }
    };
    var aRef = a.foo;

    Updater.update(a, b);

    expect(a.foo == aRef).toBeTruthy();
    expect(a.foo.a).toBe(2);
  });

  it('should update when objs are added', function () {
    var a = {
      foo: {
        a: 1
      }
    };
    var b = {
      foo: {
        a: 1
      },
      bar: {}
    };
    var aRef = a.foo;

    Updater.update(a, b);

    expect(a.foo == aRef).toBeTruthy();
    expect(a.bar).toBeTruthy();
  });

  it('should update when objs are removed', function () {
    var a = {
      foo: {
        a: 1
      },
      bar: {}
    };
    var b = {
      foo: {
        a: 1
      }
    };
    var aRef = a.foo;

    Updater.update(a, b);

    expect(a.foo == aRef).toBeTruthy();
    expect(a.bar).toBeFalsy();
  });

});
