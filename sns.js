// required files
require('dotenv').config({ path: '/etc/webapp.env' });
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    //AWS region
  region: 'us-east-1' 
});

// Create an SNS service object
const sns = new AWS.SNS();

// This function will publish a message to the provided SNS topic

const publishToSns = async (snsMessage) => {
  // Construct the message object and convert it to a JSON string
  const messageString = JSON.stringify(snsMessage);

    const params = {
        Message: messageString,
        TopicArn: process.env.SNS_TOPIC_ARN
    };

    try {
        const publishTextPromise = await sns.publish(params).promise();
        console.log(`Message ${publishTextPromise.MessageId} sent to the topic ${params.TopicArn}`);
        return publishTextPromise;
    } catch (err) {
        console.error(err, err.stack);
        throw err;
    }
};

module.exports = { publishToSns };
