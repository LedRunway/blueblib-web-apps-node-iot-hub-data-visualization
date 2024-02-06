/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = [];
      this.temperatureData = [];
      this.humidityData = [];
      this.accelXData = [];
      this.accelYData = [];
      this.accelZData = [];
    }
  
    addData(time, temperature, humidity, accelX, accelY, accelZ) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);
      this.accelXData.push(accelX || null);
      this.accelYData.push(accelY || null);
      this.accelZData.push(accelZ || null);
  
      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
        this.accelXData.shift();
        this.accelYData.shift();
        this.accelZData.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'AccelX',
        yAxisID: 'AccelX',
        borderColor: 'rgba(0, 204, 0, 1)',
        pointBoarderColor: 'rgba(0, 204, 0, 1)',
        backgroundColor: 'rgba(0, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(0, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(0, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'AccelY',
        yAxisID: 'AccelY',
        borderColor: 'rgba(150,  190, 0, 1)',
        pointBoarderColor: 'rgba(150,  190, 0, 1)',
        backgroundColor: 'rgba(150,  190, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(150,  190, 0, 1)',
        pointHoverBorderColor: 'rgba(150,  190, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'AccelZ',
        yAxisID: 'AccelZ',
        borderColor: 'rgba(200, 180, 0, 1)',
        pointBoarderColor: 'rgba(200, 180, 0, 1)',
        backgroundColor: 'rgba(200, 180, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(200, 180, 0, 1)',
        pointHoverBorderColor: 'rgba(200, 180, 0, 1)',
        spanGaps: true,
      },
    ]
  };


  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
        ticks: {
          suggestedMin: 15,
          suggestedMax: 35,
          beginAtZero: true
        }},
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'left',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }},
      {
        id: 'AccelX',
        type: 'linear',
        scaleLabel: {
          labelString: 'AccelX',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }},
      {
        id: 'AccelY',
        type: 'linear',
        scaleLabel: {
          labelString: 'AccelY',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }},
      {
        id: 'AccelZ',
        type: 'linear',
        scaleLabel: {
          labelString: 'AccelZ',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.temperatureData;
    chartData.datasets[1].data = device.humidityData;
    chartData.datasets[2].data = device.accelXData;
    chartData.datasets[3].data = device.accelYData;
    chartData.datasets[4].data = device.accelZData;

    console.log('## chartData');
    console.log(chartData);

    myLineChart.update();
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    console.log('## onmwebSocket.onmessageessage');
    try {
      console.log('## on message before parse: %s', message.data)
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
        console.log('#### chart: ignore. ');
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        console.log('## existingDeviceData');
        console.log('## existingDeviceData. %i, %i, %i, %i, %i', messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.accelx, messageData.IotData.accely, messageData.IotData.accelz);
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.accelx, messageData.IotData.accely, messageData.IotData.accelz);
        console.log('## addData');
      } else {
        console.log('## newDeviceData');
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.accelx, messageData.IotData.accely, messageData.IotData.accelz);
        console.log('## addData');

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);
        console.log('## appendChild');

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          console.log('## gonna OnSelectionChange');
          OnSelectionChange();
          console.log('## OnSelectionChange');
        }
      }
      console.log('##');
      console.log(existingDeviceData);

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  };
});
