import axios from 'axios';

export async function greet(name: string): Promise<string> {
  await axios
    .get('https://swapi.dev/api/people/1')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
  return `Hello, ${name}!`;
}
