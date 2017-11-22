import * as React from 'react';
import Drawing from '../components/drawing';
import { Game } from '../../common/models/game';
import { State } from '../state';
import { Turn } from '../../common/models/turn';
import { connect } from 'react-redux';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

type Props = {
  gameId: string,
  game: Game,
};

const LabelTurn = ({label, player}: {label: any, player: any}) => (
  <Card style={{margin: '8px'}}>
    <CardContent>
      <Typography type="headline" component="h2">
        {label}
      </Typography>
      <Typography type="subheading" component="h3" style={{textAlign: 'right'}}>
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const DrawingTurn = ({drawing, player}: {drawing: any, player: any}) => (
  <Card style={{margin: '8px'}}>
    <Drawing drawing={drawing} />
    <CardContent>
      <Typography type="subheading" component="h3" style={{textAlign: 'right'}}>
        {player}
      </Typography>
    </CardContent>
  </Card>
);

const toTurn = (turn: Turn, i: number) => turn.is_drawing == true ?
    (<DrawingTurn key={i} drawing={turn.drawing} player={turn.player} />) :
    (<LabelTurn key={i} label={turn.label} player={turn.player} />);

const GameComponent = ({game}: Props) => (
  <div style={{maxWidth: '75vh', margin: 'auto'}}>
    {(game.turns || []).map(toTurn)}
  </div>
);

const mapStateToProps = ({entities: {history}}: State, {gameId}: Props) => ({
  game: history[gameId] || {},
} as Props);

const Game: any = connect(mapStateToProps)(GameComponent);

export default Game;
