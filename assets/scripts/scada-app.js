$(document).ready(function(){
	var snap = Snap("#scada");
	
	var state = '0';
	var clk = function clickHanlder(){
	    if (bbd.getState() === 0){
	        bbd.setState(1);
	        state = '1';
	    } else {
	        bbd.setState(0);
	        state = '0';
	    }
	    
        message = new Paho.MQTT.Message(state);
        message.destinationName = publish_topic;
        client.send(message); 
	}
	
	var bbd = new ElSubScada_CircuitBreaker({
	    snap: snap,
	    positionX: 10,
	    positionY: 10,
	    width: 10 + ElSubScada_Dimensions.elementWidth,
	    height: 10 + ElSubScada_Dimensions.elementHeight,
	    color: "#000",
	    colorUndefined: ElSubScada_Colors.colorUndefined,
	    colorLevel: ElSubScada_Colors.color35,
	    colorFillOff: ElSubScada_Colors.colorFillInaktive,
	    state: 0,
	    labelText: 'CB',
	    clickHandler: clk,
	});
	bbd.draw();
	
	
	$('#on').click(function(){
	    bbd.setState(ElSubScada_State.ON);
	});
	$('#off').click(function(){
	    bbd.setState(ElSubScada_State.OFF);
	});
	$('#undefined').click(function(){
	    bbd.setState(ElSubScada_State.UNDEFINED);
	});
	$('#setText').keydown(function(event){
	    var keycode = (event.keyCode ? event.keyCode : event.which);
	    if(keycode == '13'){
	        console.log('eeee    ' + $('#setText').val());
	        bbd.setLabelText($('#setText').val());
	    }
	});
	
    function mqttConnect() {
        
        client = new Paho.MQTT.Client(host, Number(port),  "myclientid_" + parseInt(Math.random() * 100, 10));
        
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        
        var options = {
            timeout: 3,
            useSSL: useTLS,
            cleanSession: cleansession,
            onSuccess: onConnect,
            onFailure: function (message) {
                $('#mqtt-connection-status').val("Connection failed: " + message.errorMessage + " Retrying");
                setTimeout(mqttConnect, reconnectTimeout);
            }
        };

        if (username != null) {
            options.userName = username;
            options.password = password;
        }
        
        if (debug) {
            console.log("Host="+ host + ", port=" + port + " TLS = " + useTLS + " username=" + username + " password=" + password);
        }
       
        try {
            client.connect(options);
        } catch (e) {
            $('#mqtt-connection-status').val('Can not connect to ' + host + ':' + port);
            $('#mqtt-connection-error').val('Error message ' + e.errorMessage);
            
            // TODO: handle exception
        }
    }
    
    function onConnect() {
        $('#status').val('Connected to ' + host + ':' + port);
      
        // Connection succeeded; subscribe to our topics
        topics = subscribe_topics.split(';');
        for (var topic in topics){
            client.subscribe(topic, {qos: 0});
        }
    }
    
    function onConnectionLost(response) {
        if (response.errorCode !== 0) {
          console.log("onConnectionLost:"+response.errorMessage);
        }
          setTimeout(mqttConnect, reconnectTimeout);
          $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");

      };
      
      function onMessageArrived(message) {

          var topic = message.destinationName;
          var payload = message.payloadString;
          
          if (debug) {
              console.log("message received="+ message);
          }
      };

      
      mqttConnect();
	
});


