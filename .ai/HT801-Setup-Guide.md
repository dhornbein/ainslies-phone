# HT801 Setup Guide for Ainslie Phone Project

This guide provides step-by-step instructions for connecting the HTMengt 2500 Analog Desk Phone to the Grandstream HT801 and a Raspberry Pi 5 running Asterisk.

## 1. Physical Hardware Connection

1.  **Phone to HT801**: Plug one end of the RJ11 telephone cable into the **Phone Port** on the HT801 and the other end into the HTMengt 2500 analog phone.
2.  **HT801 to Raspberry Pi**: Connect the Ethernet cable from the **Network Port** of the HT801 directly to the Ethernet port on the Raspberry Pi 5.
3.  **Power Up**:
    *   Connect the power adapter to the HT801 and plug it into a wall outlet.
    *   Power on the Raspberry Pi 5.

## 2. Network Configuration: Pi and HT801

For the Pi and HT801 to communicate directly, they need static IP addresses on the same subnet.

### A. Configure Raspberry Pi Static IP with NetworkManager

1.  **Open a terminal on the Raspberry Pi.**
2.  Use the `nmcli` command-line tool, which is part of NetworkManager, to configure the static IP. First, list existing connections to see if one for `eth0` already exists:
    ```bash
    nmcli connection show
    ```
3.  We will create a new, dedicated connection profile for the direct link to the HT801. This avoids modifying your existing Ethernet profiles.
    ```bash
    sudo nmcli con add type ethernet con-name 'ht801-link' ifname eth0 ip4 192.168.50.10/24
    ```
    This command does the following:
    *   `con add`: Adds a new connection.
    *   `type ethernet`: Specifies it's for an Ethernet device.
    *   `con-name 'ht801-link'`: Names the connection profile.
    *   `ifname eth0`: Assigns it to the `eth0` interface.
    *   `ip4 192.168.50.10/24`: Sets the static IPv4 address and subnet mask.

4.  Set the connection to never be the default for routing. This is important because it prevents this direct link from interfering with your regular internet access (e.g., over WiFi).
    ```bash
    sudo nmcli connection modify 'ht801-link' ipv4.never-default yes
    ```

5.  Activate the new connection profile:
    ```bash
    sudo nmcli connection up 'ht801-link'
    ```

6.  Verify the IP address is set:
    ```bash
    ip addr show eth0
    ```
    You should see `inet 192.168.50.10/24` in the output.

### B. Configure HT801 Static IP

The IVR menu for setting a static IP can be unreliable. A better method is to discover the HT801's current IP and use its web interface.

1.  **Discover the HT801's IP Address via IVR**:
    *   Pick up the handset of the connected analog phone.
    *   Dial `***` (three stars) to access the IVR menu.
    *   Dial `02` to have the current IP address announced. It will likely be something like `192.168.0.160`.

2.  **Temporarily Change the Pi's IP Address**:
    *   Modify your `ht801-link` connection on the Pi to be on the same subnet as the HT801. Replace `192.168.0.160` if the announced IP was different.
    ```bash
    sudo nmcli connection modify 'ht801-link' ipv4.addresses 192.168.0.10/24
    sudo nmcli connection up 'ht801-link'
    ```
    *   Verify the change: `ip addr show eth0`. You should now see an IP in the `192.168.0.x` range.

3.  **Access the HT801 Web GUI via SSH Port Forwarding**:
    *   Since the Pi is headless, you'll use your PC to access the HT801's web interface through an SSH tunnel.
    *   **On your PC**, open a new terminal (do not disconnect your existing SSH session to the Pi).
    *   Run the following command to forward a local port on your PC to the HT801's web server, through the Pi. Replace `192.168.0.160` if the announced IP was different.
    ```bash
    ssh -L 8080:192.168.0.160:80 drew@pi5phone
    ```
    *   Now, open a web browser **on your PC** and navigate to `http://localhost:8080`. This will show you the HT801's login page.
    *   Log in with the administrator password (default is `AvSbdMF9`).
    *   Set Password to: `Phone2Pi`

4.  **Set the Correct Static IP in the Web GUI**:
    *   Navigate to the **BASIC SETTINGS** tab.
    *   Change the IP Address from `DHCP` to **`Static IP`**.
    *   Set the following:
        *   **IP Address**: `192.168.50.20`
        *   **Subnet Mask**: `255.255.255.0`
        *   **Gateway**: `192.168.50.10`
    *   Click **Apply** and reboot the HT801 when prompted.

5.  **Revert the Pi's IP Address**:
    *   Now that the HT801 is on the correct `192.168.50.x` network, change the Pi's connection back.
    ```bash
    sudo nmcli connection modify 'ht801-link' ipv4.addresses 192.168.50.10/24
    sudo nmcli connection up 'ht801-link'
    ```

6.  **Verify Final Connectivity**:
    *   From the Pi, you should now be able to ping the HT801 at its new, permanent address:
    ```bash
    ssh -L 8080:192.168.50.20:80 drew@pi5phone
    ```
    You should receive replies.

## 3. HT801 Web Interface Configuration

Now that the HT801 has its final static IP, configure it to register with Asterisk.

1.  **Access the Web GUI via SSH Port Forwarding**:
    *   Use the same port forwarding method to access the HT801 at its new address.
    *   **On your PC**, ensure your SSH tunnel is pointing to the new IP. If the previous tunnel is still running, you may need to stop it (`Ctrl+C`) and start a new one:
    ```bash
    ssh -L 8080:192.168.50.20:80 drew@pi5phone
    ```
    *   Open a web browser **on your PC** and navigate to `http://localhost:8080`.
    *   Log in with the password you set previously (`Phone2Pi`).

2.  **Configure SIP Settings**:
    *   Navigate to the **FXS PORT1** tab.
    *   **Primary SIP Server**: Set to the Raspberry Pi's IP address: `192.168.50.10`.
    *   **SIP User ID**: `ht801-aor` (or any extension you configure in Asterisk).
    *   **Authenticate ID**: `ht801-aor`.
    *   **Authenticate Password**: Leave this field blank. We will use IP-based authentication.
    *   **Profile**: `Profile 1`.
    *   Click **Apply** at the bottom of the page.

3.  **Reboot the HT801** again if prompted.

## 4. Asterisk SIP Configuration (`pjsip.conf`)

Configure Asterisk to accept the registration from the HT801.

1.  **Edit `pjsip.conf` on the Raspberry Pi**:
    ```bash
    sudo nano /etc/asterisk/pjsip.conf
    ```
2.  **Add the following configuration**:
```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[ht801-endpoint]
type=endpoint
context=from-phone
disallow=all
allow=ulaw
direct_media=no

[ht801-aor]
type=aor
max_contacts=1
remove_existing=yes ; This helps with static IP devices

[ht801-identify]
type=identify
endpoint=ht801-endpoint
match=192.168.50.20
```
3.  Save and close the file.

## 5. Asterisk Dialplan Configuration (`extensions.conf`)

Create a simple dialplan to test the phone.

1.  **Edit `extensions.conf`**:
    ```bash
    sudo nano /etc/asterisk/extensions.conf
    ```
2.  **Add a context for the phone**:
```ini
[from-phone]
exten => _XXX,1,Answer()
same => n,Wait(1)
same => n,Playback(hello-world)
same => n,Hangup()
```
    This will answer the call, play "hello-world", and hang up when you pick up the phone.

3.  **Reload Asterisk**:
    ```bash
    sudo asterisk -rx "core reload"
    ```

## 6. Final Test

1.  **Check Registration**: In the Asterisk CLI (`sudo asterisk -rvvv`), check the endpoint status:
    ```
    pjsip show endpoints
    ```
    The `ht801-endpoint` should show as `Avail`.

2.  **Test the Phone**: Pick up the handset. You should hear the "hello-world" message.

You have now successfully connected and configured the phone, HT801, and Raspberry Pi.
