import * as seedrandom from 'seedrandom';

import FakeUser, { newUser } from '../test/server/fake-user';

export type Options = {
  seed: string;
  playerCount: number;
  gameCount: number;
  turnProbability: number;
  playersPerGame: number;
};

export type Data = {
  players: FakeUser[];
};

const defaultOptions: Options = {
  seed: 'fake-data',
  playerCount: 10,
  gameCount: 20,
  turnProbability: 0.9,
  playersPerGame: 5,
};

export async function fakeData(
  app: any,
  options: Partial<Options>
): Promise<Data> {
  options = { ...defaultOptions, ...options };
  const random = seedrandom(options.seed);
  const players: FakeUser[] = [];

  // Create all the players.
  for (let i = 1; i <= options.playerCount; i++) {
    players.push(await newUser(app, `player${i}`));
  }

  // Create a bunch of games.
  for (let gameId = 1; gameId <= options.gameCount; gameId++) {
    // Randomly choose players.
    const gamePlayers: number[] = [];
    while (gamePlayers.length < options.playersPerGame) {
      const player = Math.floor(random() * options.playerCount);
      if (!new Set(gamePlayers).has(player)) {
        gamePlayers.push(player);
      }
    }

    // Have the first player start a game.
    await players[gamePlayers[0]]
      .post('/api/2/games/new')
      .send({
        new_game: {
          players: gamePlayers.slice(1).map((i) => `${i + 1}`),
          label: 'start',
        },
      })
      .expect(function(res) {
        if (res.status != 200) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect(200);

    // Have each player attempt to take the next turn in this game. This is
    // dumb and slow, but it doesn't matter since this isn't included in the
    // benchmark time.
    let drawingTurn = true;
    const drawing: any = {
      background_color: {
        alpha: 1,
        blue: 4,
        green: 3,
        red: 2,
      },
      lines: [],
    };
    for (let turn = 0; turn < gamePlayers.length - 1; turn++) {
      if (random() >= options.turnProbability) {
        break;
      }
      for (let player of gamePlayers.slice(1)) {
        const turn = drawingTurn
          ? { drawing, is_drawing: true }
          : { label: 'foobar', is_drawing: false };
        await players[player].put(`/api/2/games/play/${gameId}`).send({ turn });
      }
      drawingTurn = !drawingTurn;
    }
  }
  return { players };
}
