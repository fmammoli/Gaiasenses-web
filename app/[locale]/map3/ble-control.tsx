"use client";
import { Gamepad } from "lucide-react";
import { decode } from "punycode";
import { useState, useCallback, useRef } from "react";

interface BLEDevice {
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
}

export type espResponse = {
  quat: {
    quat_w: number | null;
    quat_x: number | null;
    quat_y: number | null;
    quat_z: number | null;
  };
  euler: {
    roll: number | null;
    pitch: number | null;
    yaw: number | null;
  };
};

const deviceName = "Bolota Senses";
const bleService = "19b10000-e8f2-537e-4f6c-d104768a1214";
const ledCharacteristic = "19b10002-e8f2-537e-4f6c-d104768a1214";
const sensorCharacteristic = "19b10001-e8f2-537e-4f6c-d104768a1214";

type BLEControlProps = {
  onSensor: (data: espResponse) => void;
  onConnect: (mode: string) => void;
  onDisconnect: (mode: string) => void;
};

export default function BLEControl({
  onSensor,
  onConnect,
  onDisconnect,
}: BLEControlProps) {
  const [bleDevice, setBleDevice] = useState<BLEDevice>({
    device: null,
    server: null,
    characteristic: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedData, setReceivedData] = useState<espResponse | null>(null);

  const handleCharacteristicValueChanged = useCallback(
    (event: Event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      const value = characteristic.value;
      if (value) {
        // Convert the DataView to a string or number depending on your needs
        const decoder = new TextDecoder("utf-8");
        const decodedData = decoder.decode(value);
        const parsedData = JSON.parse(decodedData);
        onSensor(parsedData);
        setReceivedData(parsedData);
      }
    },
    [onSensor]
  );

  const connectBLE = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [bleService], // Replace with your service UUID
          },
        ],
      });

      device.addEventListener("gattserverdisconnected", () => {
        setIsConnected(false);
        setBleDevice((prev) => ({
          ...prev,
          server: null,
          characteristic: null,
        }));
      });

      if (!device.gatt) {
        throw new Error("GATT server not found");
      }

      const server = await device.gatt.connect();

      // Get the service
      const service = await server.getPrimaryService(bleService); // Replace with your service UUID

      // Get the characteristic
      const characteristic = await service.getCharacteristic(
        sensorCharacteristic
      ); // Replace with your characteristic UUID

      // Start notifications if the characteristic supports it
      if (characteristic.properties.notify) {
        await characteristic.startNotifications();
        characteristic.addEventListener(
          "characteristicvaluechanged",
          handleCharacteristicValueChanged
        );
      }

      setBleDevice({ device, server, characteristic });
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error("Bluetooth Error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
    if (onConnect) onConnect("controller");
  }, [handleCharacteristicValueChanged, onConnect]);

  const disconnectBLE = useCallback(() => {
    if (bleDevice.characteristic?.properties.notify) {
      bleDevice.characteristic.stopNotifications();
      bleDevice.characteristic.removeEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
    }

    if (bleDevice.device && bleDevice.device.gatt?.connected) {
      bleDevice.device.gatt.disconnect();
    }

    setBleDevice({ device: null, server: null, characteristic: null });
    setIsConnected(false);
    setReceivedData(null);
    if (onDisconnect) onDisconnect("mouse");
  }, [bleDevice, handleCharacteristicValueChanged, onDisconnect]);

  // Function to manually read the characteristic value
  const readValue = useCallback(async () => {
    if (!bleDevice.characteristic) {
      setError("No characteristic available");
      return;
    }

    try {
      const value = await bleDevice.characteristic.readValue();
      const decoder = new TextDecoder("utf-8");
      const decodedData = decoder.decode(value);
      const parsedData = JSON.parse(decodedData);
      onSensor(parsedData);
      setReceivedData(parsedData);
    } catch (err) {
      console.error("Read Error:", err);
      setError(err instanceof Error ? err.message : "Failed to read value");
    }
  }, [bleDevice.characteristic, onSensor]);

  return (
    <>
      <div className="absolute top-[295px] right-0 z-10">
        <div className="mr-[10px] mt-[10px]">
          {!isConnected ? (
            <button
              onClick={connectBLE}
              className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200"
            >
              <Gamepad width={22} height={22} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={disconnectBLE}
              className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200"
            >
              <Gamepad width={22} height={22} strokeWidth={2.5} />
            </button>
          )}
        </div>
        {isConnected && bleDevice.device && (
          <div className="text-sm  h-100 space-y-2 bg-white p-2 rounded shadow-md mt-12 w-48 h-52 min-h-52">
            <p>Connected to: {bleDevice.device.name || "Unknown Device"}</p>
            <p>Device ID: {bleDevice.device.id}</p>

            {
              <>
                <p>roll:{receivedData?.euler.roll}</p>
                <p>pitch:{receivedData?.euler.pitch}</p>
                <p>yaw:{receivedData?.euler.yaw}</p>
              </>
            }
          </div>
        )}
      </div>

      <div className="p-4 border rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Bluetooth Control</h2>

        <div className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex space-x-4">
            {!isConnected ? (
              <button
                onClick={connectBLE}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Connect
              </button>
            ) : (
              <>
                <button
                  onClick={disconnectBLE}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
                <button
                  onClick={readValue}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Read Value
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
