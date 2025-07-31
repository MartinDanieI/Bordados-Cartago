// netlify/functions/getProducts.js
exports.handler = async function() {
    const repoURL = 'https://api.github.com/repos/MartinDanieI/Bordados-Cartago/contents/_productos';
    const accessToken = process.env.GITHUB_TOKEN;

    try {
        const response = await fetch(repoURL, {
            headers: { 'Authorization': `token ${accessToken}` }
        });
        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: response.statusText }) };
        }
        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch products' }) };
    }
};