import Spark, { Page } from '@ciscospark/spark-core';
import * as _ from 'lodash';

/**
 * Interfaces for Spark collections and Page object
 */
export interface ISparkCollection<T> {
  items: T[];
}

export interface ISparkPage<T> extends ISparkCollection<T> {
  next(): ISparkPage<T>; // loads next page of T
  hasNext(): boolean;
  previous(): ISparkPage<T>; // loads previous page of T
  hasPrevious(): boolean;
}

/**
 * Interfaces for spark objects:
 *    Person, Room, Membership
 */
export interface ISparkPerson {
  id: string;
  emails: string[];
  displayName: string;
  nickName: string;
  firstName: string;
  orgId: string;
  roles: string[];
  licenses: string[];
  created: string; // datetime string
  status: string;
  invitePending: boolean;
  loginEnabled: boolean;
  type: string;
}

export interface ISparkRoom {
  id: string;
  title: string;
  type: string;
  isLocked: boolean;
  lastActivity: string; // datetime string
  creatorId: string;
  created: string; // datetime string
}

export interface ISparkMembership {
  id: string;
  roomId: string;
  personId: string;
  personEmail: string;
  personDisplayName: string;
  personOrgId: string;
  isModerator: boolean;
  isMonitor: boolean;
  created: string; // datetime string
}


export class SparkService {

  private spark;

  /* @ngInject */
  constructor(
    private TokenService,
    private $q: ng.IQService,
  ) {
  }

  /**
   * lazily constructs and returns spark sdk
   * @returns {}
   */
  private sdk(): Spark {
    if (!this.spark) {
      this.spark = new Spark({
        credentials: {
          access_token: this.TokenService.getAccessToken(),
          refresh_token: this.TokenService.getRefreshToken(),
        },
      });
    }
    return this.spark;
  }

  /**
   * Cisco Spark API:  people.get(id)
   * @param {string} peopleId  actual personId or 'me'
   * @returns {angular.IPromise<ISparkPerson>}
   */
  public getPerson(peopleId: string): ng.IPromise<ISparkPerson> {
    return this.sdk().request({
      service: 'hydra',
      resource: 'people/' + peopleId,
    })
    .then(response => <ISparkPerson>response.body)
    .catch(error => {
      if (_.has(error, 'message')) {
        error.message = error.message + ': SparkService getPerson';
      }
      return this.$q.reject(error);
    });
  }

  /**
   * Cisco Spark API:  people.get(email)
   * @param {string} email
   * @returns {angular.IPromise<ISparkPerson>}
   */
  public getPersonByEmail(email: string): ng.IPromise<ISparkPerson> {
    return this.sdk().request({
      service: 'hydra',
      resource: `people/?email=${email}`,
    })
    .then(response => <ISparkPerson>response.body)
    .catch(error => {
      if (_.has(error, 'message')) {
        error.message = error.message + ': SparkService getPersonByEmail';
      }
      return this.$q.reject(error);
    });
  }

  /**
   * Cisco Spark API:  memberships.list
   * @returns {angular.IPromise<ISparkPage<ISparkMembership>>}
   */
  public listMemberships(): ng.IPromise<ISparkPage<ISparkMembership>> {
    return this.sdk().request({
      service: 'hydra',
      resource: 'memberships',
    })
    .then(response => <ISparkPage<ISparkMembership>>new Page(response, this.sdk()))
    .catch(error => {
      if (_.has(error, 'message')) {
        error.message = error.message + ': SparkService listMemberships';
      }
      return this.$q.reject(error);
    });
  }

  /**
   * Cisco Spark API:  rooms.list
   * @returns {angular.IPromise<ISparkPage<ISparkRoom>>}
   */
  public listRooms(): ng.IPromise<ISparkPage<ISparkRoom>> {
    return this.sdk().request({
      service: 'hydra',
      resource: 'rooms',
    })
    .then(response => <ISparkPage<ISparkRoom>>new Page(response, this.sdk()))
    .catch(error => {
      if (_.has(error, 'message')) {
        error.message = error.message + ': SparkService listRooms';
      }
      return this.$q.reject(error);
    });
  }

  /**
   * Cisco Spark API: memberships.list(roomId)
   * @param {string} roomId
   * @returns {angular.IPromise<ISparkPage<ISparkMembership>>}
   */
  public listRoomMemberships(roomId: string): ng.IPromise<ISparkPage<ISparkMembership>> {
    return this.sdk().request({
      service: 'hydra',
      resource: 'memberships',
      qs: {
        roomId: roomId,
      },
    })
    .then(response => <ISparkPage<ISparkMembership>>new Page(response, this.sdk()))
    .catch(error => {
      if (_.has(error, 'message')) {
        error.message = error.message + ': SparkService listRoomMemberships';
      }
      return this.$q.reject(error);
    });
  }
}
export default angular
  .module('Sunlight')
  .service('SparkService', SparkService)
  .name;
