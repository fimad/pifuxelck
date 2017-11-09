import * as React from 'react';
import * as models from '../../common/models/drawing';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Drawing from '../components/drawing';
import IconButton from 'material-ui/IconButton';
import SendIcon from 'material-ui-icons/Send';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { Turn } from '../../common/models/turn';

type Props = {
  gameId: string,
  drawing: models.Drawing
  label: string
  onChange: (turn: Turn) => void
  onSubmit: () => void
};

const InboxDrawingCard = ({label, drawing, onChange}: Props) => (
  <Card style={{margin: '8px'}}>
    <Drawing drawing={drawing} />
    <Divider />
    <CardActions>
      <TextField
          onChange={(event) => onChange({is_drawing: false, label: event.target.value})}
          label="Description"
          value={label}
          fullWidth />
      <IconButton>
        <SendIcon />
      </IconButton>
    </CardActions>
  </Card>
);

export default InboxDrawingCard;
