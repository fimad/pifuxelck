import SendIcon from 'material-ui-icons/Send';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import * as models from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import Drawing from '../components/drawing';

interface Props {
  gameId: string;
  drawing: models.Drawing;
  label: string;
  onChange: (turn: Turn) => void;
  onSubmit: (gameId: string, turn: Turn) => void;
  sendPending: boolean;
}

const InboxDrawingCard = (
      {gameId, label, drawing, onChange, onSubmit, sendPending}: Props) => {
  const onChangeCallback =
      (event: React.ChangeEvent<HTMLInputElement>) => onChange({
        is_drawing: false,
        label: event.target.value,
      });
  const onClickCallback = () => onSubmit(gameId, {
    is_drawing: false,
    label,
  });
  const sendButton = (
    <IconButton onClick={onClickCallback}>
      <SendIcon />
    </IconButton>
  );
  const loading = (
    <CircularProgress color='accent' />
  );
  const action = sendPending ? loading : sendButton;
  return (
    <Card style={{margin: '8px'}}>
      <Drawing drawing={drawing} />
      <Divider />
      <CardActions>
        <TextField
            onChange={sendPending ? undefined : onChangeCallback}
            label='Description'
            value={label}
            fullWidth={true}
        />
        {action}
      </CardActions>
    </Card>
  );
};

export default InboxDrawingCard;
