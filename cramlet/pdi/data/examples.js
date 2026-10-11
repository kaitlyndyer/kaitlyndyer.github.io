// Shared lecture examples that questions can point to with ref: "<id>". Quizzes and exams show them in a
// collapsible "Show the example" panel, so a question never depends on remembering a lecture's code.
// Written as short skeletons (signatures only) in our own words.
window.STUDY.examples = {
  "devices-l2": {
    title: "the smart-home devices (Lecture 2 design)",
    intro: "Every device implements one big interface, and an abstract base class holds the shared code.",
    code: `interface IoTDevice {
    String identify();
    void turnOn();
    void turnOff();
    boolean isOn();
}

abstract class BaseIoTDevice implements IoTDevice {
    protected String name;
    protected boolean isOn;
    public void turnOn() { … }
    public void turnOff() { … }
    public boolean isOn() { … }
    // no identify() here
}

class Light extends BaseIoTDevice {
    protected int brightness;
    public String identify() { … }
    public int getBrightness() { … }
}
class Fan extends BaseIoTDevice        { private int speed;        public String identify() { … } }
class Thermostat extends BaseIoTDevice { private int temperature;  public String identify() { … } }

class DimmableLight extends Light {
    public String identify() { … }
    public void setBrightness(int b) { … }
}
class TunableWhiteLight extends Light {
    public String identify() { … }
    public int getColorTemperature() { … }
    public void setColorTemperature(int k) { … }
}`,
  },
  "devices-improved": {
    title: "the smart-home devices (improved design, Lecture 6)",
    intro: "Small interfaces describe what each kind of device can do, and abstract base classes share the code. Every public method comes from some interface.",
    code: `interface IoTDevice                    { String identify(); boolean isOn(); }
interface Switchable extends IoTDevice  { void turnOn(); void turnOff(); }
interface Light extends Switchable      { int getBrightness(); }
interface DimmableLight extends Light   { void setBrightness(int b); }
interface TunableLight extends Light    { int getColorTemperature(); void setColorTemperature(int k); }

abstract class BaseIoTDevice implements IoTDevice {
    public boolean isOn() { … }
}
abstract class BaseSwitchableDevice extends BaseIoTDevice implements Switchable {
    public void turnOn() { … }
    public void turnOff() { … }
}

class Thermostat extends BaseIoTDevice        { public String identify() { … } }
class Fan extends BaseSwitchableDevice         { public String identify() { … } }
class NormalLight extends BaseSwitchableDevice implements Light {
    public String identify() { … }
    public int getBrightness() { … }
}
class SimpleDimmableLight extends NormalLight implements DimmableLight {
    public void setBrightness(int b) { … }
}
class TunableWhiteLight extends SimpleDimmableLight implements TunableLight, DimmableLight {
    public int getColorTemperature() { … }
    public void setColorTemperature(int k) { … }
}`,
  },
};
