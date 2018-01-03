import Feature from './feature.model';

export default class OnboardService {
  public huronCallEntitlement = false;
  public usersToOnboard = [];
  public maxUsersInManual = 25;

  /* @ngInject */
  constructor(
  ) {
  }

  // TODO: add TS types
  // email validation logic
  public validateEmail(input): boolean {
    const emailregex = /\S+@\S+\.\S+/;
    const emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
    const emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
    let valid = false;

    if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
      valid = true;
    } else if (/["]/.test(input) && emailregexquotes.test(input)) {
      valid = true;
    } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
      valid = true;
    }

    return valid;
  }

  // TODO: add TS types
  public mergeMultipleLicenseSubscriptions(fetched) {
    // Construct a mapping from License to (array of) Service object(s)
    const services = fetched.reduce(function (object, serviceObj) {
      const key = serviceObj.license.licenseType;
      if (key in object) {
        object[key].push(serviceObj);
      } else {
        object[key] = [serviceObj];
      }
      return object;
    }, {});

    // Merge all services with the same License into a single serviceObj
    return _.values(services).map(function (array: any) {
      const result = {
        licenses: [],
      };
      array.forEach(function (serviceObj) {
        const copy = _.cloneDeep(serviceObj);
        copy.licenses = [copy.license];
        delete copy.license;
        _.mergeWith(result, copy, function (left, right) {
          if (_.isArray(left)) {
            return left.concat(right);
          }
        });
      });
      return result;
    });
  }

  // TODO: add TS types
  public getEntitlements(action, entitlements) {
    const result: any = [];
    _.forEach(entitlements, function (state: boolean, key: string) {
      if (state) {
        if (action === 'add' || action === 'entitle') {
          result.push(new Feature(key, state));
        }
      }
    });
    return result;
  }

  public isEmailAlreadyPresent(input: string) {
    const inputEmail = this.getEmailAddress(input).toLowerCase();
    if (inputEmail) {
      const userEmails = this.getTokenEmailArray();
      // TODO (mipark2): use _.find() here instead
      const userEmailsLower: any = [];
      for (let i = 0; i < userEmails.length; i++) {
        userEmailsLower[i] = userEmails[i].toLowerCase();
      }
      return userEmailsLower.indexOf(inputEmail) >= 0;
    } else {
      return false;
    }
  }

  private getTokenEmailArray() {
    const tokens = (angular.element('#usersfield') as any).tokenfield('getTokens');
    return tokens.map((token) => {
      return this.getEmailAddress(token.value);
    });
  }

  private getEmailAddress(input: string) {
    let retString = '';
    input.split(' ').forEach(function (str) {
      if (str.indexOf('@') >= 0) {
        retString = str;
      }
    });
    return retString;
  }
}
