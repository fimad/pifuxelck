import AppBar from '@material-ui/core/AppBar';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ArchiveIcon from '@material-ui/icons/Archive';
import BackIcon from '@material-ui/icons/ArrowBack';
import ContactsIcon from '@material-ui/icons/Contacts';
import LogoutIcon from '@material-ui/icons/Eject';
import HistoryIcon from '@material-ui/icons/History';
import InboxIcon from '@material-ui/icons/Inbox';
import ChartIcon from '@material-ui/icons/InsertChart';
import PersonIcon from '@material-ui/icons/Person';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  GameDurationHistogram,
  GameSizeHistogram,
  GameStats,
  Stats,
  UserStats,
} from '../common/models/stats';

const styles = require('./stats-index.css');

const barColor1 = '#ff4081';

const UserStats = ({ userStats }: Stats) => {
  const toRow = (stats: any) => (
    <TableRow key={stats.displayName}>
      <TableCell>{stats.displayName}</TableCell>
      <TableCell align="right">{stats.inboxSize}</TableCell>
      <TableCell align="right">{stats.pendingGames}</TableCell>
      <TableCell align="right">{stats.skips}</TableCell>
      <TableCell align="right">{stats.startedGames}</TableCell>
      <TableCell align="right">{stats.drawings}</TableCell>
      <TableCell align="right">{stats.labels}</TableCell>
    </TableRow>
  );
  return (
    <Paper className={styles.userStat}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell align="right">Inbox</TableCell>
            <TableCell align="right">Pending</TableCell>
            <TableCell align="right">Skips</TableCell>
            <TableCell align="right">Games Started</TableCell>
            <TableCell align="right">Drawings</TableCell>
            <TableCell align="right">Labels</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{userStats.map(toRow)}</TableBody>
      </Table>
    </Paper>
  );
};

const GameSizes = ({ gameSizes }: Stats) => {
  return (
    <Paper className={styles.gameSizes}>
      <Typography variant="caption" align="center">
        Players Per Game
      </Typography>
      <ResponsiveContainer height={200}>
        <BarChart data={gameSizes} margin={{ left: -20, right: 10, top: 10 }}>
          <XAxis dataKey="size" />
          <YAxis />
          <CartesianGrid />
          <Bar dataKey="total" fill={barColor1} />
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" align="center">
        Players
      </Typography>
    </Paper>
  );
};

const GameDurations = ({ gameDurations }: Stats) => {
  return (
    <Paper className={styles.gameSizes}>
      <Typography variant="caption" align="center">
        Completed Game Duration In Days
      </Typography>
      <ResponsiveContainer height={200}>
        <BarChart
          data={gameDurations}
          margin={{ left: -20, right: 10, top: 10 }}
        >
          <XAxis dataKey="gameDurationDays" />
          <YAxis />
          <CartesianGrid />
          <Bar dataKey="count" fill={barColor1} />
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" align="center">
        Days
      </Typography>
    </Paper>
  );
};

const GamesOverTime = ({ gamesOverTime }: Stats) => {
  const data = gamesOverTime.map(({ timestamp, pendingGames }) => ({
    pendingGames,
    timestamp: timestamp * 1000,
  }));
  const tickFormatter = (x: number) => new Date(x).toLocaleString();
  return (
    <Paper className={styles.gamesOverTime}>
      <Typography variant="caption" align="center">
        Pending Games Over Time
      </Typography>
      <ResponsiveContainer height={200}>
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <XAxis
            scale="linear"
            dataKey="timestamp"
            tickFormatter={tickFormatter}
          />
          <YAxis />
          <CartesianGrid />
          <Area type="stepAfter" dataKey="pendingGames" fill={barColor1} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default function(stats: Stats) {
  ReactDOM.render(
    <MuiThemeProvider theme={createMuiTheme()}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            onClick={() => window.history.back()}
            color="inherit"
            aria-label="Menu"
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h6" style={{ flex: '1 1 auto' }} color="inherit">
            Game Stats
          </Typography>
        </Toolbar>
      </AppBar>
      <AppBar position="static">
        <Toolbar />
      </AppBar>
      <div className={styles.container}>
        <Paper className={styles.gameStat}>
          <Typography variant="h5" align="center">
            {stats.gameStats.pending}
          </Typography>
          <Typography variant="caption" align="center">
            Pending Games
          </Typography>
        </Paper>
        <Paper className={styles.gameStat}>
          <Typography variant="h5" align="center">
            {stats.gameStats.complete}
          </Typography>
          <Typography variant="caption" align="center">
            Complete Games
          </Typography>
        </Paper>
        <Paper className={styles.gameStat}>
          <Typography variant="h5" align="center">
            {stats.gameStats.total}
          </Typography>
          <Typography variant="caption" align="center">
            Total Games
          </Typography>
        </Paper>
        <GameSizes {...stats} />
        <GameDurations {...stats} />
        <GamesOverTime {...stats} />
        <UserStats {...stats} />
      </div>
    </MuiThemeProvider>,
    document.getElementById('content')
  );
}
