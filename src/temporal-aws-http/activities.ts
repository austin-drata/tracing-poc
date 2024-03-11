import axios from 'axios';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

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

    const dynamoClient = new DynamoDBClient({ region: 'us-west-2' });
    const command2 = new ListTablesCommand({});
    const res2 = await dynamoClient.send(command2);
    console.log('aws dynamo response');
    console.log(res2);
  return `Hello, ${name}!`;
}


export async function greet2(name: string): Promise<string> {

    const dynamoClient = new DynamoDBClient({ region: 'us-west-2' });
    const command2 = new ListTablesCommand({});
    const res2 = await dynamoClient.send(command2);
    console.log('aws dynamo response');
    console.log(res2);
  return `Hello, ${name}!`;
}


// export async function greet3(name: string): Promise<string> {

//     const dynamoClient = new RDSClient({ region: 'us-west-2' });
//     const command2 = new ListTablesCommand({});
//     const res2 = await dynamoClient.send(command2);
//     console.log('aws dynamo response');
//     console.log(res2);
//   return `Hello, ${name}!`;
// }


// export async function greet4(name: string): Promise<string> {

//     const dynamoClient = new DynamoDBClient({ region: 'us-west-2' });
//     const command2 = new ListTablesCommand({});
//     const res2 = await dynamoClient.send(command2);
//     console.log('aws dynamo response');
//     console.log(res2);
//   return `Hello, ${name}!`;
// }

