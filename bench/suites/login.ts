import { login, newUser } from '../../test/server/fake-user';
import { measure, suite } from '../lib';
import { appWithRealData } from '../utils';

const options = {
  maxTime: Number.MAX_VALUE,
  sharedSetup: true,
  targetTestCount: 10,
  skipCount: 1,
};

export default suite(
  'Login',

  measure(
    'Fetch Account',
    async () => {
      const app = await appWithRealData();
      const user = await login(app, 'will', '12345678');
      return async () => {
        await user.get('/api/2/account').expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Fetch Contacts',
    async () => {
      const app = await appWithRealData();
      const user = await login(app, 'will', '12345678');
      return async () => {
        await user.get('/api/2/contacts').expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Fetch Inbox',
    async () => {
      const app = await appWithRealData();
      const user = await login(app, 'will', '12345678');
      return async () => {
        await user.get('/api/2/games/inbox').expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Fetch Summary',
    async () => {
      const app = await appWithRealData();
      const user = await login(app, 'will', '12345678');
      return async () => {
        await user.get('/api/2/games/summary').expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Login and Fetch Data (Concurrent)',
    async () => {
      const app = await appWithRealData();
      return async () => {
        const user = await login(app, 'will', '12345678');
        await Promise.all([
          user.get('/api/2/account').expect(200),
          user.get('/api/2/contacts').expect(200),
          user.get('/api/2/games/inbox').expect(200),
          user.get('/api/2/games/summary').expect(200),
        ]);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Login and Fetch Data (Serial)',
    async () => {
      const app = await appWithRealData();
      return async () => {
        const user = await login(app, 'will', '12345678');
        await user.get('/api/2/account').expect(200);
        await user.get('/api/2/contacts').expect(200);
        await user.get('/api/2/games/inbox').expect(200);
        await user.get('/api/2/games/summary').expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Login and Fetch Data (One Query)',
    async () => {
      const app = await appWithRealData();
      return async () => {
        const user = await login(app, 'will', '12345678');
        await user.get('/api/2/everything').expect(200);
      };
    },
    {
      ...options,
    }
  )
);
