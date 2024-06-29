#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const char *ssid = "Tan123";
const char *password = "223344huy";

// SSE server URL
const char *sseServerUrl = "http://10.0.0.50:5000/listen?apiKey=apikey1&id=room1";

void setup()
{
    Serial.begin(115200);
    delay(10);

    lcd.init();
    lcd.backlight();

    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20)
    {
        delay(500);
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {

        delay(2000);
        lcd.clear();
        lcd.print("WiFi Connected");
        delay(2000);
        lcd.clear();
    }
    else
    {

        lcd.clear();
        lcd.print("WiFi Fail");
        return;
    }
}

void scrollText(const String &text, int row)
{
    int length = text.length();
    if (length <= 16)
    {
        lcd.setCursor(0, row);
        lcd.print(text);
    }
    else
    {
        for (int i = 0; i < length - 16 + 1; i++)
        {
            lcd.setCursor(0, row);
            lcd.print(text.substring(i, i + 16));
            delay(250);
        }
    }
}

void loop()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        http.begin(sseServerUrl);

        int httpCode = http.GET();
        WiFiClient *stream = http.getStreamPtr();

        while (http.connected() && stream->available())
        {
            String line = stream->readStringUntil('\n');

            lcd.clear();
            scrollText(line, 0);
            delay(10000);
        }

        http.end();
    }
    else
    {
        lcd.clear();
        lcd.print("WiFi not connected!");
    }

    delay(10000);
}
