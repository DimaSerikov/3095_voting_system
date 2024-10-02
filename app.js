const express = require('express');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;

app.use(express.json());
app.use(express.static('public'))

const votingVariants = [
  {code: 'FF0000', text: 'Red'},
  {code: '008000', text: 'Green'},
  {code: '0000FF', text: 'Blue'},
  {code: 'FFA500', text: 'Orange'},
];

const votes = {
  'FF0000': 0,
  '008000': 0,
  '0000FF': 0,
  'FFA500': 0
};

app.get('/variants', (req, res) => {
  res.json(votingVariants);
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

  votes[voteCode]++;
  res.status(200).json({ message: 'Vote received' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname  + '/public/index.html')
});

app.listen(port, hostname, () => {
  console.log(`Server is running on port http://localhost:${port}`)
});