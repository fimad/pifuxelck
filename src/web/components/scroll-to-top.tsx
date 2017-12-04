import * as React from 'react';
import { withRouter } from 'react-router';

interface Props {
  location: string;
  children?: any;
}

class ScrollToTop extends React.Component<Props, {}> {

  public componentDidUpdate(prevProps: Props) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  public render() {
    return this.props.children;
  }
}

export default withRouter(ScrollToTop as any);
