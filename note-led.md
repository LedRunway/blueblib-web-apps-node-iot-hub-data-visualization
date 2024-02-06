led@led-hp:~$ az login --tenant 75ccdd93-9f25-4e5b-aa14-a965929b046a^C
led@led-hp:~$ vim azlogin.txt
led@led-hp:~$ az iot hub consumer-group create --hub-name iot-hub-nord --name iot-hub-nord-consm-grp
{
  "etag": null,
  "id": "/subscriptions/54cd8927-e611-4f56-9811-435bbcb02171/resourceGroups/rg-iot-hub-nord/providers/Microsoft.Devices/IotHubs/iot-hub-nord/eventHubEndpoints/events/ConsumerGroups/iot-hub-nord-consm-grp",
  "name": "iot-hub-nord-consm-grp",
  "properties": {
    "created": "Sat, 27 Jan 2024 08:34:28 GMT",
    "properties": {
      "name": "iot-hub-nord-consm-grp"
    }
  },
  "resourceGroup": "rg-iot-hub-nord",
  "type": "Microsoft.Devices/IotHubs/EventHubEndpoints/ConsumerGroups"
}
led@led-hp:~$ az iot hub connection-string show --hub-name iot-hub-nord --policy-name service
{
  "connectionString": "HostName=iot-hub-nord.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=AijpbCQy/DctQjfhs6U3y0FhIPBwgY4CeAIoTKBQpkA="
}


# What gets received:
## of iot-middleware-sample
led@led-hp:~/repo/web-apps-node-iot-hub-data-visualization$ npm start

> webapp@0.0.1 start /home/led/repo/web-apps-node-iot-hub-data-visualization
> node server.js

Using IoT Hub connection string [HostName=iot-hub-nord.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=AijpbCQy/DctQjfhs6U3y0FhIPBwgY4CeAIoTKBQpkA=]
iot-hub-nord-consm-grp
Using event hub consumer group [iot-hub-nord-consm-grp]
Listening on 3000.
Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.
The partition ids are:  [ '0', '1' ]
Broadcasting data {"IotData":{"type":"Buffer","data":[72,101,108,108,111,32,87,111,114,108,100,32,58,32,48,32,33]},"MessageDate":"2024-02-04T15:53:54.623Z","DeviceId":"freertos-virt-linux"}
Broadcasting data {"IotData":{"type":"Buffer","data":[72,101,108,108,111,32,87,111,114,108,100,32,58,32,49,32,33]},"MessageDate":"2024-02-04T15:53:58.826Z","DeviceId":"freertos-virt-linux"}
Broadcasting data {"IotData":{"type":"Buffer","data":[72,101,108,108,111,32,87,111,114,108,100,32,58,32,50,32,33]},"MessageDate":"2024-02-04T15:54:02.905Z","DeviceId":"freertos-virt-linux"}
^C

## of iot-middleware-sample-pnp
Broadcasting data {"IotData":{"temperature":22},"MessageDate":"2024-02-04T16:19:39.661Z","DeviceId":"freertos-virt-linux"}
Broadcasting data {"IotData":{"temperature":0},"MessageDate":"2024-02-04T16:19:44.067Z","DeviceId":"freertos-virt-linux"}
Broadcasting data {"IotData":{"temperature":0},"MessageDate":"2024-02-04T16:19:48.364Z","DeviceId":"freertos-virt-linux"}