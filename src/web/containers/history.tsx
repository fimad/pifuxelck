import * as React from 'react';
import Drawing from '../components/drawing';
import { StarBorder } from 'material-ui-icons';
import { Dispatch } from 'redux';
import { Game } from '../../common/models/game';
import { Link } from 'react-router-dom';
import { State } from '../state';
import { Turn } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import { connect } from 'react-redux';
import { Desktop, Tablet, Mobile } from '../components/media-query';

const { push } = require('react-router-redux');

import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import { IconButton } from 'material-ui';

type Props = {
  games: Game[],
  dispatch: Dispatch<State>,
};

const gameToTile = ({dispatch, game}: {dispatch: Dispatch<State>, game: Game}) => {
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
