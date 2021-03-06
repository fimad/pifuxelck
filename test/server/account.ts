import { expect } from 'chai';
import { agent } from 'supertest';

import server from './fake-server';
import { newUser } from './fake-user';

describe('Accounts', () => {
  describe('Registration', () => {
    it('should handle valid requests', async () =>
      agent(await server())
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res: any) =>
            expect(res.body).to.have.property('meta') &&
            expect(res.body.meta).to.have.property('auth')
        ));

    it('should reject too short passwords', async () =>
      agent(await server())
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '123' } })
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('meta')));

    it('should reject double registration', async () => {
      const app = agent(await server());
      await app
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect(200);
      await app
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: 'abcdefgh' } })
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });
  });

  describe('Login', () => {
    it('should allow valid logins', async () => {
      const app = agent(await server());
      await app
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect(200);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect(200)
        .expect(
          (res: any) =>
            expect(res.body).to.have.property('meta') &&
            expect(res.body.meta).to.have.property('auth')
        );
    });

    it('should deny invalid passwords', async () => {
      const app = agent(await server());
      await app
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect(200);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'test', password: '1234567' } })
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });

    it('should deny invalid users', async () => {
      const app = agent(await server());
      await app
        .post('/api/2/account/register')
        .send({ user: { display_name: 'test', password: '12345678' } })
        .expect(200);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'not-valid', password: '12345678' } })
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });
  });

  describe('Update Password', () => {
    it('should allow password changes', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      await user
        .put('/api/2/account')
        .send({ user: { password: 'abcdefgh' } })
        .expect(200);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'user', password: '12345678' } })
        .expect(500);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'user', password: 'abcdefgh' } })
        .expect(200);
    });

    it("should not allow changing other user's password", async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      const user2 = await newUser(app, 'user2');
      await user
        .put('/api/2/account')
        .send({
          user: { id: '2', display_name: 'user2', password: 'abcdefgh' },
        })
        .expect(200);
      await app
        .post('/api/2/account/login')
        .send({ user: { display_name: 'user2', password: 'abcdefgh' } })
        .expect(500);
    });

    it('should not allow changing password when logged out', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      await app
        .put('/api/2/account')
        .send({ user: { password: 'abcdefgh' } })
        .expect(500);
    });

    it('should not change email when changing password', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user', undefined, 'user@example.com');
      await user
        .put('/api/2/account')
        .send({ user: { password: 'abcdefgh' } })
        .expect(200);
      await user
        .get('/api/2/account')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            user: {
              display_name: 'user',
              email: 'user@example.com',
              id: 1,
            },
          })
        );
    });
  });

  describe('Invalid auth token', () => {
    it('should have an error message', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      await app
        .get('/api/2/games')
        .set('x-pifuxelck-auth', 'invalid-token')
        .expect(500)
        .expect((res: any) => {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('auth');
        });
    });
  });

  describe('Email', () => {
    it('should successfully update and retrieve email', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user', undefined, 'user@example.com');
      await user
        .get('/api/2/account')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            user: {
              display_name: 'user',
              email: 'user@example.com',
              id: 1,
            },
          })
        );
    });

    it('should allow removing email', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user', undefined, 'user@example.com');
      await user
        .put('/api/2/account')
        .send({ user: { email: '' } })
        .expect(200);
      await user
        .get('/api/2/account')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            user: {
              display_name: 'user',
              email: '',
              id: 1,
            },
          })
        );
    });
  });
});
