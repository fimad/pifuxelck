import { StarBorder } from 'material-ui-icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Game } from '../../common/models/game';
import { Turn } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import Drawing from '../components/drawing';
import { Desktop, Mobile, Tablet } from '../components/media-query';
import { State } from '../state';

const { push } = require('react-router-redux');

import { IconButton } from 'material-ui';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';

interface Props {
  games: Game[];
  dispatch: Dispatch<State>;
}

const gameToTile =
    ({dispatch, game}: {dispatch: Dispatch<State>, game: Game}) => {
  let title = '';
  if (game.turns.length >= 1) {
    const turn = game.turns[0];
    if (turn.is_drawing === false) {
      title = turn.label;
    }
  }
  const subtitle =
      'by ' + game.turns.map((turn: Turn) => turn.player).join(', ');
  let drawing;
  if (game.turns.length >= 2) {
    const turn = game.turns[1];
    if (turn.is_drawing === true) {
      drawing = (<Drawing drawing={turn.drawing} hideInivisible={true} />);
    }
  }
  return (
    <GridListTile
        key={game.id}
        onClick={() => dispatch(push(`/game/${game.id}`))}>
      {drawing}
      <GridListTileBar title={title} subtitle={subtitle} />
    </GridListTile>
  );
};

const HistoryComponent = ({games, dispatch}: Props) => {
  const tiles = games
      .filter((game) => game.turns.length > 1)
      .map((game) => ({game, dispatch}))
      .map(gameToTile);
  return (
    <div>
      <Desktop>
        <GridList style={{margin: '4px'}} cellHeight='auto' cols={6}>
          {tiles}
        </GridList>
      </Desktop>
      <Tablet>
        <GridList style={{margin: '4px'}} cellHeight='auto' cols={4}>
          {tiles}
        </GridList>
      </Tablet>
      <Mobile>
        <GridList style={{margin: '4px'}} cellHeight='auto' cols={2}>
          {tiles}
        </GridList>
      </Mobile>
    </div>
  );
};

const compareGameByCompletion = (a: Game, b: Game) =>
    compareStringsAsInts(b.completed_at_id, a.completed_at_id);

const mapStateToProps = ({entities: {history}}: State) => ({
  games: Object.values(history).sort(compareGameByCompletion),
});

const History = connect(mapStateToProps)(HistoryComponent);

export default History;
