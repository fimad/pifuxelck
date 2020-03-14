import * as winston from 'winston';

import config from '../../config/test';
import server from '../server/server';

const port = 3001;
const app = server(config);
app.listen(port, () => winston.info(`App running on port ${port}`));
