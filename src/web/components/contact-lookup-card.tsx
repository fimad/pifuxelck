import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { State } from '../state';

const styles = require('./contact-lookup-card.css');

interface Props {
  lookup: string;
  lookupId?: string;
  onAddContact: (lookupId: string) => void;
  onLookupChange: (lookup: string) => void;
}

export default ({ lookup, lookupId, onAddContact, onLookupChange }: Props) => {
  const myOnLookupChange = (event: React.SyntheticEvent) =>
    onLookupChange((event.target as HTMLInputElement).value);
  return (
    <div className={cx(styles.container, styles.email)}>
      <Paper className={styles.paper}>
        <Typography variant="h6" classes={{ root: styles.title }}>
          Add By Name
        </Typography>
        <TextField
          classes={{ root: styles.text }}
          onChange={myOnLookupChange}
          onSubmit={() => onAddContact(lookupId)}
          label="Contact"
          value={lookup}
          fullWidth={true}
        />
        <div className={styles.buttonContainer}>
          <Button
            classes={{ root: styles.button }}
            disabled={lookupId == null}
            onClick={() => onAddContact(lookupId)}
            variant="contained"
            color="secondary"
          >
            Add
          </Button>
        </div>
      </Paper>
    </div>
  );
};
