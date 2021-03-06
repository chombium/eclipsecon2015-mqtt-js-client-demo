$(document).ready(function(){
	var snap = Snap("#scada");
	
	var state = '0';
	var clk = function clickHanlder(){
	    if (bbd.getState() === 0){
	        bbd.setState(1);
	        state = 'on';
	    } else {
	        bbd.setState(0);
	        state = 'off';
	    }
	    
	    timestamp = moment().format(date_format);
	    messageBody = {
	        'timestamp': timestamp,
	        'unit'     : 'CMD',
	        'value'    : state 
	    }
	    
	    setLastUpdateTime(timestamp);
	    
	    if (debug === true){
	        console.log(JSON.stringify(messageBody));
	    }
	    
        message = new Paho.MQTT.Message(JSON.stringify(messageBody));
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
                $('#mqtt-connection-status').html('Can not connect to ' + host + ':' + port);
                $('#mqtt-connection-error').html('Error message ' + message.errorMessage + ' Retrying...');
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
            $('#mqtt-connection-status').html('Can not connect to ' + host + ':' + port);
            $('#mqtt-connection-error').html('Error message ' + e.errorMessage);
            
            // TODO: handle exception
        }
    }
    
    function onConnect() {
        console.log('onConnect');
        $('#mqtt-connection-status').html('Connected to ' + host + ':' + port);
        $('#mqtt-connection-error').html('No Error');
      
        // Connection succeeded; subscribe to our topics
        topics = subscribe_topics.split(';');
        
        console.log(topics);
        for(var i = 0; i < topics.length; i++){
            console.log(topics[i]);
            client.subscribe(topics[i], {
                qos: 0,
                onSuccess: function(){
                    if (debug) {
                        console.log('sub-success');
                    }
                },
                onFailure: function(){
                    if (debug) {
                        console.log('sub-FAILED');
                    }
                },
                });
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
              console.log('message arrived -  topic: "' + topic + '"  payload: "' + payload +'"');
          }
          
          switch (topic) {
          case "SCADA/LEAD1/CB/COMMAND":
              if (payload === '1') {
                  bbd.setState(1);
              } else {
                  bbd.setState(0);
              }
          break;
          case 'RTU/KURA/ElSubScada/LEAD1/VOLTAGE':
              
              
              bbd.setLabelText('CB     ' + payload);
          break;
          default:
              console.log("No action for: " + topic)
          }
      };

      
      mqttConnect();
      
      String.prototype.splice = function( idx, rem, s ) {
    	    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
    	};
      
      function setLastUpdateTime(timestamp) {
    	  var result = timestamp.splice( 4, 0, "-" );
    	  var result = result.splice( 7, 0, "-" );
    	  var result = result.splice( 10, 0, " " );
    	  var result = result.splice( 13, 0, ":" );
    	  var result = result.splice( 16, 0, ":" );
    	  
    	  $('#last-update').html('Last update: ' + result);
      }
	
});


