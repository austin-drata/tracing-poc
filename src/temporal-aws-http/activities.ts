import axios from 'axios';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';

export async function greet(name: string): Promise<string> {
  const client = new S3Client({
    region: 'us-west-2',
  });
  const command = new ListBucketsCommand({});
  const res = await client.send(command);
  console.log('aws response');
  console.log(res);

  await axios
    .get('https://swapi.dev/api/people/1')
    .then(function (response) {
      // handle success
      console.log('response.status');
      console.log(response.status);
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
