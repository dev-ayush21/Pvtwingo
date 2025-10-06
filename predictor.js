const axios = require('axios');
const { generatePrediction } = require('../ml/pattern-analysis.js');

const API_BASE_URL = process.env.API_BASE_URL;

const getPrediction = async (req, res) => {
    const { game } = req.query; // e.g., 'WinGo_1M', 'WinGo_3M', 'WinGo_5M'
    const validGames = ['WinGo_1M', 'WinGo_3M', 'WinGo_5M'];

    if (!game || !validGames.includes(game)) {
        return res.status(400).json({ error: 'Invalid or missing game type specified.' });
    }

    // Fetch last 500 results by calling the API for 10 pages (50 results per page)
    const totalPagesToFetch = 10;
    const requests = [];
    for (let i = 1; i <= totalPagesToFetch; i++) {
        const url = `${API_BASE_URL}/${game}/GetHistoryIssuePage.json?page=${i}`;
        requests.push(axios.get(url, { timeout: 5000 }));
    }

    try {
        const responses = await Promise.all(requests);
        let combinedHistory = [];
        responses.forEach(response => {
            if (response.data?.result?.list) {
                combinedHistory.push(...response.data.result.list);
            }
        });
        
        const history = combinedHistory.slice(0, 500);

        if (history.length < 50) {
            return res.status(500).json({ error: 'Failed to fetch sufficient game history.' });
        }

        // Call the dedicated pattern analysis logic
        const prediction = generatePrediction(history);

        const last20Results = history.slice(0, 20).map(item => ({
            period: item.issue,
            number: item.drawNumber
        }));

        console.log(`Prediction generated for ${game}: ${prediction.color.prediction} / ${prediction.size.prediction}`);

        res.json({
            success: true,
            prediction,
            currentPeriod: history[0].issue,
            lastResults: last20Results
        });

    } catch (error) {
        console.error('Error in predictor controller:', error.message);
        res.status(500).json({ error: 'Failed to fetch or process data from the provider API.' });
    }
};

module.exports = {
    getPrediction
};