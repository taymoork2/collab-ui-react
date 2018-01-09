import {
  IRHtmBuildingBlocks, HtmBuildingBlocks,
  IRHtmCustomer, HtmCustomer,
  IRHtmResource, HtmResource,
  IRHtmTestResults,
  IRHtmSchedule, HtmSchedule,
  IRHtmTest, HtmTest,
  IRHtmSuite, HtmSuite,
  IRHtmTestDefinition, HtmTestDefinition,
  SETUP_NOT_COMPLETE, SETUP_COMPLETE,
} from './task-manager.const';

//export const TAAS_ADDRESS: string = 'http://10.201.82.158:8082'; //Matt's Server
export const TAAS_ADDRESS: string = 'http://rcdn6-vm81-32.cisco.com:8082';
//CRUD Resources
export const PATH_RESOURCE: string = '/api/v1/customers/:customerId/resources/:resourceId';
//Read Test Building Blocks
export const PATH_BUILDINGBLOCKS: string = '/api/v1/buildingblocks';
//CRUD Suites
export const PATH_SUITES: string = '/api/v1/customers/:customerId/suites/:suiteId';
//CRUD Tests
export const PATH_TESTS: string = '/api/v1/customers/:customerId/suites/:suiteId/tests/:testId';
//CRUD Schedules
export const PATH_SCHEDULES: string = '/api/v1/customers/:customerId/schedules/:scheduleId';
//Read Test Results
export const PATH_TESTRESULTS: string = '/api/v1/customers/:customerId/tests/:testId/results';
//CRUD Test Definitions
export const PATH_TESTDEFS: string = '/api/v1/customers/:customerId/testdefinitions/:testdefinitionsId';
//CRU Customers
export const PATH_CUSTOMERS: string = '/api/v1/customers/:customerId';
// R Test Definitions
export const PATH_TESTDEFINITIONS: string = '/api/v1/customers/:customerId/testdefinitions/:testdefinitionsId';

//Temp: always use this customer ID
//const CUSTOMER_ID: string = 'c7504886-2ffd-4f49-a81c-9ce23e1ba8ae'; //Customer Joe

interface IResource<T> extends ng.resource.IResourceClass<T & ng.resource.IResource<T>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

const LOCATION_HEADER = 'Location';

const saveAction: ng.resource.IActionDescriptor = {
  method: 'POST',
  headers: {
    'Access-Control-Expose-Headers': 'Location',
  },
};

const updateAction: ng.resource.IActionDescriptor = {
  method: 'PUT',
};

export class TaskManagerService {
  private customerId: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
  ) {
    this.customerId = this.Authinfo.getOrgId();
  }

//Blocks
  public getBlocks(): ng.IPromise<IRHtmBuildingBlocks[]> {
    const resource = <IResource<IRHtmBuildingBlocks>>this.$resource(`${TAAS_ADDRESS}${PATH_BUILDINGBLOCKS}`);
    return resource.query({}).$promise.then((rblocks: IRHtmBuildingBlocks[]) => {
      const blocks: HtmBuildingBlocks[] = [];
      if (!_.isEmpty(rblocks)) {
        for (let i: number = 0; i < rblocks.length; i++) {
          blocks.push(new HtmBuildingBlocks(rblocks[i]));
        }
      }
      return blocks;
    });
  }

//Customers
  public getCustomers(): ng.IPromise<HtmCustomer[]> {
    const resource = <IResource<IRHtmCustomer>>this.$resource(`${TAAS_ADDRESS}${PATH_CUSTOMERS}`);
    return resource.query({}).$promise.then((rcustomers: IRHtmCustomer[]) => {
      const customers: HtmCustomer[] = [];
      if (_.isArray(rcustomers)) {
        for (let i: number = 0; i < rcustomers.length; i++) {
          customers.push(new HtmCustomer(rcustomers[i]));
        }
      }
      return customers;
    });
  }

//Resources
  public createResource(resource: HtmResource): ng.IPromise<string> {
    if (_.isEmpty(resource)) {
      return this.$q.reject();
    }
    return this.$q.resolve(
      resource.name + 'adfasdfadf',
    );
  }

  public getResource(htmResource: HtmResource): ng.IPromise<HtmResource> {
    if (_.isEmpty(htmResource)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmResource>>this.$resource(`${TAAS_ADDRESS}${PATH_RESOURCE}`);
    return resource.get({
      customerId: this.customerId,
      resourceId: htmResource.id,
    }).$promise.then((rresource: IRHtmResource) => new HtmResource(rresource));
  }

  public getResources(): ng.IPromise<HtmResource[]> {
    const resource = <IResource<IRHtmResource>>this.$resource(`${TAAS_ADDRESS}${PATH_RESOURCE}`);
    return resource.query({
      customerId: this.customerId,
    }).$promise.then((rresources: IRHtmResource[]) => {
      for (let i: number = 0; i < rresources.length; i++) {
        rresources[i].param = JSON.parse(<string>rresources[i].param);
      }
      const resources: HtmResource[] = [];
      for (let i: number = 0; i < rresources.length; i++) {
        resources.push(new HtmResource(rresources[i]));
      }
      return _.sortBy(resources, (resource) => resource.type + resource.name);
    }).catch(error => {
      return this.$q.reject(error);
    });
  }

  public setResource(resource: HtmResource): ng.IPromise<void> {
    if (_.isEmpty(resource)) {
      return this.$q.reject();
    }
    return this.$q.resolve();
  }

  public deleteResource(resource: HtmResource): ng.IPromise<void> {
    if (_.isEmpty(resource)) {
      return this.$q.reject();
    }
    return this.$q.resolve();
  }

//Results;
  public getResults(): ng.IPromise<IRHtmTestResults[]> {
    return this.$q.resolve(
      [] as IRHtmTestResults[],
    );
  }

//Schedules
  public createSchedule(schedule: HtmSchedule): ng.IPromise<string> {
    let scheduleId: string;
    if (_.isEmpty(schedule)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmSchedule>>this.$resource(`${TAAS_ADDRESS}${PATH_SCHEDULES}`, {}, { save: saveAction });
    return resource.save({
      customerId: this.customerId,
    }, schedule.getRSchedule(),
    (_response, headers) => {
      const locationHeader = headers(LOCATION_HEADER);
      scheduleId = _.last(locationHeader.split('/'));
    }).$promise
    .then(() => scheduleId);
  }

  public getSchedule(schedule: HtmSchedule): ng.IPromise<HtmSchedule> {
    if (_.isEmpty(schedule)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmSchedule>>this.$resource(`${TAAS_ADDRESS}${PATH_SCHEDULES}`);
    return resource.get({
      customerId: this.customerId,
      scheduleId: schedule.id,
    }).$promise.then((rschedule: IRHtmSchedule) => new HtmSchedule(rschedule));
  }

  public getSchedules(): ng.IPromise<HtmSchedule[]> {
    let isSuites: boolean = false;
    const resource = <IResource<IRHtmSchedule>>this.$resource(`${TAAS_ADDRESS}${PATH_SCHEDULES}`);
    return resource.query({
      customerId: this.customerId,
    }).$promise.then((rschedules: IRHtmSchedule[]) => {
      const promises: ng.IPromise<any>[] = [];
      const schedules: HtmSchedule[] = [];
      for (let i: number = 0; i < rschedules.length; i++) {
        const schedule: HtmSchedule = new HtmSchedule(rschedules[i]);
        schedules.push(schedule);
        //Get More Information
        promises.push(this.getSchedule(schedule).then(htmSchedule => {
          if (!_.isEmpty(htmSchedule.testSuiteMap)) {
            isSuites = true;
            schedule.testSuiteMap = htmSchedule.testSuiteMap;
          }
          if (!_.isEmpty(htmSchedule.testMap)) {
            schedule.testMap = htmSchedule.testMap;
          }
        }));
      }
      if (promises.length > 0) {
        return this.$q.all(promises).then(() => schedules);
      }
      return schedules;
    }).then(htmSchedules => {
      if (!isSuites) {
        return htmSchedules;
      }
      return this.getSuites().then(htmSuites => {
        for (let i: number = 0; i < htmSchedules.length; i++) {
          for (let j: number = 0; j < htmSchedules[i].testSuiteMap.length; j++) {
            const suiteId: string = htmSchedules[i].testSuiteMap[j].testsuiteId;
            const suite: HtmSuite = _.find(htmSuites, htmSuite => {
              return htmSuite.id === suiteId;
            });
            if (suite) {
              htmSchedules[i].scheduleEntities += suite.name;
              if (j + 1 < htmSchedules[i].testSuiteMap.length) {
                htmSchedules[i].scheduleEntities += ', ';
              }
            }
          }
        }
        return htmSchedules;
      });
    });
  }

  public setSchedule(schedule: HtmSchedule): ng.IPromise<void> {
    if (_.isEmpty(schedule)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmSchedule>>this.$resource(`${TAAS_ADDRESS}${PATH_SCHEDULES}`, {}, { update: updateAction });
    return resource.update({
      customerId: this.customerId,
      scheduleId: schedule.id,
    }, schedule.getRSchedule()).$promise;
  }

  public deleteSchedule(schedule: HtmSchedule): ng.IPromise<void> {
    if (_.isEmpty(schedule)) {
      return this.$q.reject();
    }
    return this.$q.resolve();
  }

//Test Definitions
  public getTestDefinition(testDefinition: HtmTestDefinition): ng.IPromise<HtmTestDefinition> {
    const resource = <IResource<IRHtmTestDefinition>>this.$resource(`${TAAS_ADDRESS}${PATH_TESTDEFS}`);
    return resource.get({
      customerId: this.customerId,
      testdefinitionsId: testDefinition.id,
    }).$promise.then((rtestDefinition: IRHtmTestDefinition) => new HtmTestDefinition(rtestDefinition));
  }


 //Suites
  public createSuite(suite: HtmSuite): ng.IPromise<string> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    let suiteId: string;
    const resource = <IResource<IRHtmSuite>>this.$resource(`${TAAS_ADDRESS}${PATH_SUITES}`, {}, { save: saveAction });
    return resource.save({
      customerId: this.customerId,
    }, suite.getRSuite(),
    (_response, headers) => {
      const locationHeader = headers(LOCATION_HEADER);
      suiteId = _.last(locationHeader.split('/'));
    }).$promise
    .then(() => suiteId);
  }

  public getSuite(suite: IRHtmSuite): ng.IPromise<HtmSuite> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmSuite>>this.$resource(`${TAAS_ADDRESS}${PATH_SUITES}`);
    return resource.get({
      customerId: this.customerId,
      suiteId: suite.id,
    }).$promise.then((rsuite: IRHtmSuite) => new HtmSuite(rsuite));
  }

  public getSuites(): ng.IPromise<HtmSuite[]> {
    const resource = <IResource<IRHtmSuite>>this.$resource(`${TAAS_ADDRESS}${PATH_SUITES}`);
    return resource.query({
      customerId: this.customerId,
    }).$promise
    .then((rsuites: IRHtmSuite[]) => {
      const suites: HtmSuite[] = [];
      for (let i: number = 0; i < rsuites.length; i++) {
        suites.push(new HtmSuite(rsuites[i]));
      }
      //TODO: REMOVE - Get all tests until API returns tests
      const promises: ng.IPromise<any>[] = [];
      for (let i: number = 0; i < suites.length; i++) {
        promises.push(this.getTests(suites[i]).then(tests => {
          suites[i].tests = tests;
        }));
      }
      if (promises.length) {
        return this.$q.all(promises).then(() => suites);
      }
      return suites;
    });
  }

  public setSuite(suite: HtmSuite): ng.IPromise<void> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmSuite>>this.$resource(`${TAAS_ADDRESS}${PATH_SUITES}`, {}, { update: updateAction });
    return resource.update({
      customerId: this.customerId,
      suiteId: suite.id,
    }, suite.getRSuite()).$promise;
  }

  public deleteSuite(suite: HtmSuite): ng.IPromise<void> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    const resource = this.$resource(`${TAAS_ADDRESS}${PATH_SUITES}`);
    return resource.delete({
      customerId: this.customerId,
      suiteId: suite.id,
    }).$promise;
  }

 //Tests
  public createTest(suite: HtmSuite, test: HtmTest): ng.IPromise<string> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    if (_.isEmpty(test)) {
      return this.$q.reject();
    }
    let testId: string;
    const resource = <IResource<IRHtmSchedule>>this.$resource(`${TAAS_ADDRESS}${PATH_TESTS}`, {}, { save: saveAction });
    return resource.save({
      customerId: this.customerId,
      suiteId: suite.id,
    }, test.getRTest(),
    (_response, headers) => {
      const locationHeader = headers(LOCATION_HEADER);
      testId = _.last(locationHeader.split('/'));
    }).$promise
    .then(() => testId);
  }

  public getTest(suite: HtmSuite, test: HtmTest): ng.IPromise<HtmTest> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    if (_.isEmpty(test)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmTest>>this.$resource(`${TAAS_ADDRESS}${PATH_TESTS}`);
    return resource.get({
      customerId: this.customerId,
      suiteId: suite.id,
      testId: test.id,
      // Implement getBlocks
    }).$promise.then(rtest => new HtmTest(rtest));
  }

  public getTests(suite: HtmSuite): ng.IPromise<HtmTest[]> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmTest>>this.$resource(`${TAAS_ADDRESS}${PATH_TESTS}`);
    return resource.query({
      customerId: this.customerId,
      suiteId: suite.id,
    }).$promise.then(rtests => {
      const tests: HtmTest[] = [];
      for (let i: number = 0; i < rtests.length; i++) {
        tests.push(new HtmTest(rtests[i]));
      }
      return tests;
    });
  }

  public setTest(suite: HtmSuite, test: HtmTest): ng.IPromise<void> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    if (_.isEmpty(test)) {
      return this.$q.reject();
    }
    const resource = <IResource<IRHtmTest>>this.$resource(`${TAAS_ADDRESS}${PATH_TESTS}`, {}, { update: updateAction });
    return resource.update({
      customerId: this.customerId,
      suiteId: suite.id,
      testId: test.id,
    }, test.getRTest()).$promise;
  }

  public deleteTest(suite: HtmSuite, test: HtmTest): ng.IPromise<void> {
    if (_.isEmpty(suite)) {
      return this.$q.reject();
    }
    if (_.isEmpty(test)) {
      return this.$q.reject();
    }
    const resource = this.$resource(`${TAAS_ADDRESS}${PATH_TESTS}`);
    return resource.delete({
      customerId: this.customerId,
      suiteId: suite.id,
      testId: test.id,
    }).$promise;
  }

  public filterSuites(suite: HtmSuite[], filterText: string): HtmSuite[] {
    if (_.isEmpty(filterText)) {
      return suite;
    }
    return _.filter(suite, filteredSuite => {
      return filteredSuite.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
  }

  public filterTests(test: HtmTest[], filterText: string): HtmTest[] {
    if (_.isEmpty(filterText)) {
      return test;
    }
    return _.filter(test, filteredTest => {
      return filteredTest.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
  }

  public getServiceStatus(serviceId): ng.IPromise<any> {
    return this.getSuites()
    .then((suites: HtmSuite[]) => {
      if (suites.length > 0) {
        //Search for at least one defined Test
        let testFound: boolean = false;
        for (let i: number = 0; i < suites.length; i++) {
          if (!_.isEmpty(suites[i].tests)) {
            testFound = true;
            break;
          }
        }
        if (testFound) {
          //At least one Suite and one Test found
          const serviceOptions = _.cloneDeep(SETUP_COMPLETE);
          serviceOptions.serviceId = serviceId;
          return serviceOptions;
        } else {
          //No Tests defined
          const serviceOptions = _.cloneDeep(SETUP_NOT_COMPLETE);
          serviceOptions.serviceId = serviceId;
          serviceOptions.setup = true;
          return serviceOptions;
        }
      } else {
        //No Suites returned
        const serviceOptions = _.cloneDeep(SETUP_NOT_COMPLETE);
        serviceOptions.serviceId = serviceId;
        return serviceOptions;
      }
    })
    .catch(() => {
      //Suites API failed
      const serviceOptions = _.cloneDeep(SETUP_NOT_COMPLETE);
      serviceOptions.serviceId = serviceId;
      return serviceOptions;
    });
  }

}
