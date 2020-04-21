import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import SendIcon from '@material-ui/icons/Send';
import * as React from 'react';

import * as models from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import Drawing from '../components/drawing';

interface Props {
  gameId: string;
  drawing: models.Drawing;
  expirationTime: number;
  label: string;
  onChange: (turn: Turn) => void;
  onSubmit: (gameId: string, turn: Turn) => void;
  sendPending: boolean;
}

const InboxDrawingCard = ({
  gameId,
  label,
  drawing,
  onChange,
  onSubmit,
  sendPending,
  expirationTime,
}: Props) => {
  const onChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange({
      is_drawing: false,
      label: event.target.value,
    });
  const onClickCallback = () =>
    onSubmit(gameId, {
      is_drawing: false,
      label,
    });
  const sendButton = (
    <IconButton onClick={onClickCallback}>
      <SendIcon />
    </IconButton>
  );
  const loading = <CircularProgress color="secondary" />;
  const action = sendPending ? loading : sendButton;
  return (
    <Card style={{ margin: '8px' }}>
      <CardContent>
        <Typography variant="caption" align="right">
          Expires at {new Date(expirationTime * 1000).toLocaleString()}
        </Typography>
      </CardContent>
      <Drawing drawing={drawing} />
      <Divider />
      <CardActions>
        <TextField
          onChange={sendPending ? undefined : onChangeCallback}
          label="Description"
          value={label}
          fullWidth={true}
        />
        {action}
      </CardActions>
    </Card>
  );
};

export default InboxDrawingCard;
