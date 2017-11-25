const functions = require('firebase-functions');

export default {
  db: {
    socketPath: '/cloudsql/custom-router-762:us-central1:pifuxelck2',
    user: 'pifuxelck',
    database: 'pifuxelck',
  },
  mail: {
    apiKey: functions.config().mailgun.key,
    domain: 'm.everythingissauce.com',
  },
};
