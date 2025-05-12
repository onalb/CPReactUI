const { exec } = require('child_process');

const findPortByServiceName = () => {
    const serviceName = 'cherrypick.api';
  return new Promise((resolve, reject) => {
    exec('netstat -ano', (error: Error, stdout: string, stderr: string) => {
      if (error) {
        return reject(`Error executing netstat: ${error.message}`);
      }
      if (stderr) {
        return reject(`Error: ${stderr}`);
      }

      const lines = stdout.split('\n');
      const serviceLine = lines.find(line => line.includes(serviceName));
      if (!serviceLine) {
        return reject(`Service ${serviceName} not found`);
      }

      const parts = serviceLine.trim().split(/\s+/);
      const localAddress = parts[1];
      const port = localAddress.split(':').pop();
      resolve(port);
    });
  });
};

export default findPortByServiceName;