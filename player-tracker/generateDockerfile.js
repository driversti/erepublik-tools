// generateDockerfile.js

const fs = require('fs');
const packageJson = require('./package.json');

const dockerfileTemplate = `
FROM node:20
LABEL author="driversti"
LABEL profile="https://www.erepublik.com/en/citizen/profile/4690052"
LABEL version="${packageJson.version}"
LABEL description="Tracks player's location and online status sending them in a Telegram channel."

WORKDIR /app
COPY ./dist/bundle.js /app
COPY ./entrypoint.sh /app

RUN chmod +x /app/entrypoint.sh

VOLUME /app/data

ENTRYPOINT ["./entrypoint.sh"]
`;

fs.writeFileSync('Dockerfile', dockerfileTemplate);
