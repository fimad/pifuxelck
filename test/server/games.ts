import { expect, use } from 'chai';
import { agent } from 'supertest';

import server from './fake-server';
import { newUser } from './fake-user';

use(require('chai-subset'));

describe('Games', () => {
  describe('Create', () => {
    it('should reject games from logged out players', async () => {
      const app = agent(await server());
      await newUser(app, 'user1');
      await newUser(app, 'user2');
      await app
        .post('/api/2/games/new')
        .send({ new_game: { players: ['1', '2'], label: 'start' } })
        .expect(500);
    });

    it('should reject games with no players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: [], label: 'start' } })
        .expect(500);
    });

    it('should reject games with invalid players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: 'start' } })
        .expect(500);
    });

    it('should reject games with invalid label', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'] } })
        .expect(500);
    });

    it('should allow the creation of games by logged in players', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
    });
  });

  describe('Inbox', () => {
    it('should reject inbox requests from logged out players', async () => {
      const app = agent(await server());
      await app.get('/api/2/games/inbox').expect(500);
    });

    it('should return inbox entries while game is ongoing', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
      await user1
        .get('/api/2/games/inbox')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            inbox_entries: [],
          })
        );
      await user2
        .get('/api/2/games/inbox')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).to.have.nested.property(
            'inbox_entries[0].expiration_time'
          );
          expect(res.body).to.deep.equal({
            inbox_entries: [
              {
                expiration_time: res.body.inbox_entries[0].expiration_time,
                game_id: 1,
                previous_turn: {
                  is_drawing: false,
                  label: 'start',
                },
              },
            ],
          });
        });
    });

    it('should allow querying specific inbox entry', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start1' } })
        .expect(200);
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start2' } })
        .expect(200);
      await user2
        .get('/api/2/games/inbox/1')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).to.have.nested.property(
            'inbox_entry.expiration_time'
          );
          expect(res.body).to.deep.equal({
            inbox_entry: {
              expiration_time: res.body.inbox_entry.expiration_time,
              game_id: 1,
              previous_turn: {
                is_drawing: false,
                label: 'start1',
              },
            },
          });
        });
      await user2
        .get('/api/2/games/inbox/2')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).to.have.nested.property(
            'inbox_entry.expiration_time'
          );
          expect(res.body).to.deep.equal({
            inbox_entry: {
              expiration_time: res.body.inbox_entry.expiration_time,
              game_id: 2,
              previous_turn: {
                is_drawing: false,
                label: 'start2',
              },
            },
          });
        });
      await user2.get('/api/2/games/inbox/3').expect(500);
    });
  });

  describe('History', () => {
    it('should return empty when no games are complete', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await user1
        .get('/api/2/games')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            games: [],
          })
        );
    });

    it('should return completed games', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
      await user2
        .put('/api/2/games/play/1')
        .send({
          turn: {
            drawing: {
              background_color: {
                alpha: 1,
                blue: 4,
                green: 3,
                red: 2,
              },
              lines: [],
            },
            is_drawing: true,
          },
        })
        .expect(200);
      await user2
        .get('/api/2/games')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.containSubset({
            games: [
              {
                completed_at_id: 1,
                id: 1,
                turns: [
                  {
                    is_drawing: false,
                    label: 'start',
                    player: 'user1',
                  },
                  {
                    drawing: {
                      background_color: {
                        alpha: 1,
                        blue: 4,
                        green: 3,
                        red: 2,
                      },
                      lines: [],
                    },
                    is_drawing: true,
                    player: 'user2',
                  },
                ],
              },
            ],
          })
        );
    });

    it('should handle games with more than 2 players', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      const user3 = await newUser(app, 'user3');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: 'start' } })
        .expect(200);
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                drawing: {
                  background_color: {
                    alpha: 1,
                    blue: 4,
                    green: 3,
                    red: 2,
                  },
                  lines: [],
                },
                is_drawing: true,
              },
            })
        )
      );
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                is_drawing: false,
                label: 'end',
              },
            })
        )
      );
      await Promise.all(
        [user1, user2, user3].map(
          async (user) =>
            await user
              .get('/api/2/games/1')
              .expect(200)
              .expect((res: any) =>
                expect(res.body).to.containSubset({
                  game: {
                    completed_at_id: 1,
                    id: 1,
                    turns: [
                      {
                        is_drawing: false,
                        label: 'start',
                      },
                      {
                        drawing: {
                          background_color: {
                            alpha: 1,
                            blue: 4,
                            green: 3,
                            red: 2,
                          },
                          lines: [],
                        },
                        is_drawing: true,
                      },
                      {
                        is_drawing: false,
                        label: 'end',
                      },
                    ],
                  },
                })
              )
        )
      );
    });

    it('should disallow empty labels', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      const user3 = await newUser(app, 'user3');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: 'start' } })
        .expect(200);
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                drawing: {
                  background_color: {
                    alpha: 1,
                    blue: 4,
                    green: 3,
                    red: 2,
                  },
                  lines: [],
                },
                is_drawing: true,
              },
            })
        )
      );
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user
              .put('/api/2/games/play/1')
              .send({
                turn: {
                  is_drawing: false,
                  label: '',
                },
              })
              .expect(500)
        )
      );
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user
              .put('/api/2/games/play/1')
              .send({
                turn: {
                  is_drawing: false,
                  label: '    ',
                },
              })
              .expect(500)
        )
      );
    });

    it('should disallow new games with empty labels', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      const user3 = await newUser(app, 'user3');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: '' } })
        .expect(500);
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: '  ' } })
        .expect(500);
    });
  });

  describe('History Summary', () => {
    it('should return empty when no games are complete', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      await user1
        .get('/api/2/games/summary')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.deep.equal({
            game_summaries: [],
          })
        );
    });

    it('should return completed games', async () => {
      const app = agent(await server());
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
      await user2
        .put('/api/2/games/play/1')
        .send({
          turn: {
            drawing: {
              background_color: {
                alpha: 1,
                blue: 4,
                green: 3,
                red: 2,
              },
              lines: [],
            },
            is_drawing: true,
          },
        })
        .expect(200);
      await user2
        .get('/api/2/games/summary')
        .expect(200)
        .expect((res: any) =>
          expect(res.body).to.containSubset({
            game_summaries: [
              {
                all_labels: 'start\n',
                background_color: {
                  alpha: 1,
                  blue: 4,
                  green: 3,
                  red: 2,
                },
                completed_at_id: 1,
                first_label: 'start',
                id: 1,
                players: 'user1, user2',
              },
            ],
          })
        );
    });
  });

  describe('Email', () => {
    it('should send email to first player', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1', undefined, 'user1@example.com');
      const user2 = await newUser(app, 'user2', undefined, 'user2@example.com');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
      expect(sentMail).to.have.lengthOf(1);
      await user2
        .put('/api/2/games/play/1')
        .send({
          turn: {
            drawing: {
              background_color: {
                alpha: 1,
                blue: 4,
                green: 3,
                red: 2,
              },
              lines: [],
            },
            is_drawing: true,
          },
        })
        .expect(200);
    });

    it('should not send email if first has no email on file', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1');
      const user2 = await newUser(app, 'user2');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2'], label: 'start' } })
        .expect(200);
      expect(sentMail).to.have.lengthOf(0);
      await user2
        .put('/api/2/games/play/1')
        .send({
          turn: {
            drawing: {
              background_color: {
                alpha: 1,
                blue: 4,
                green: 3,
                red: 2,
              },
              lines: [],
            },
            is_drawing: true,
          },
        })
        .expect(200);
    });

    it('should send email to multiple players', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1', undefined, 'user1@example.com');
      const user2 = await newUser(app, 'user2', undefined, 'user2@example.com');
      const user3 = await newUser(app, 'user3', undefined, 'user3@example.com');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: 'start' } })
        .expect(200);
      expect(sentMail).to.have.lengthOf(1);
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                drawing: {
                  background_color: {
                    alpha: 1,
                    blue: 4,
                    green: 3,
                    red: 2,
                  },
                  lines: [],
                },
                is_drawing: true,
              },
            })
        )
      );
      expect(sentMail).to.have.lengthOf(2);
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                is_drawing: false,
                label: 'end',
              },
            })
        )
      );
    });

    it('should send email to all players after game ends', async () => {
      const testServer = await server();
      const sentMail = testServer.sentMail;
      const app = agent(testServer);
      const user1 = await newUser(app, 'user1', undefined, 'user1@example.com');
      const user2 = await newUser(app, 'user2', undefined, 'user2@example.com');
      const user3 = await newUser(app, 'user3', undefined, 'user3@example.com');
      await user1
        .post('/api/2/games/new')
        .send({ new_game: { players: ['2', '3'], label: 'start' } })
        .expect(200);
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                drawing: {
                  background_color: {
                    alpha: 1,
                    blue: 4,
                    green: 3,
                    red: 2,
                  },
                  lines: [],
                },
                is_drawing: true,
              },
            })
        )
      );
      await Promise.all(
        [user2, user3].map(
          async (user) =>
            await user.put('/api/2/games/play/1').send({
              turn: {
                is_drawing: false,
                label: 'end',
              },
            })
        )
      );
      expect(sentMail).to.have.lengthOf(5);
    });
  });
});
