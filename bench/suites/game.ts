import FakeUser, { login, newUser } from '../../test/server/fake-user';
import { measure, suite } from '../lib';
import { appWithRealData } from '../utils';

const options = {
  maxTime: Number.MAX_VALUE,
  sharedSetup: true,
  targetTestCount: 25,
  skipCount: 1,
};

export default suite(
  'Game',

  measure(
    'New Game',
    async () => {
      const app = await appWithRealData();
      const user1 = await login(app, 'will', '12345678');
      return async () => {
        await user1
          .post('/api/2/games/new')
          .send({ new_game: { players: ['2'], label: 'start' } })
          .expect(200);
      };
    },
    {
      ...options,
    }
  ),

  measure(
    'Two Turn Game',
    async () => {
      const app = await appWithRealData();
      const user1 = await login(app, 'will', '12345678');
      const user2 = await login(app, 'will2', '12345678');
      const user3 = await login(app, 'will3', '12345678');
      return async () => {
        await user1
          .post('/api/2/games/new')
          .send({ new_game: { players: ['20', '21'], label: 'start' } })
          .expect((res: any) => {
            if (res.status !== 200) {
              console.log(res.body);
            }
          })
          .expect(200);
        let gameId;
        let userWithTurn1: FakeUser;
        let userWithTurn2: FakeUser;
        await user2
          .get('/api/2/games/inbox')
          .expect((res: any) => {
            if (res.status !== 200) {
              console.log(res.body);
            }
          })
          .expect((res: any) => {
            if (res.body.inbox_entries.length > 0) {
              userWithTurn1 = user2;
              userWithTurn2 = user3;
              gameId = res.body.inbox_entries[0].game_id;
            }
          });
        await user3
          .get('/api/2/games/inbox')
          .expect((res: any) => {
            if (res.status !== 200) {
              console.log(res.body);
            }
          })
          .expect((res: any) => {
            if (res.body.inbox_entries.length > 0) {
              userWithTurn1 = user3;
              userWithTurn2 = user2;
              gameId = res.body.inbox_entries[0].game_id;
            }
          });
        await userWithTurn1!
          .put(`/api/2/games/play/${gameId}`)
          .send({
            turn: {
              drawing: {
                background_color: {
                  alpha: 1,
                  blue: 2,
                  green: 3,
                  red: 4,
                },
                lines: [],
              },
              is_drawing: true,
            },
          })
          .expect((res: any) => {
            if (res.status !== 200) {
              console.log(res.body);
            }
          })
          .expect(200);
        await userWithTurn2!
          .put(`/api/2/games/play/${gameId}`)
          .send({
            turn: {
              label: 'foobar',
              is_drawing: false,
            },
          })
          .expect((res: any) => {
            if (res.status !== 200) {
              console.log(res.body);
            }
          })
          .expect(200);
      };
    },
    {
      ...options,
    }
  )
);
