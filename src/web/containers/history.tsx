import { IconButton } from 'material-ui';
import { StarBorder } from 'material-ui-icons';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import * as models from '../../common/models/drawing';
import { Game, GameSummary } from '../../common/models/game';
import { Turn } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import { getGame } from '../actions';
import Drawing from '../components/drawing';
import { Desktop, Mobile, Tablet } from '../components/media-query';
import { State } from '../state';

const Delay = require('react-delay').default;
const Infinite = require('react-infinite');
const VisibilitySensor = require('react-visibility-sensor');
const { push } = require('react-router-redux');

const styles = require('./history.css');

type GameOrSummary = {
  is: 'GAME',
  game: Game,
} | {
  is: 'SUMMARY',
  summary: GameSummary,
};

interface Props {
  gameOrSummaries: GameOrSummary[];
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

const gameToTile = (
    numCells: number, cellHeight: number, dispatch: Dispatch<State>,
    game: Game) => {
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
  let backgroundDrawing;
  if (game.turns.length >= 2) {
    const turn = game.turns[1];
    if (turn.is_drawing === true) {
      drawing = (<Drawing drawing={turn.drawing} hideInivisible={false} />);
      backgroundDrawing = {
        background_color: turn.drawing.background_color,
        lines: [],
      } as models.Drawing;
    }
  }
  const width = `${100 / numCells}%`;
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
      <Drawing drawing={backgroundDrawing} hideInivisible={false} />
      <GridListTileBar title={title} subtitle={subtitle} />
    </GridListTile>
  );
};

const summaryToTile = (
    numCells: number, cellHeight: number, dispatch: Dispatch<State>,
    summary: GameSummary) => {
  const title = summary.first_label;
  const subtitle = 'by ' + summary.players;
  const drawing = {
    background_color: summary.background_color,
    lines: [],
  } as models.Drawing;
  const width = `${100 / numCells}%`;
  const height = `${cellHeight}px`;
  const loadGameIfVisible = (isVisible: boolean) => {
    if (isVisible) {
      dispatch(getGame(summary.id));
    }
    return <div/>;
  };
  return (
    <GridListTile
        style={{width, height, padding: '2px'}}
        key={summary.id}
        onClick={() => dispatch(push(`/game/${summary.id}`))}
    >
      <VisibilitySensor
          delayedCall={true}
          scrollCheck={true}
          scrollDelay={0}
          intervalDelay={500}
          partialVisibility={true}
          onChange={loadGameIfVisible}
      >
        <Drawing drawing={drawing} hideInivisible={false} />
      </VisibilitySensor>
      <GridListTileBar title={title} subtitle={subtitle} />
    </GridListTile>
  );
};

const gameOrSummaryToTile =
    (numCells: number, cellHeight: number) =>
    ({dispatch, gameOrSummary}: {
      dispatch: Dispatch<State>,
      gameOrSummary: GameOrSummary,
    }) => {
  if (gameOrSummary.is === 'GAME') {
    return gameToTile(numCells, cellHeight, dispatch, gameOrSummary.game);
  } else {
    return summaryToTile(numCells, cellHeight, dispatch, gameOrSummary.summary);
  }
};

const HistoryComponent = ({gameOrSummaries, dispatch}: Props) => {
  const numCells = getNumCells();
  const cellHeight = (document.documentElement.clientWidth / numCells);
  const tiles = gameOrSummaries
      .filter((x) => x.is === 'SUMMARY' || x.game.turns.length > 1)
      .map((gameOrSummary) => ({gameOrSummary, dispatch}))
      .map(gameOrSummaryToTile(numCells, cellHeight));
  const cellHeights =
      tiles.map(
          (x, i) => (i % numCells === 0) ? (cellHeight - numCells + 1) : 1);
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

const compareGameByCompletion = (a: GameSummary, b: GameSummary) =>
    compareStringsAsInts(b.completed_at_id, a.completed_at_id);

const mapStateToProps = ({entities: {gameCache, history}}: State) => ({
  gameOrSummaries: Object.values(history)
      .sort(compareGameByCompletion)
      .map((summary) => (gameCache[summary.id]) ?
          {is: 'GAME', game: gameCache[summary.id]} :
          {is: 'SUMMARY', summary}),
});

const History = connect(mapStateToProps)(HistoryComponent);

export default History;
