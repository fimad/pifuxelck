import * as React from 'react';
import * as models from '../../common/models/drawing';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Drawing from '../components/drawing';
import IconButton from 'material-ui/IconButton';
import SendIcon from 'material-ui-icons/Send';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import Typography from 'material-ui/Typography';

type Props = {
  drawing: models.Drawing
  onSend?: () => void
};

const InboxDrawingCard = ({drawing, onSend}: Props) => (
  <Card style={{margin: '8px'}}>
    <Drawing drawing={drawing} />
    <Divider />
    <CardActions>
      <TextField label="Description..." fullWidth />
      <IconButton>
        <SendIcon />
      </IconButton>
    </CardActions>
  </Card>
);

export default InboxDrawingCard;
