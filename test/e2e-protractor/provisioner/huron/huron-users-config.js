import { partnerEmail } from './huron-customer-config';
import * as os from 'os';
const now = Date.now();

export function huronUsers(number, extensions, lines) {
  if (number) {
    number = number > 10 ? 10 : number;
    const users = [];
    const ext = extensions || '300';
    for (let i = 0; i < number; i++) {
      const user = usersData[i];
      user.email = `${partnerEmail}${user.name.givenName}${user.name.familyName}_${os.userInfo().username}_${now}@gmail.com`;
      user.callOptions = {};
      user.callOptions.internalExtension = (parseInt(ext, 10) + 10 + i).toString();
      if (lines && lines[i]) {
        user.callOptions.directLine = lines[i];
      }
      users.push(user);
    }
    return users;
  }
}

const usersData = [{
  name: {
    givenName: 'Sheev',
    familyName: 'Palpatine',
  },
}, {
  name: {
    givenName: 'Han',
    familyName: 'Solo',
  },
}, {
  name: {
    givenName: 'Obi-Wan',
    familyName: 'Kenobi',
  },
}, {
  name: {
    givenName: 'R2',
    familyName: 'D2',
  },
}, {
  name: {
    givenName: 'Luke',
    familyName: 'Skywalker',
  },
}, {
  name: {
    givenName: 'Master',
    familyName: 'Yoda',
  },
}, {
  name: {
    givenName: 'Lando',
    familyName: 'Calrissian',
  },
}, {
  name: {
    givenName: 'Jaba',
    familyName: 'theHutt',
  },
}, {
  name: {
    givenName: 'Chew',
    familyName: 'bacca',
  },
}, {
  name: {
    givenName: 'C',
    familyName: '3PO',
  },
}, {
  name: {
    givenName: 'Boba',
    familyName: 'Fett',
  },
}, {
  name: {
    givenName: 'Admiral',
    familyName: 'Ackbar',
  },
}, {
  name: {
    givenName: 'Mon',
    familyName: 'Mothma',
  },
}, {
  name: {
    givenName: 'Darth',
    familyName: 'Vader',
  },
}, {
  name: {
    givenName: 'GrandMoff',
    familyName: 'Tarkin',
  },
}, {
  name: {
    givenName: 'Admiral',
    familyName: 'Thrawn',
  },
}, {
  name: {
    givenName: 'Mara',
    familyName: 'Jade',
  },
}, {
  name: {
    givenName: 'Jyn',
    familyName: 'Erso',
  },
}, {
  name: {
    givenName: 'Princess',
    familyName: 'Leia',
  },
}, {
  name: {
    givenName: 'Padme',
    familyName: 'Amidala',
  },
}];
