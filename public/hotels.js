import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://hotels4.p.rapidapi.com/v2/get-meta-data',
  headers: {
    'x-rapidapi-key': 'NOKEY',
    'x-rapidapi-host': 'NOHOST'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
