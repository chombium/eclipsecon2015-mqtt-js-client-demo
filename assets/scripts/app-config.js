// mqtt broker host
host = '127.0.0.1';	

// mqtt broker port
port = 9001;

// topics to subscribe to
subscribe_topics = 'RTU/KURA/ElSubScada/LEAD1/VOLTAGE'; 

// topic to publish to
publish_topic = 'RTU/KURA/ElSubScada/LEAD1/CB1/CMD';

useTLS = false;
username = null;
password = null;
cleansession = true;

clientid = 'mqtt-js-demo-client';

debug = true;

reconnectTimeout = 2000