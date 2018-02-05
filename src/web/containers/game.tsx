import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Game } from '../../common/models/game';
import { Turn } from '../../common/models/turn';
import { getGame } from '../actions';
import Drawing from '../components/drawing';
import Progress from '../components/progress';
import { State } from '../state';

interface Props {
  gameId: string;
  game: Game;
  loadGame: () => void;
}

const LabelTurn = ({label, player}: {label: any, player: any}) => (
  <Card style={{margin: '8px'}}>
    <CardContent>
      <Typography type='headline' component='h2'>
        {label}
      </Typography>
      <Typography type='subheading' component='h3' style={{textAlign: 'right'}}>
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const DrawingTurn = ({drawing, player}: {drawing: any, player: any}) => (
  <Card style={{margin: '8px'}}>
    <Drawing drawing={drawing} />
    <CardContent>
      <Typography type='subheading' component='h3' style={{textAlign: 'right'}}>
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const toTurn = (turn: Turn, i: number) => turn.is_drawing === true ?
    (<DrawingTurn key={i} drawing={turn.drawing} player={turn.player} />) :
    (<LabelTurn key={i} label={turn.label} player={turn.player} />);

const GameComponent = ({game, loadGame}: Props) => {
  if (!game.turns) {
    loadGame();
  }
  return (
    <div>
      <Progress visible={!game.turns} />
      <div style={{maxWidth: '75vh', margin: 'auto'}}>
        {(game.turns || []).map(toTurn)}
      </div>
    </div>
  );
};

const mapStateToProps = ({entities: {gameCache}}: State, {gameId}: Props) => ({
  game: gameCache[gameId] || {},
} as Props);

const mapStateToDispatch = (dispatch: Dispatch<State>, {gameId}: Props) => ({
  loadGame: () => dispatch(getGame(gameId)),
} as Props);

const Game: any = connect(mapStateToProps, mapStateToDispatch)(GameComponent);

export default Game;
