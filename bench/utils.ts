import { agent } from 'supertest';

import fakeServer from '../test/server/fake-server';

export async function appWithRealData() {
  return agent(
    await fakeServer({
      sqlFile: './backups/latest.sql',
      passwordOverride: '12345678',
    })
  );
}
