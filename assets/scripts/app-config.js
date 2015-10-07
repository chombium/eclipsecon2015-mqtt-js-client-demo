// mqtt broker host
host = '127.0.0.1';	

// mqtt broker port
port = 9001;

// topics to subscribe to
subscribe_topics = 'SCADA/LEAD1/CB/STATUS;SCADA/LEAD1/CB/COMMAND;SCADA/LEAD1/VOLTAGE_MEASUREMENT'; 

// topic to publish to
publish_topic = 'SCADA/LEAD1/CB/COMMAND';

useTLS = false;
username = null;
password = null;
cleansession = true;

clientid = 'mqtt-js-demo-client';

debug = true;

reconnectTimeout = 2000