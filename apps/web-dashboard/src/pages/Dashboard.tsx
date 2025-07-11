import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../store";
import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const sensors = useSelector((state: RootState) => state.sensors.sensors);
  const alerts = useSelector((state: RootState) => state.alerts.alerts);
  const unreadAlertCount = useSelector(
    (state: RootState) => state.alerts.unreadCount
  );

  // Calculate statistics
  const activeSensors = sensors.filter(
    (sensor) => sensor.status === "online"
  ).length;
  const totalSensors = sensors.length;
  const temperatureSensors = sensors.filter(
    (sensor) => sensor.type === "temperature"
  );
  const moistureSensors = sensors.filter(
    (sensor) => sensor.type === "soil_moisture"
  );

  const averageTemperature =
    temperatureSensors.length > 0
      ? temperatureSensors.reduce(
          (sum, sensor) => sum + (sensor.value || 0),
          0
        ) / temperatureSensors.length
      : 0;
  const averageMoisture =
    moistureSensors.length > 0
      ? moistureSensors.reduce((sum, sensor) => sum + (sensor.value || 0), 0) /
        moistureSensors.length
      : 0;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    trend?: "up" | "down" | "stable";
    color: string;
  }> = ({ title, value, unit, icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${trend === "down" ? "rotate-180" : ""}`}
              />
              {trend === "up"
                ? "Increasing"
                : trend === "down"
                  ? "Decreasing"
                  : "Stable"}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Monitor your farm's soil conditions in real-time
          </p>
        </div>

        {unreadAlertCount > 0 && (
          <Link
            to="/alerts"
            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {unreadAlertCount} Unread Alert{unreadAlertCount !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Sensors"
          value={`${activeSensors}/${totalSensors}`}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-green-500"
          trend="stable"
        />

        <StatCard
          title="Average Temperature"
          value={averageTemperature.toFixed(1)}
          unit="°C"
          icon={<Thermometer className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          trend="up"
        />

        <StatCard
          title="Average Moisture"
          value={averageMoisture.toFixed(1)}
          unit="%"
          icon={<Droplets className="w-6 h-6 text-white" />}
          color="bg-cyan-500"
          trend="down"
        />

        <StatCard
          title="System Health"
          value="98"
          unit="%"
          icon={<Gauge className="w-6 h-6 text-white" />}
          color="bg-emerald-500"
          trend="stable"
        />
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Alerts
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      alert.type === "error"
                        ? "bg-red-500"
                        : alert.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
          {alerts.length > 5 && (
            <div className="px-6 py-3 bg-gray-50">
              <Link
                to="/alerts"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all alerts →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Sensor Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sensor Status</h2>
        </div>

        {sensors.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sensors configured yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Add sensors to start monitoring your soil conditions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {sensors.map((sensor) => (
              <Link
                key={sensor.id}
                to={`/sensors/${sensor.id}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{sensor.name}</h3>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      sensor.status === "online"
                        ? "bg-green-500"
                        : sensor.status === "error"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                  />
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">
                      {sensor.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span>
                      {sensor.value?.toFixed(1) || "--"} {sensor.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Battery:</span>
                    <span>{sensor.batteryLevel || "--"}%</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Last updated:{" "}
                  {sensor.lastReading
                    ? new Date(sensor.lastReading).toLocaleString()
                    : "Never"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
