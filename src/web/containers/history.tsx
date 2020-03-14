import { IconButton } from '@material-ui/core';
import { push } from 'connected-react-router';
import { StarBorder } from '@material-ui/icons';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
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
import Progress from '../components/progress';
import { State } from '../state';
import { WebDispatch } from '../store';

const Delay = require('react-delay').default;
const Infinite = require('react-infinite');

const styles = require('./history.css');

interface Props {
  dispatch: WebDispatch;
  filter: string | null;
  loading: boolean;
  summaries: GameSummary[];
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

const contrastColor = (color: models.Color, alpha: number = 1) => {
  // Counting the perceptive luminance - human eye favors green color...
  const a = 1 - (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue);
  return a < 0.3 ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
};

const colorToCss = (c: models.Color) =>
  `rgba(${c.red * 255}, ${c.green * 255}, ${c.blue * 255}, ${c.alpha})`;

const summaryToTile = (numCells: number, cellHeight: number) => ({
  dispatch,
  summary,
}: {
  dispatch: WebDispatch;
  summary: GameSummary;
}) => {
  const title = summary.first_label;
  const subtitle = 'by ' + summary.players;
  const width = `${100 / numCells}%`;
  const height = `${cellHeight}px`;
  const textColor = contrastColor(summary.background_color);
  const secondaryTextColor = contrastColor(summary.background_color, 0.8);
  const backgroundColor = colorToCss(summary.background_color);
  return (
    <GridListTile
      style={{ width, height, padding: '2px' }}
      key={summary.id}
      onClick={() => dispatch(push(`/game/${summary.id}`))}
    >
      <Typography
        align="center"
        variant="h6"
        classes={{ root: styles.title }}
        style={{ color: textColor, backgroundColor }}
      >
        <div className={styles.titleInner}>{title}</div>
      </Typography>
      <Typography
        noWrap={true}
        classes={{ root: styles.subtitle }}
        style={{ color: secondaryTextColor }}
      >
        {subtitle}
      </Typography>
    </GridListTile>
  );
};

const HistoryComponent = ({ summaries, dispatch, loading, filter }: Props) => {
  const numCells = getNumCells();
  const cellHeight = document.documentElement.clientWidth / numCells;
  const tiles = summaries
    .filter(
      (summary) =>
        !filter ||
        summary.all_labels.toLowerCase().indexOf(filter.toLowerCase()) >= 0
    )
    .map((summary) => ({ summary, dispatch }))
    .map(summaryToTile(numCells, cellHeight));
  const cellHeights = tiles.map((x, i) =>
    i % numCells === 0 ? cellHeight - numCells + 1 : 1
  );
  const style = {
    display: 'flex',
    flexDirection: 'row',
  };
  return (
    <div>
      <Progress visible={loading} />
      <ul style={{ margin: '0px', padding: '0px', listStyle: 'none' }}>
        <Infinite
          preloadAdditionalHeight={Infinite.containerHeightScaleFactor(3)}
          className={styles.infinite}
          useWindowAsScrollContainer={true}
          elementHeight={cellHeights}
        >
          {tiles}
        </Infinite>
      </ul>
    </div>
  );
};

const compareGameByCompletion = (a: GameSummary, b: GameSummary) =>
  compareStringsAsInts(b.completed_at_id, a.completed_at_id);

const mapStateToProps = ({
  entities: { gameCache, history },
  apiStatus,
  ui,
}: State) => ({
  filter: ui.history.query,
  loading: apiStatus.inProgress.GET_HISTORY,
  summaries: Object.values(history).sort(compareGameByCompletion),
});

const History = connect(mapStateToProps)(HistoryComponent);

export default History;
