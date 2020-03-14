import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Game } from '../../common/models/game';
import { Turn } from '../../common/models/turn';
import { getGame } from '../actions';
import Drawing from '../components/drawing';
import Progress from '../components/progress';
import { State } from '../state';
import { WebDispatch } from '../store';

interface Props {
  game: Game;
  gameId: string;
  gameRef: (gameRef: HTMLElement) => void;
  loadGame: () => void;
}

const LabelTurn = ({ label, player }: { label: any; player: any }) => (
  <Card style={{ margin: '8px' }}>
    <CardContent>
      <Typography variant="h5" component="h2">
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        component="h3"
        style={{ textAlign: 'right' }}
      >
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const DrawingTurn = ({ drawing, player }: { drawing: any; player: any }) => (
  <Card style={{ margin: '8px' }}>
    <Drawing drawing={drawing} />
    <CardContent>
      <Typography
        variant="subtitle1"
        component="h3"
        style={{ textAlign: 'right' }}
      >
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const toTurn = (turn: Turn, i: number) =>
  turn.is_drawing === true ? (
    <DrawingTurn key={i} drawing={turn.drawing} player={turn.player} />
  ) : (
    <LabelTurn key={i} label={turn.label} player={turn.player} />
  );

const GameComponent = ({ game, gameRef, loadGame }: Props) => {
  if (!game.turns) {
    loadGame();
  }
  return (
    <div>
      <Progress visible={!game.turns} />
      <div ref={gameRef} style={{ maxWidth: '75vh', margin: 'auto' }}>
        {(game.turns || []).map(toTurn)}
      </div>
    </div>
  );
};

const mapStateToProps = (
  { entities: { gameCache } }: State,
  { gameId }: Props
) =>
  ({
    game: gameCache[gameId] || {},
  } as Props);

const mapStateToDispatch = (dispatch: WebDispatch, { gameId }: Props) =>
  ({
    loadGame: () => dispatch(getGame(gameId)),
  } as Props);

const Game: any = connect(mapStateToProps, mapStateToDispatch)(GameComponent);

export default Game;
