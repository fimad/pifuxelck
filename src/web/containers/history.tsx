import { IconButton } from 'material-ui';
import { StarBorder } from 'material-ui-icons';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
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

const Delay = require('react-delay').default;
const Infinite = require('react-infinite');
const { push } = require('react-router-redux');

const styles = require('./history.css');

interface Props {
  games: Game[];
  dispatch: Dispatch<State>;
}

const getNumCells = () => {
  const clientWidth = document.documentElement.clientWidth;
  if (clientWidth < 768) {
    return 2;
  }
  if (clientWidth < 992) {
    return 4;
  }
  return 6;
};

const gameToTile =
    (cellHeight: number) =>
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
      drawing = (<Drawing drawing={turn.drawing} hideInivisible={false} />);
    }
  }
  const width = `${cellHeight}px`;
  const height = `${cellHeight}px`;
  return (
    <GridListTile
        style={{width, height, padding: '2px'}}
        key={game.id}
        onClick={() => dispatch(push(`/game/${game.id}`))}
    >
      <Delay wait={0}>
        {drawing}
      </Delay>
      <GridListTileBar title={title} subtitle={subtitle} />
    </GridListTile>
  );
};

const HistoryComponent = ({games, dispatch}: Props) => {
  const numCells = getNumCells();
  const cellHeight = document.documentElement.clientWidth / numCells;
  const tiles = games
      .filter((game) => game.turns.length > 1)
      .map((game) => ({game, dispatch}))
      .map(gameToTile(cellHeight));
  const cellHeights =
      tiles.map((x, i) => (i % numCells === 0) ? cellHeight : 0);
  const style = {
    display: 'flex',
    flexDirection: 'row',
  };
  return (
    <ul style={{margin: '0px', padding: '0px', listStyle: 'none'}}>
      <Infinite
          preloadAdditionalHeight={Infinite.containerHeightScaleFactor(3)}
          className={styles.infinite}
          useWindowAsScrollContainer={true}
          elementHeight={cellHeights}
      >
        {tiles}
      </Infinite>
    </ul>
  );
};

const compareGameByCompletion = (a: Game, b: Game) =>
    compareStringsAsInts(b.completed_at_id, a.completed_at_id);

const mapStateToProps = ({entities: {history}}: State) => ({
  games: Object.values(history).sort(compareGameByCompletion),
});

const History = connect(mapStateToProps)(HistoryComponent);

export default History;
