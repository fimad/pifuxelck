import * as winston from 'winston';
import server from './fake-server';
import { agent } from 'supertest';
import { expect } from 'chai';
import { newUser } from './fake-user';

winston.remove(winston.transports.Console);

describe('Accounts', () => {
  describe('Registration', () => {
    it('should handle valid requests', async () => agent(await server())
        .post('/api/2/account/register')
        .send({user: {display_name: 'test', password: '12345678'}})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
            (res: any) =>
                expect(res.body).to.have.property('meta') &&
                expect(res.body.meta).to.have.property('auth')))

    it('should reject too short passwords', async () => agent(await server())
        .post('/api/2/account/register')
        .send({user: {display_name: 'test', password: '123'}})
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('meta')));

    it('should reject double registration', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({user: {display_name: 'test', password: '12345678'}})
          .expect(200);
      await app.post('/api/2/account/register')
          .send({user: {display_name: 'test', password: 'abcdefgh'}})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });
  });

  describe('Login', () => {
    it('should allow valid logins', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({user: {display_name: 'test', password: '12345678'}})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'test', password: '12345678'}})
          .expect(200)
          .expect(
              (res: any) =>
                  expect(res.body).to.have.property('meta') &&
                  expect(res.body.meta).to.have.property('auth'));
    });

    it('should deny invalid passwords', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({user: {display_name: 'test', password: '12345678'}})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'test', password: '1234567'}})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });

    it('should deny invalid users', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({user: {display_name: 'test', password: '12345678'}})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'not-valid', password: '12345678'}})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('meta'));
    });
  });

  describe('Update Password', () => {
    it('should allow password changes', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      await user.put('/api/2/account')
          .send({user: {password: 'abcdefgh'}})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'user', password: '12345678'}})
          .expect(500);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'user', password: 'abcdefgh'}})
          .expect(200);
    });

    it('should not allow changing other user\'s password', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      const user2 = await newUser(app, 'user2');
      await user.put('/api/2/account')
          .send({user: {id: '2', display_name: 'user2', password: 'abcdefgh'}})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({user: {display_name: 'user2', password: 'abcdefgh'}})
          .expect(500);
    });

    it('should not allow changing password when logged out', async () => {
      const app = agent(await server());
      const user = await newUser(app, 'user');
      await app.put('/api/2/account')
          .send({user: {password: 'abcdefgh'}})
          .expect(500);
    });
  });
});
