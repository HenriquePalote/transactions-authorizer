/* eslint-disable @typescript-eslint/no-var-requires */
const cluster = require('cluster');
const os = require('node:os');
import * as process from 'node:process';

const numCPUs = os.availableParallelism();

export class ClusterService {
  static async clusterize(callback: () => Promise<void>) {
    if (cluster.isPrimary) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    } else {
      await callback();
      console.log(`CHILD SERVER (${process.pid}) IS RUNNING `);
    }
  }
}
