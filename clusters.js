const cluster = require('cluster');
const os = require('os');

const cpus = os.cpus();

if (cluster.isMaster) {
  cpus.forEach(() => {
    cluster.fork();
  });

  cluster.on('listening', worker => {
    console.log('Cluster %d connected', worker.process.pid);
  });

  cluster.on('disconnect', worker => {
    console.log('Cluster %d disconnected', worker.process.pid);
  });

  cluster.on('exit', worker => {
    console.log('Cluster %d exited', worker.process.pid);
    cluster.fork();
  });
} else {
  require('./index.js');
}