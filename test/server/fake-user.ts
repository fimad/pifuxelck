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
  email = ''
): Promise<FakeUser> {
  const token = await app
    .post('/api/2/account/register')
    .send({ user: { display_name: user, password } })
    .expect(function(res) {
      if (res.status != 200) {
        console.log(JSON.stringify(res.body, null, 2));
      }
    })
    .expect(200)
    .then((response: any) => response.body.meta.auth);
  const fakeUser = new FakeUser(app, token);
  if (email) {
    await fakeUser
      .put('/api/2/account')
      .send({ user: { email } })
      .expect(function(res) {
        if (res.status != 200) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect(200);
  }
  return fakeUser;
}

export async function login(
  app: SuperTest<Test>,
  user: string,
  password: string
): Promise<FakeUser> {
  const token = await app
    .post('/api/2/account/login')
    .send({ user: { display_name: user, password } })
    .expect(function(res) {
      if (res.status != 200) {
        console.log(JSON.stringify(res.body, null, 2));
      }
    })
    .expect(200)
    .then((response: any) => response.body.meta.auth);
  const fakeUser = new FakeUser(app, token);
  return fakeUser;
}
