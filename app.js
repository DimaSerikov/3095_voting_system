const express = require('express');
const fs = require('fs');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;

app.use(express.json());
app.use(express.static('public'))

const statData = './stat.json';

const initialData = {
  'FF0000': {text: 'Red', cnt: 0},
  '008000': {text: 'Green', cnt: 0},
  '0000FF': {text: 'Blue', cnt: 0},
  'FFA500': {text: 'Orange', cnt: 0},
};

let votes = {};

app.get('/results', (req, res) => {
  const data = fs.readFileSync(statData);
  const votes = JSON.parse(data);
  
  const acceptHeader = req.header('Accept');

  const formats = {
    'application/json': () => res.json(votes),
    'application/xml': () => res.set('Content-Type', 'application/xml').send(jsonToXml(votes)),
    'text/html': () => res.set('Content-Type', 'text/html').send(jsonToHtml(votes))
  };

  const formatHandler = Object.keys(formats).find(format => acceptHeader.includes(format));

  if (formatHandler) {
    return formats[formatHandler]();
  }

  return res.status(406).send('Not Acceptable');
});

app.get('/variants', (req, res) => {
  if (fs.existsSync(statData)) {
    try {
      const data = fs.readFileSync(statData, 'utf8');
      votes = JSON.parse(data);

      return res.json(votes);
    } catch (err) {
      console.error('Error while parsing JSON:', err.message);
    }
  }
  
  fs.writeFileSync(statData, JSON.stringify(initialData, null, 2));
  votes = initialData;
  return res.json(votes);
});

app.post('/stat', (req, res) => {
  res.json(votes);
});

app.post('/vote', (req, res) => {
  const voteCode = req.body.code;

  if (votes[voteCode] === undefined) {
    res.status(400).json({ message: 'Invalid vote code' });
    return;
  }

  votes[voteCode].cnt++;
  fs.writeFileSync(statData, JSON.stringify(votes, null, 2));
  res.status(200).json({ message: 'Vote received' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname  + '/public/index.html')
});

app.listen(port, hostname, () => {
  console.log(`Server is running on port http://${hostname}:${port}`)
});

function jsonToXml(votes) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<votes>\n';
  Object.entries(votes).forEach(([key, vote]) => {
    xml += `<vote>\n<code>${key}</code>\n<text>${vote.text}</text>\n<count>${vote.cnt}</count>\n</vote>\n`;
  });
  xml += `</votes>`;
  return xml;
}

function jsonToHtml(votes) {
  let html = `<html><body><h1>Results</h1><table><tr><th>Code</th><th>Text</th><th>Count</th></tr>`;
  Object.entries(votes).forEach(([key, vote]) => {
    html += `<tr><td>${key}</td><td>${vote.text}</td><td>${vote.cnt}</td></tr>`;
  });
  html += `</table></body></html>`;
  return html;
}