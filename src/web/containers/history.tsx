import * as React from 'react';
import Drawing from '../components/drawing';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import { Dispatch } from 'redux';
import { Game } from '../../common/models/game';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { Turn } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import { connect } from 'react-redux';

const { push } = require('react-router-redux');

import {
  GridList,
  GridTile,
  IconButton,
  Subheader,
} from 'material-ui';

type Props = {
  games: Game[],
  dispatch: Dispatch<State>,
};

const gameToTile = (game: Game) => {
  let title = '';
  if (game.turns.length >= 1) {
    const turn = game.turns[0];
    if (turn.is_drawing == false) {
      title = turn.label;
    }
  }
  let subtitle = 'by ' + game.turns.map((turn: Turn) => turn.player).join(', ');
  let drawing = undefined;
  if (game.turns.length >= 2) {
    const turn = game.turns[1];
    if (turn.is_drawing == true) {
      drawing = (<Drawing drawing={turn.drawing} />);
    }
  }
  return (
    <GridTile
      key={game.id}
      title={title}
      subtitle={subtitle} >
      {drawing}
    </GridTile>
  );
};

const HistoryComponent = ({games}: Props) => (
  <GridList cellHeight='auto'>
    {games.map(gameToTile)}
  </GridList>
);

const compareGameByCompletion = (a: Game, b: Game) =>
    compareStringsAsInts(b.completed_at_id, a.completed_at_id);

const mapStateToProps = ({entities: {history}}: State) => ({
  games: Object.values(history).sort(compareGameByCompletion),
});

const History = connect(mapStateToProps)(HistoryComponent);

export default History;
