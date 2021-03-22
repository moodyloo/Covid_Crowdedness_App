package com.example.coronavirus_journey_planner;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;
import android.net.wifi.WifiManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.ScanResult;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import android.widget.ArrayAdapter;
import android.view.View;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class WifiScannerActivity extends AppCompatActivity {

    private WifiManager wifiManager;
    private ArrayList<String> wifiList = new ArrayList<>();
    private List<ScanResult> results;
    private ArrayAdapter adapter;
    private ListView listView;
    private Button buttonScan;
    private Button buttonSend;
    private LocationManager locationManager;
    private Location currentLocation;
    private final long location_refresh_time = 15000;
    private final float location_distance = 10;
    private Socket mSocket;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        buttonScan = findViewById(R.id.scanButton);
        buttonSend = findViewById(R.id.sendButton);
        buttonScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                scanWifi();
            }
        });
        buttonSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendInfo();
            }
        });

        listView = findViewById(R.id.wifiListView);
        wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        locationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);

        try {
            mSocket = IO.socket("http://192.168.1.19:5000");
            Log.i("connection", "connection success!");

            mSocket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    mSocket.emit("foo", "hi");
                }
            }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {

                }
            });

        } catch (URISyntaxException e) {
        }


        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "To use this app, please enable location permission", Toast.LENGTH_LONG).show();
            return;
        }
        
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, location_refresh_time,
                location_distance, mLocationListener);

        if (!wifiManager.isWifiEnabled()) {
            Toast.makeText(this, "WiFi is disabled ... enabling Wi-Fi", Toast.LENGTH_LONG).show();
            wifiManager.setWifiEnabled(true);
        }

        registerReceiver(wifiReceiver, new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION));

        adapter = new ArrayAdapter<>(getApplicationContext(), android.R.layout.simple_list_item_1, wifiList);
        listView.setAdapter(adapter);
        scanWifi();
    }


    private void sendInfo() {
        JSONObject dataObject = new JSONObject();
        try {
            dataObject.put("time",currentLocation.getTime());
            dataObject.put("location",currentLocation.getLongitude()+","+currentLocation.getLatitude());
            dataObject.put("ssid",wifiManager.getConnectionInfo().getSSID());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        mSocket.emit("sendData",dataObject);
    }

    private boolean checkLocation() {
        if (locationManager.isProviderEnabled(locationManager.GPS_PROVIDER)) {
            return true;
        } else {
            Toast.makeText(this, "Location is disabled ... We need to enable it", Toast.LENGTH_LONG).show();
            return false;
        }
    }

    private boolean checkWifi() {
        if (wifiManager.isWifiEnabled()) {
            return true;
        } else {
            Toast.makeText(this,"Wifi needs to be enabled",Toast.LENGTH_LONG).show();
            return false;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        mSocket.connect();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mSocket.disconnect();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mSocket.disconnect();
    }

    private void scanWifi() {
        checkLocation();
        checkWifi();

        wifiList.clear();
        wifiManager.startScan();
        Toast.makeText(this, "Scanning WiFi ...", Toast.LENGTH_SHORT).show();
    }

    //remove duplicate wifi access points with same SSID
    private void removeDuplicates(List<ScanResult> r) {
        ArrayList<ScanResult> tempR = new ArrayList<>();

        boolean duplicate = false;
        for(int i = 0;i < r.size();i++) {
            if (tempR.size() == 0) {
                tempR.add(r.get(i));
            }

            for(int j = 0;j < tempR.size();j++) {
                if (tempR.get(j).SSID.equals(r.get(i).SSID)) {
                    duplicate = true;
                }
            }

            if (!duplicate) {
                tempR.add(r.get(i));
            } else {
                duplicate = false;
            }
        }
        results = tempR;
    }

    LocationListener mLocationListener = new LocationListener() {
        @Override
        public void onLocationChanged(final Location location) {
            currentLocation = location;
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {

        }

        @Override
        public void onProviderEnabled(String provider) {

        }

        @Override
        public void onProviderDisabled(String provider) {

        }
    };

    BroadcastReceiver wifiReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            results = wifiManager.getScanResults();
            removeDuplicates(results);

            adapter.clear();
            checkLocation();
            checkWifi();

            for (ScanResult scanResult : results) {
                adapter.add(scanResult.SSID + " - " + scanResult.capabilities + " - " + scanResult.level);
            }
        }
    };
}
