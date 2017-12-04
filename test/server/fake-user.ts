import { SuperTest, Test } from 'supertest';

export default class FakeUser {
  private app: SuperTest<Test>;
  private token: string;

  constructor(app: SuperTest<Test>, token: string) {
    this.app = app;
    this.token = token;
  }

  public get(path: string): Test {
    return this.app.get(path).set('x-pifuxelck-auth', this.token);
  }

  public post(path: string): Test {
    return this.app.post(path).set('x-pifuxelck-auth', this.token);
  }

  public put(path: string): Test {
    return this.app.put(path).set('x-pifuxelck-auth', this.token);
  }

  public delete(path: string): Test {
    return this.app.delete(path).set('x-pifuxelck-auth', this.token);
  }
}

export async function newUser(
    app: SuperTest<Test>,
    user: string,
    password = '12345678',
    email = ''): Promise<FakeUser> {
  const token = await app.post('/api/2/account/register')
      .send({user: {display_name: user, password}})
      .expect(200)
      .then((response: any) => response.body.meta.auth);
  const fakeUser = new FakeUser(app, token);
  if (email) {
    await fakeUser.put('/api/2/account')
        .send({user: {email}})
        .expect(200);
  }
  return fakeUser;
}
