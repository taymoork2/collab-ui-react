'use strict';

describe('Service: CsdmCacheUpdaterSpec', function () {
  beforeEach(module('wx2AdminWebClientApp'));

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

    Updater.addUpdateAndRemove(a, b);
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

    Updater.addUpdateAndRemove(a, b);

    expect(a.foo == aRef).toBeFalsy();
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

    Updater.addUpdateAndRemove(a, b);

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

    Updater.addUpdateAndRemove(a, b);

    expect(a.foo == aRef).toBeTruthy();
    expect(a.bar).toBeFalsy();
  });

  it('should update changed collections where only order differs', function () {
    // this test really indicates a weakness of the current impl.
    var a = {
      foo: {
        b: 1,
        a: 1
      }
    };
    var b = {
      foo: {
        a: 1,
        b: 1
      }
    };
    var aRef = a.foo;

    Updater.addUpdateAndRemove(a, b);

    expect(a.foo == aRef).toBeFalsy();
  });

});
