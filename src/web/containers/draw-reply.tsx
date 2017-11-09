import * as React from 'react';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Draw from '../components/draw';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { Turn, drawingOrDefault, labelOrDefault } from '../../common/models/turn';
import { connect } from 'react-redux';
import { updateOutbox } from '../actions';

const { push } = require('react-router-redux');

type ExternalProps = {
  gameId: string
}

type Props = ExternalProps & {
  redirectToInbox: boolean
  drawing: Drawing
  label: string
  onSubmit: () => void
  onChange: (turn: Turn) => void
  hideDialog: () => void
  showBrushSizeDialog: () => void
  showBrushColorDialog: () => void
  showBackgroundColorDialog: () => void
};

const DrawComponent = (props: Props) =>
  props.redirectToInbox == true ?
      (<Redirect to="/" />) :
      (
        <div style={{flex: '1 1', display: 'flex', flexDirection: 'column'}}>
          <Draw {...props} />
          <Switch>
            <Route path='/draw/:id/brush/size'>
              <Dialog open onRequestClose={props.hideDialog}>
                <DialogContent>
                  BRUSH SIZE
                </DialogContent>
              </Dialog>
            </Route>
            <Route path='/draw/:id/brush/color'>
              <Dialog open onRequestClose={props.hideDialog}>
                <DialogContent>
                  BRUSH COLOR
                </DialogContent>
              </Dialog>
            </Route>
            <Route path='/draw/:id/bg/color'>
              <Dialog open onRequestClose={props.hideDialog}>
                <DialogContent>
                  BG COLOR
                </DialogContent>
              </Dialog>
            </Route>
          </Switch>
        </div>
      );

function mapStateToProps(
    {entities: {inbox}, ui: {outbox}}: State, {gameId}: ExternalProps) {
  const previous = inbox[gameId].previous_turn;
  if (!previous || previous.is_drawing) {
    return {redirectToInbox: true} as Props;
  }
  const current = outbox[gameId] || ({} as Turn);
  const drawing = drawingOrDefault(current);
  const label = labelOrDefault(previous);
  return { redirectToInbox: false, label, drawing } as Props;
};

const mapDispatchToProps = (dispatch: Dispatch<State>, {gameId}: ExternalProps) => ({
  onChange: (turn: Turn) => dispatch(updateOutbox(gameId, turn)),
  hideDialog: () => dispatch(push(`/draw/${gameId}`)),
  showBrushSizeDialog: () => dispatch(push(`/draw/${gameId}/brush/size`)),
  showBrushColorDialog: () => dispatch(push(`/draw/${gameId}/brush/color`)),
  showBackgroundColorDialog: () => dispatch(push(`/draw/${gameId}/bg/color`)),
});

const DrawReply = connect(mapStateToProps, mapDispatchToProps)(DrawComponent);

export default DrawReply;
