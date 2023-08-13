const db = require("../models");
const WebSocket = require('ws');
const axios = require('axios');

const API_URL = 'https://livethreatmap.radware.com/api/map/attacks?limit=10';

const wss = new WebSocket.Server({ noServer: true });

// Refactored refactoreMe1 function
exports.refactoreMe1 = async (req, res) => {
  try {
    const [data, _] = await db.sequelize.query(`SELECT * FROM "surveys"`);
    const indexTotals = Array.from({ length: 10 }, (_, index) =>
      data.map((e) => e.values[index]).reduce((a, b) => a + b, 0) / 10
    );

    res.status(200).send({
      statusCode: 200,
      success: true,
      data: indexTotals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      statusCode: 500,
      message: "Internal server error.",
      success: false,
    });
  }
};

// Refactored refactoreMe2 function
exports.refactoreMe2 = async (req, res) => {
  try {
    const { userId, values, id } = req.body;

    const survey = await Survey.create({
      userId,
      values,
    });

    await User.update(
      {
        dosurvey: true,
      },
      {
        where: { id },
      }
    );

    console.log("Survey and user updated successfully.");

    res.status(201).send({
      statusCode: 201,
      message: "Survey sent successfully!",
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      statusCode: 500,
      message: "Cannot post survey.",
      success: false,
    });
  }
};

wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const fetchInterval = setInterval(fetchData, 3 * 60 * 1000); // Fetch every 3 minutes

  ws.on('close', () => {
    console.log('WebSocket disconnected');
    clearInterval(fetchInterval);
  });
});

exports.callmeWebSocket = (req, res, server) => {
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
};

async function fetchDataAndStore() {
  try {
    const response = await fetch('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = await response.json();

    for (const item of data) {
      const query = `
        INSERT INTO attacks (destination_country, source_country, attack_type)
        VALUES ($1, $2, $3)
      `;
      await pool.query(query, [item.destinationCountry, item.sourceCountry, item.type]);
    }

    console.log('Data fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}

fetchDataAndStore();

exports.getData = (req, res) => {
  // do something

    try {
      const query = `
        SELECT source_country, attack_type, COUNT(*) as total
        FROM attacks
        GROUP BY source_country, attack_type
      `;
      const result =  pool.query(query);
  
      const response = {
        success: true,
        statusCode: 200,
        data: {
          label: [],
          total: [],
        },
      };
  
      for (const row of result.rows) {
        response.data.label.push(`${row.source_country}-${row.attack_type}`);
        response.data.total.push(row.total);
      }
  
      res.json(response);
    } catch (error) {
      console.error('Error getting data:', error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal Server Error',
      });
    }
  };
