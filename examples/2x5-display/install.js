const fs = require('fs');

const service = `
[Unit]
Description=BlinkenLights
After=network.target
[Service]
Type=simple
ExecStart=${process.execPath} ${__dirname}
Restart=on-failure
[Install]
WantedBy=multi-user.target
`;

const servicename = 'blinken';

fs.writeFileSync('/etc/systemd/system/' + servicename + '.service', service);
console.log('Installed service file');
console.log('Please exec: systemctl enable ' + servicename + '; systemctl start ' + servicename);
