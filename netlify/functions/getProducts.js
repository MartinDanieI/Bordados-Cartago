// netlify/functions/getProducts.js

exports.handler = async function(event) {
    // Revisa si la URL trae un "tiquete" (ej: ?file=camisita.md)
    const { file } = event.queryStringParameters;
    const accessToken = process.env.GITHUB_TOKEN;

    // Si hay un "tiquete", la URL busca un solo archivo. Si no, busca todos.
    const repoURL = file 
        ? `https://api.github.com/repos/MartinDanieI/Bordados-Cartago/contents/_productos/${file}`
        : 'https://api.github.com/repos/MartinDanieI/Bordados-Cartago/contents/_productos';

    try {
        const response = await fetch(repoURL, {
            headers: { 'Authorization': `token ${accessToken}` }
        });

        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: response.statusText }) };
        }
        
        // Si pedimos un solo archivo, devolvemos su contenido directamente.
        if (file) {
            const fileData = await response.json();
            // Para obtener el contenido real, necesitamos hacer otra llamada a la URL de descarga
            const contentResponse = await fetch(fileData.download_url);
            const content = await contentResponse.text();
            return { statusCode: 200, body: content };
        } 
        // Si no, devolvemos la lista de todos los archivos.
        else {
            const data = await response.json();
            return { statusCode: 200, body: JSON.stringify(data) };
        }

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch from GitHub' }) };
    }
};