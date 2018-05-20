const https = require('https');
const fs = require('fs');

module.exports = app => {
  const credentials = {
    key: fs.readFileSync('bootcamp.key', 'utf8'),
    cert: fs.readFileSync('bootcamp.cert', 'utf8')
  };
  app.db.sequelize.sync().done((() => {
    https.createServer(credentials, app).listen(app.get('port'), () => {
      console.log(`Bootcamp API - port ${app.get('port')}`)
    });
  }));
};