import * as React from 'react';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

type Props = {
  label: string
  onSend?: () => void
};

const InboxLabelCard = ({label, onSend}: Props) => (
  <Card style={{margin: '8px'}}>
    <CardContent>
      <Typography type="headline" component="h2">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

export default InboxLabelCard;
