import server from './fake-server';
import { agent } from 'supertest';
import { expect, use } from 'chai';
import { newUser } from './fake-user';

use(require('chai-subset'));

describe('Games', () => {
  describe('Create', () => {
    it('should reject games from logged out players', async () => {
      const app = agent(await server());
      await newUser(app, 'user1');
      await newUser(app, 'user2');
      await app.post('/api/2/games/new')
          .send({new_game: {players: ['1', '2'], label: 'start'}})
          .expect(500);
    });

    it('should reject games with no players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: [], label: 'start'}})
          .expect(500);
    });

    it('should reject games with invalid players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2', '3'], label: 'start'}})
          .expect(500);
    });

    it('should reject games with invalid label', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2']}})
          .expect(500);
    });

    it('should allow the creation of games by logged in players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2'], label: 'start'}})
          .expect(200);
    });
  });

  describe('Inbox', () => {
    it('should reject inbox requests from logged out players', async () => {
      const app = agent(await server());
      await app.get('/api/2/games/inbox')
          .expect(500);
    });

    it('should return inbox entries while game is ongoing', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2'], label: 'start'}})
          .expect(200);
      await user1.get('/api/2/games/inbox')
          .expect(200)
          .expect((res: any) => expect(res.body).to.deep.equal({
            inbox_entries: [],
          }));
      await user2.get('/api/2/games/inbox')
          .expect(200)
          .expect((res: any) => expect(res.body).to.deep.equal({
            inbox_entries: [
              {
                game_id: 1,
                previous_turn: {
                  is_drawing: false,
                  label: 'start',
                },
              },
            ],
          }));
    });

    it('should allow querying specific inbox entry', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2'], label: 'start1'}})
          .expect(200);
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2'], label: 'start2'}})
          .expect(200);
      await user2.get('/api/2/games/inbox/1')
          .expect(200)
          .expect((res: any) => expect(res.body).to.deep.equal({
            inbox_entry: {
              game_id: 1,
              previous_turn: {
                is_drawing: false,
                label: 'start1',
              },
            },
          }));
      await user2.get('/api/2/games/inbox/2')
          .expect(200)
          .expect((res: any) => expect(res.body).to.deep.equal({
            inbox_entry: {
              game_id: 2,
              previous_turn: {
                is_drawing: false,
                label: 'start2',
              },
            },
          }));
      await user2.get('/api/2/games/inbox/3').expect(500);
    });
  });

  describe('History', () => {
    it('should return empty when no games are complete', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await user1.get('/api/2/games')
          .expect(200)
          .expect((res: any) => expect(res.body).to.deep.equal({
            games: [],
          }));
    });

    it('should return completed games', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2'], label: 'start'}})
          .expect(200);
      await user2.put('/api/2/games/play/1')
          .send({
            turn: {
              is_drawing: true,
              drawing: {
                background_color: {
                  alpha: 1,
                  red: 2,
                  green: 3,
                  blue: 4,
                },
                lines: [],
              },
            },
          })
          .expect(200);
      await user2.get('/api/2/games')
          .expect(200)
          .expect((res: any) => expect(res.body).to.containSubset({
            games: [{
              id: 1,
              turns: [
                {
                  player: 'user1',
                  is_drawing: false,
                  label: 'start',
                },
                {
                  player: 'user2',
                  is_drawing: true,
                  drawing: {
                    background_color: {
                      alpha: 1,
                      red: 2,
                      green: 3,
                      blue: 4,
                    },
                    lines: [],
                  },
                },
              ],
              completed_at_id: 1,
            }],
          }));
    });

    it('should handle gamesa with more than 2 players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      const user3 = await newUser(app, 'user3');
      await user1.post('/api/2/games/new')
          .send({new_game: {players: ['2', '3'], label: 'start'}})
          .expect(200);
      await Promise.all([user2, user3].map(async (user) =>
          await user.put('/api/2/games/play/1')
              .send({
                turn: {
                  is_drawing: true,
                  drawing: {
                    background_color: {
                      alpha: 1,
                      red: 2,
                      green: 3,
                      blue: 4,
                    },
                    lines: [],
                  },
                },
              })));
      await Promise.all([user2, user3].map(async (user) =>
          await user.put('/api/2/games/play/1')
              .send({
                turn: {
                  is_drawing: false,
                  label: 'end',
                },
              })));
      await Promise.all([user1, user2, user3].map(async (user) =>
          await user.get('/api/2/games/1')
              .expect(200)
              .expect((res: any) => expect(res.body).to.containSubset({
                game: {
                  id: 1,
                  turns: [
                    {
                      is_drawing: false,
                      label: 'start',
                    },
                    {
                      is_drawing: true,
                      drawing: {
                        background_color: {
                          alpha: 1,
                          red: 2,
                          green: 3,
                          blue: 4,
                        },
                        lines: [],
                      },
                    },
                    {
                      is_drawing: false,
                      label: 'end',
                    },
                  ],
                  completed_at_id: 1,
                },
              }))));
    });
  });
});
