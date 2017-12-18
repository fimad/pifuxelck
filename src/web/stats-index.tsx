import AppBar from 'material-ui/AppBar';
import { GridList, GridListTile } from 'material-ui/GridList';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Table from 'material-ui/Table';
import { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
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

const UserStats = ({userStats}: Stats) => {
  const toRow = (stats: any) => (
    <TableRow key={stats.displayName}>
      <TableCell>{stats.displayName}</TableCell>
      <TableCell numeric={true}>{stats.inboxSize}</TableCell>
      <TableCell numeric={true}>{stats.pendingGames}</TableCell>
      <TableCell numeric={true}>{stats.startedGames}</TableCell>
      <TableCell numeric={true}>{stats.drawings}</TableCell>
      <TableCell numeric={true}>{stats.labels}</TableCell>
    </TableRow>
  );
  return (
    <Paper className={styles.userStat}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell numeric={true}>Inbox</TableCell>
            <TableCell numeric={true}>Pending</TableCell>
            <TableCell numeric={true}>Games Started</TableCell>
            <TableCell numeric={true}>Drawings</TableCell>
            <TableCell numeric={true}>Labels</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userStats.map(toRow)}
        </TableBody>
      </Table>
    </Paper>
  );
};

const GameSizes = ({gameSizes}: Stats) => {
  return (
    <Paper className={styles.gameSizes}>
      <Typography type='caption' align='center'>
        Players Per Game
      </Typography>
      <ResponsiveContainer height={200}>
        <BarChart data={gameSizes} margin={{left: -20, right: 10, top: 10}}>
          <XAxis dataKey='size' />
          <YAxis />
          <CartesianGrid />
          <Bar dataKey='total' fill={barColor1} />
        </BarChart>
      </ResponsiveContainer>
      <Typography type='caption' align='center'>
        Players
      </Typography>
    </Paper>
  );
};

const GameDurations = ({gameDurations}: Stats) => {
  return (
    <Paper className={styles.gameSizes}>
      <Typography type='caption' align='center'>
        Completed Game Duration In Days
      </Typography>
      <ResponsiveContainer height={200}>
        <BarChart data={gameDurations} margin={{left: -20, right: 10, top: 10}}>
          <XAxis dataKey='gameDurationDays' />
          <YAxis />
          <CartesianGrid />
          <Bar dataKey='count' fill={barColor1} />
        </BarChart>
      </ResponsiveContainer>
      <Typography type='caption' align='center'>
        Days
      </Typography>
    </Paper>
  );
};

const GamesOverTime = ({gamesOverTime}: Stats) => {
  const data = gamesOverTime.map(({timestamp, pendingGames}) => ({
    pendingGames,
    timestamp: timestamp * 1000,
  }));
  const tickFormatter = (x: number) => new Date(x).toLocaleString();
  return (
    <Paper className={styles.gamesOverTime}>
      <Typography type='caption' align='center'>
        Pending Games Over Time
      </Typography>
      <ResponsiveContainer height={200}>
        <AreaChart data={data} margin={{left: -20, right: 10, top: 10}}>
          <XAxis
            dataKey='timestamp'
            tickFormatter={tickFormatter}
          />
          <YAxis />
          <CartesianGrid />
          <Area dataKey='pendingGames' fill={barColor1} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default function(stats: Stats) {
  ReactDOM.render(
    <MuiThemeProvider>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography type='title' style={{flex: '1 1 auto'}} color='inherit'>
            Game Stats
          </Typography>
        </Toolbar>
      </AppBar>
      <AppBar position='static'><Toolbar /></AppBar>
      <div className={styles.container}>
        <Paper className={styles.gameStat}>
          <Typography type='headline' align='center'>
            {stats.gameStats.pending}
          </Typography>
          <Typography type='caption' align='center'>
            Pending Games
          </Typography>
        </Paper>
        <Paper className={styles.gameStat}>
          <Typography type='headline' align='center'>
            {stats.gameStats.complete}
          </Typography>
          <Typography type='caption' align='center'>
            Complete Games
          </Typography>
        </Paper>
        <Paper className={styles.gameStat}>
          <Typography type='headline' align='center'>
            {stats.gameStats.total}
          </Typography>
          <Typography type='caption' align='center'>
            Total Games
          </Typography>
        </Paper>
        <GameSizes {...stats} />
        <GameDurations {...stats} />
        <GamesOverTime {...stats} />
        <UserStats {...stats} />
      </div>
    </MuiThemeProvider>,
    document.getElementById('content'),
  );
}
