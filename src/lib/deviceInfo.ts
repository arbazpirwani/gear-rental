// Collects everything a browser will surrender without asking.
// Used by the issue-report page to fingerprint a visitor on page-load.

export interface DeviceInfo {
  userAgent: string;
  platform?: string;
  languages: string[];
  language: string;
  timezone: string;
  timezoneOffsetMinutes: number;
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number;
    orientation?: string;
  };
  viewport: { width: number; height: number };
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
  cookieEnabled: boolean;
  doNotTrack?: string | null;
  online: boolean;
  connection?: {
    effectiveType?: string;
    downlinkMbps?: number;
    rttMs?: number;
    saveData?: boolean;
    type?: string;
  };
  userAgentData?: {
    brands?: { brand: string; version: string }[];
    mobile?: boolean;
    platform?: string;
    model?: string;
    platformVersion?: string;
    architecture?: string;
    bitness?: string;
    fullVersionList?: { brand: string; version: string }[];
  };
  battery?: {
    level?: number;
    charging?: boolean;
    chargingTimeSec?: number;
    dischargingTimeSec?: number;
  };
  webdriver?: boolean;
  referrer?: string;
  pageUrl: string;
  collectedAtMillis: number;
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: NetworkInformation;
    userAgentData?: UserAgentData;
    getBattery?: () => Promise<BatteryManager>;
    webdriver?: boolean;
  };

  const info: DeviceInfo = {
    userAgent: nav.userAgent,
    platform: nav.platform,
    languages: Array.from(nav.languages ?? [nav.language]),
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      orientation: screen.orientation?.type,
    },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: nav.maxTouchPoints,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    online: nav.onLine,
    webdriver: nav.webdriver,
    referrer: document.referrer || undefined,
    pageUrl: window.location.href,
    collectedAtMillis: Date.now(),
  };

  if (nav.connection) {
    info.connection = {
      effectiveType: nav.connection.effectiveType,
      downlinkMbps: nav.connection.downlink,
      rttMs: nav.connection.rtt,
      saveData: nav.connection.saveData,
      type: nav.connection.type,
    };
  }

  if (nav.userAgentData) {
    const uad = nav.userAgentData;
    info.userAgentData = {
      brands: uad.brands,
      mobile: uad.mobile,
      platform: uad.platform,
    };
    try {
      const high = await uad.getHighEntropyValues([
        'model',
        'platformVersion',
        'architecture',
        'bitness',
        'fullVersionList',
      ]);
      info.userAgentData = {
        ...info.userAgentData,
        model: high.model,
        platformVersion: high.platformVersion,
        architecture: high.architecture,
        bitness: high.bitness,
        fullVersionList: high.fullVersionList,
      };
    } catch {
      // Some browsers gate high-entropy values behind permissions/policy.
    }
  }

  if (typeof nav.getBattery === 'function') {
    try {
      const b = await nav.getBattery();
      info.battery = {
        level: b.level,
        charging: b.charging,
        chargingTimeSec: Number.isFinite(b.chargingTime) ? b.chargingTime : undefined,
        dischargingTimeSec: Number.isFinite(b.dischargingTime) ? b.dischargingTime : undefined,
      };
    } catch {
      // Battery API is being removed from some browsers; ignore failures.
    }
  }

  return info;
}

export interface IpInfo {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string;
  source: 'ipapi' | 'ipify' | 'unknown';
}

// Public IP + geo + ISP via ipapi.co. Falls back to ipify (IP only) so we
// always have *something* even if ipapi rate-limits us.
export async function fetchIpInfo(): Promise<IpInfo> {
  try {
    const res = await fetch('https://ipapi.co/json/', { mode: 'cors' });
    if (res.ok) {
      const j = await res.json();
      if (j.ip) {
        return {
          ip: j.ip,
          city: j.city,
          region: j.region,
          country: j.country_name,
          countryCode: j.country_code,
          postal: j.postal,
          latitude: j.latitude,
          longitude: j.longitude,
          timezone: j.timezone,
          isp: j.org,
          org: j.org,
          asn: j.asn,
          source: 'ipapi',
        };
      }
    }
  } catch {
    // fall through to ipify
  }
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const j = await res.json();
      return { ip: j.ip, source: 'ipify' };
    }
  } catch {
    // both failed
  }
  return { source: 'unknown' };
}

export interface GeolocationResult {
  granted: boolean;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
  errorCode?: number;
  errorMessage?: string;
}

export function requestGeolocation(timeoutMs = 15000): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ granted: false, errorMessage: 'Geolocation API unavailable' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          granted: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        resolve({
          granted: false,
          errorCode: err.code,
          errorMessage: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

// --- minimal vendor-prefixed type shims used above ---
interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}
interface UserAgentDataBrand {
  brand: string;
  version: string;
}
interface UserAgentData {
  brands?: UserAgentDataBrand[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues(hints: string[]): Promise<{
    model?: string;
    platformVersion?: string;
    architecture?: string;
    bitness?: string;
    fullVersionList?: UserAgentDataBrand[];
  }>;
}
interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}
