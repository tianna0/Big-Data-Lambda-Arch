'use strict';
const http = require('http');
const express = require('express');
const mustache = require('mustache');
const filesystem = require('fs');
require('dotenv').config();
const hbase = require('hbase');
const url = new URL(process.argv[3]);
const app = express();
const port = Number(process.argv[2]);

// Initialize HBase Client
var hclient = hbase({
	host: url.hostname,
	path: url.pathname || "/",
	port: url.port || (url.protocol === 'http:' ? 80 : 443),
	protocol: url.protocol.slice(0, -1),
	encoding: 'latin1',
	auth: process.env.HBASE_AUTH
});


// Helper function to convert HBase rows to a readable map
function rowToMap(row) {
	const stats = {};
	row.forEach(function (item) {
		const columnName = item['column'].split(':')[1];
		stats[columnName] = Buffer.from(item['$'], 'latin1').toString('utf8').trim();
	});
	return stats;
}


// Static files
app.use(express.static('public'));

// Home Page
app.get('/', (req, res) => {
	const template = filesystem.readFileSync('home.mustache').toString();
	const html = mustache.render(template, {});
	res.send(html);
});

// API to fetch user behavior and subscription trends
app.get('/api/user_behavior', (req, res) => {
	const userId = req.query['user_id']; // Query user_id
	if (!userId) {
		res.status(400).json({ error: 'Missing user_id in query parameters.' });
		return;
	}

	// Fetch data from HBase for the user
	hclient.table('txin_user_data_hbase').row(userId).get((err, cells) => {
		if (err) {
			console.error('Error fetching user data:', err);
			res.status(500).json({ error: 'Internal server error.' });
			return;
		}

		if (!cells || cells.length === 0) {
			res.status(404).json({ error: `No data found for user_id: ${userId}` });
			return;
		}

		const userInfo = rowToMap(cells);
		// Check if the request expects JSON or HTML
		if (req.headers.accept && req.headers.accept.includes('application/json')) {
			res.json(userInfo); // Send JSON for API clients
		} else {
			// Render an HTML template with the data
			const template = filesystem.readFileSync('user_behavior.mustache').toString();
			const html = mustache.render(template, userInfo);
			res.send(html);
		}
	});
});

app.get('/api/risk-level-results', (req, res) => {
	const riskLevel = req.query['risk_level']; // Get the risk_level query parameter

	if (!riskLevel) {
		res.status(400).send('Missing risk_level query parameter.');
		return;
	}

	// Fetch data from txin_risk_summary
	const riskSummaryPromise = new Promise((resolve, reject) => {
		hclient.table('txin_risk_summary').row(riskLevel).get((err, cells) => {
			if (err) {
				console.error('Error fetching data from txin_risk_summary:', err);
				reject('Internal server error.');
				return;
			}

			if (!cells || cells.length === 0) {
				resolve(0); // If no data, return default value 0
				return;
			}

			let summaryValue = 0;
			cells.forEach(cell => {
				if (cell.column === 'risk:count') {
					summaryValue = parseInt(Buffer.from(cell['$'], 'latin1').toString('utf8').trim(), 10);
				}
			});
			resolve(summaryValue);
		});
	});

	// Fetch data from txin_latest_risk using RowKey
	const latestRiskPromise = new Promise((resolve, reject) => {
		hclient.table('txin_latest_risk').row(riskLevel).get((err, cells) => {
			if (err) {
				console.error('Error fetching data from txin_latest_risk:', err);
				reject('Internal server error.');
				return;
			}

			if (!cells || cells.length === 0) {
				resolve(0); // If no data, return default value 0
				return;
			}

			let latestValue = 0;
			cells.forEach(cell => {
				if (cell.column === 'risk:count') {
					latestValue = parseInt(Buffer.from(cell['$'], 'latin1').toString('utf8').trim(), 10);
				}
			});
			resolve(latestValue);
		});
	});

	// Combine results from both tables
	Promise.all([riskSummaryPromise, latestRiskPromise])
		.then(([summaryValue, latestValue]) => {
			const total = summaryValue + latestValue;

			// Render the HTML template with Mustache
			const template = filesystem.readFileSync('./risk_level_result.mustache').toString();
			const html = mustache.render(template, {
				risk_level: riskLevel,
				count: total
			});

			res.send(html);
		})
		.catch(error => {
			console.error('Error combining results:', error);
			res.status(500).send('Internal server error.');
		});
});



// API to generate personalized recommendations
app.get('/api/recommendations', (req, res) => {
	const userId = req.query['user_id']; // Query user_id
	if (!userId) {
		res.status(400).json({ error: 'Missing user_id in query parameters.' });
		return;
	}

	// Fetch user recommendation data
	hclient.table('txin_user_data_hbase').row(userId).get((err, cells) => {
		if (err) {
			console.error('Error fetching recommendations:', err);
			res.status(500).json({ error: 'Internal server error.' });
			return;
		}

		if (!cells || cells.length === 0) {
			res.status(404).json({ error: `No data found for user_id: ${userId}` });
			return;
		}

		const userInfo = rowToMap(cells);
		const recommendation = userInfo['personalized_recommendation'] || 'No recommendations available.';
		// Check if the request expects JSON or HTML
		if (req.headers.accept && req.headers.accept.includes('application/json')) {
			res.json({ user_id: userId, recommendation }); // Send JSON for API clients
		} else {
			// Render an HTML template with the recommendation
			const template = filesystem.readFileSync('recommendation.mustache').toString();
			const html = mustache.render(template, {
				user_id: userId,
				recommendation: recommendation,
			});
			res.send(html);
		}
	});
});

/* Send simulated weather to kafka */

var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var kafkaClient = new kafka.KafkaClient({kafkaHost: process.argv[4]});
var kafkaProducer = new Producer(kafkaClient);

kafkaProducer.on('ready', () => {
	console.log('Kafka Producer is connected and ready.');
});

kafkaProducer.on('error', (err) => {
	console.error('Kafka Producer error:', err);
});

// API to send risk level and count to Kafka
app.get('/send-risk-to-kafka', (req, res) => {
	const riskLevel = req.query['risk_level'];
	const count = req.query['count'];

	if (!riskLevel || !count) {
		res.status(400).json({ error: 'Missing risk_level or count in query parameters.' });
		return;
	}

	const message = {
		risk_level: riskLevel,
		count: parseInt(count, 10),
		timestamp: new Date().toISOString()
	};

	kafkaProducer.send(
		[{ topic: 'txin_final', messages: JSON.stringify(message) }],
		(err, data) => {
			if (err) {
				console.error('Error sending message to Kafka:', err);
				res.status(500).json({ error: 'Failed to send data to Kafka.' });
				return;
			}
			console.log('Message sent to Kafka:', message);
			res.redirect('/risk-success.html');
		}
	);
});


app.get('/risk-success.html', (req, res) => {
	const template = filesystem.readFileSync('risk_success.mustache').toString();
	const html = mustache.render(template, { message: 'Risk Level and Count successfully sent to Kafka!' });
	res.send(html);
});


// Start the server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
