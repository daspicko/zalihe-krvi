import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

const retrieveText = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.statusText}`);
        return;
    }

    return await response.text();
}

const retrieveDocument = async (url) => {
    const text = await retrieveText(url);
    return parse(text, 'text/html');
}

const parseStatisticsText = (tableDataText) => {
    const data = [];
    const rows = tableDataText.trim().split('\n');

    rows.forEach((row, index) => {
        if (index !== 0 && index !== rows.length - 1) { // Skip header and footer rows
            const items = row.split('|');
            data.push({
                type: items[0].trim().toUpperCase().replace('O-', '0-').replace('O+', '0+'),
                amount: parseInt(items[1].trim())
            });
        }
    });
    return data;
}

const parseStatistics = async (url) => {
    const tableDataText = await retrieveText(url);
    return parseStatisticsText(tableDataText);
}

export {
    retrieveText,
    retrieveDocument,
    parseStatistics,
    parseStatisticsText
}