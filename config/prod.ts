import functions = require('firebase-functions');

export default {
  db: {
    database: 'pifuxelck',
    socketPath: '/cloudsql/custom-router-762:us-central1:pifuxelck2',
    user: 'pifuxelck',
  },
  mail: {
    apiKey: functions.config().mailgun['api-key'],
    domain: 'm.everythingissauce.com',
  },
};
