import * as winston from 'winston';
import server from './fake-server';
import { agent } from 'supertest';
import { expect } from 'chai';
import { newUser } from './fake-user';

// winston.remove(winston.transports.Console);

describe('Contacts', () => {
  describe('Lookup', () => {
    it('should reject unauthenticated queries', async () => {
      const app = agent(await server());
      await newUser(app, 'user1');
      await app.get('/api/2/contacts/lookup/user1')
          .expect(500);
    });

    it('should return empty for no matching user', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user1');
      await user.get('/api/2/contacts/lookup/invalid')
        .expect(200)
        .expect((res: any) => expect(res.body).to.be.empty);
    });

    it('should allow self lookups', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user1');
      await user.get('/api/2/contacts/lookup/user1')
        .expect(200)
        .expect((res: any) => expect(res.body).to.deep.equal({
          user: {
            display_name: 'user1',
            id: 1,
          },
        }));
    });

    it('should allow other user lookups', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1.get('/api/2/contacts/lookup/user2')
        .expect(200)
        .expect((res: any) => expect(res.body).to.deep.equal({
          user: {
            display_name: 'user2',
            id: 2,
          },
        }));
    });
  });
});
