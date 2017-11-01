import * as winston from 'winston';
import server from './fake-server';
import { agent } from 'supertest';
import { expect } from 'chai';

winston.remove(winston.transports.Console);

describe('Accounts', () => {
  describe('Registration', () => {
    it('should handle valid requests', async () => agent(await server())
        .post('/api/2/account/register')
        .send({display_name: 'test', password: '12345678'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res: any) => expect(res.body).to.have.property('auth')))

    it('should reject too short passwords', async () => agent(await server())
        .post('/api/2/account/register')
        .send({display_name: 'test', password: '123'})
        .expect(500)
        .expect((res: any) => expect(res.body).to.not.have.property('auth')));

    it('should reject double registration', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({display_name: 'test', password: '12345678'})
          .expect(200);
      await app.post('/api/2/account/register')
          .send({display_name: 'test', password: 'abcdefgh'})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('auth'));
    });
  });

  describe('Login', () => {
    it('should allow valid logins', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({display_name: 'test', password: '12345678'})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({display_name: 'test', password: '12345678'})
          .expect(200)
          .expect((res: any) => expect(res.body).to.have.property('auth'));
    });

    it('should deny invalid passwords', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({display_name: 'test', password: '12345678'})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({display_name: 'test', password: '1234567'})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('auth'));
    });

    it('should deny invalid users', async () => {
      const app = agent(await server());
      await app.post('/api/2/account/register')
          .send({display_name: 'test', password: '12345678'})
          .expect(200);
      await app.post('/api/2/account/login')
          .send({display_name: 'not-valid', password: '12345678'})
          .expect(500)
          .expect((res: any) => expect(res.body).to.not.have.property('auth'));
    });
  });
});
