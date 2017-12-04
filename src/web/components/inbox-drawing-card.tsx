import SendIcon from 'material-ui-icons/Send';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
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
}

const InboxDrawingCard = (
      {gameId, label, drawing, onChange, onSubmit}: Props) => (
  <Card style={{margin: '8px'}}>
    <Drawing drawing={drawing} />
    <Divider />
    <CardActions>
      <TextField
          onChange={(event) => onChange({
            is_drawing: false,
            label: event.target.value,
          })}
          label='Description'
          value={label}
          fullWidth />
      <IconButton onClick={() => onSubmit(gameId, {
        is_drawing: false,
        label,
      })} >
        <SendIcon />
      </IconButton>
    </CardActions>
  </Card>
);

export default InboxDrawingCard;
