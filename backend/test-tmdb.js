
const https = require('https');

const apiKey = '280b6728745b5d8ff1c360e0b5ec6c4b';
const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=es-ES&page=1`;

console.log(`Testing TMDB connection with key: ${apiKey}`);
console.log(`URL: ${url}`);

https.get(url, (res) => {
  console.log('StatusCode:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        if (json.results) {
            console.log(`Success! Found ${json.results.length} movies.`);
            console.log('First movie:', json.results[0].title);
        } else {
            console.log('Error response:', json);
        }
    } catch (e) {
        console.log('Raw body:', data);
        console.error('Parse error:', e);
    }
  });

}).on('error', (e) => {
  console.error('Network error:', e);
});
