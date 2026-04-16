"use client";
import { Gamepad, Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import type {
  BluetoothDevice,
  BluetoothRemoteGATTServer,
  BluetoothRemoteGATTCharacteristic,
} from "web-bluetooth";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

interface BLEDevice {
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  co2Characteristic: BluetoothRemoteGATTCharacteristic | null;
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
  acc?: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
};

export type espCo2Response = {
  co2: { ppm: number };
};

const deviceName = "Bolota Senses";
const bleService = "19b10000-e8f2-537e-4f6c-d104768a1214";
const ledCharacteristic = "19b10002-e8f2-537e-4f6c-d104768a1214";
const sensorCharacteristic = "19b10001-e8f2-537e-4f6c-d104768a1214";
const co2CharacteristicIUD = "19b10003-e8f2-537e-4f6c-d104768a1214";

type BLEControlProps = {
  onSensor: (data: espResponse) => void;
  onCo2Sensor: (data: espCo2Response) => void;
  onConnect: (mode: string) => void;
  onDisconnect: (mode: string) => void;
};

export default function BLEControl({
  onSensor,
  onCo2Sensor,
  onConnect,
  onDisconnect,
}: BLEControlProps) {
  const [bleDevice, setBleDevice] = useState<BLEDevice>({
    device: null,
    server: null,
    characteristic: null,
    co2Characteristic: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedData, setReceivedData] = useState<espResponse | null>(null);
  const [co2value, setCo2Value] = useState<number | null>(null);

  // Kept in a ref so the gattserverdisconnected closure can always access the latest device
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalDisconnectRef = useRef(false);

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
    [onSensor],
  );

  const handleCo2CharacteristicValueChanged = useCallback(
    (event: Event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      const value = characteristic.value;
      if (value) {
        // Convert the DataView to a string or number depending on your needs
        const decoder = new TextDecoder("utf-8");
        const decodedData = decoder.decode(value);
        const parsedData: espCo2Response = JSON.parse(decodedData);
        onCo2Sensor(parsedData);
        setCo2Value(parsedData.co2.ppm);
      }
    },
    [onCo2Sensor, setCo2Value],
  );

  const setupGATT = useCallback(
    async (device: BluetoothDevice) => {
      if (!device.gatt) throw new Error("GATT server not found on device");

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(bleService);

      const characteristic =
        await service.getCharacteristic(sensorCharacteristic);
      const co2Characteristic =
        await service.getCharacteristic(co2CharacteristicIUD);

      if (characteristic.properties.notify) {
        await characteristic.startNotifications();
        characteristic.addEventListener(
          "characteristicvaluechanged",
          handleCharacteristicValueChanged,
        );
      }

      if (co2Characteristic.properties.notify) {
        await co2Characteristic.startNotifications();
        co2Characteristic.addEventListener(
          "characteristicvaluechanged",
          handleCo2CharacteristicValueChanged,
        );
      }

      setBleDevice({ device, server, characteristic, co2Characteristic });
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
      onConnect("controller");

      return { server, characteristic, co2Characteristic };
    },
    [
      handleCharacteristicValueChanged,
      handleCo2CharacteristicValueChanged,
      onConnect,
    ],
  );

  const attemptReconnect = useCallback(
    async (device: BluetoothDevice) => {
      if (intentionalDisconnectRef.current) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError("Could not reconnect to device. Please pair again.");
        setIsConnected(false);
        return;
      }

      reconnectAttemptsRef.current += 1;
      setError(
        `Connection lost — reconnecting (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})…`,
      );

      await new Promise((r) => setTimeout(r, RECONNECT_DELAY_MS));

      try {
        await setupGATT(device);
        setError(null);
      } catch {
        attemptReconnect(device);
      }
    },
    [setupGATT],
  );

  const connectBLE = async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    setError(null);

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [bleService] }],
      });

      intentionalDisconnectRef.current = false;
      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        setIsConnected(false);
        setBleDevice((prev) => ({
          ...prev,
          server: null,
          characteristic: null,
          co2Characteristic: null,
        }));
        if (!intentionalDisconnectRef.current && deviceRef.current) {
          attemptReconnect(deviceRef.current);
        }
      });

      await setupGATT(device);
    } catch (err) {
      if (err instanceof Error && err.name === "NotFoundError") {
        // User cancelled the browser picker — not an error
        setError(null);
      } else {
        console.error("Bluetooth Error:", err);
        setError(err instanceof Error ? err.message : "Failed to connect");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectBLE = () => {
    intentionalDisconnectRef.current = true;
    reconnectAttemptsRef.current = 0;

    if (bleDevice.characteristic) {
      bleDevice.characteristic.removeEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged,
      );
      if (bleDevice.characteristic.properties.notify) {
        bleDevice.characteristic.stopNotifications().catch(() => {});
      }
    }

    if (bleDevice.co2Characteristic) {
      bleDevice.co2Characteristic.removeEventListener(
        "characteristicvaluechanged",
        handleCo2CharacteristicValueChanged,
      );
      if (bleDevice.co2Characteristic.properties.notify) {
        bleDevice.co2Characteristic.stopNotifications().catch(() => {});
      }
    }

    if (bleDevice.device?.gatt?.connected) {
      bleDevice.device.gatt.disconnect();
    }

    deviceRef.current = null;
    setBleDevice({
      device: null,
      server: null,
      characteristic: null,
      co2Characteristic: null,
    });
    setIsConnected(false);
    setReceivedData(null);
    setError(null);
    onDisconnect("mouse");
  };

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
    <div className="absolute top-[295px] right-0 z-90">
      <div className="mr-[10px] mt-[10px]">
        <button
          onClick={isConnected ? disconnectBLE : connectBLE}
          disabled={isConnecting}
          className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            isConnecting
              ? "Connecting…"
              : isConnected
                ? "Disconnect"
                : "Connect device"
          }
        >
          {isConnecting ? (
            <Loader2
              width={18}
              height={18}
              className="animate-spin text-gray-500"
            />
          ) : (
            <Gamepad
              width={22}
              height={22}
              strokeWidth={2.5}
              className={isConnected ? "text-green-600" : "text-gray-700"}
            />
          )}
        </button>
      </div>

      {error && (
        <div className="mr-[10px] mt-1 bg-white text-red-500 text-xs p-2 rounded shadow-md max-w-[160px]">
          {error}
        </div>
      )}

      {isConnected && bleDevice.device && (
        <div className="text-sm space-y-2 bg-white p-2 rounded shadow-md mt-12 w-48 min-h-52 mr-[10px]">
          <p className="font-medium">
            {bleDevice.device.name ?? "Unknown Device"}
          </p>
          <p>roll: {receivedData?.euler.roll}</p>
          <p>pitch: {receivedData?.euler.pitch}</p>
          <p>yaw: {receivedData?.euler.yaw}</p>
          <p>CO₂: {co2value} ppm</p>
        </div>
      )}
    </div>
  );
}
