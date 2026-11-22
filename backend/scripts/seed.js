import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User, UserPreference } from '../models/User.js';
import { Provider, City, Location, Stop, Route, Trip, Vehicle } from '../models/Transport.js';
import { GtfsFeed } from '../models/Gtfs.js';
import { Booking } from '../models/Operations.js';

export const seedDatabase = async () => {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);

  try {
    await mongoose.connection.collection('users').dropIndexes();
  } catch (e) {
    // ignore
  }

  console.log('[Seed] Seeding Initial Users & Passengers...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@TransitChain2026!', salt);
  const passengerPasswordHash = await bcrypt.hash('Passenger@TransitChain2026!', salt);

  // Admin User
  let admin = await User.findOne({ email: 'admin@transitchain.com' });
  if (!admin) {
    admin = await User.create({
      name: 'TransitChain Administrator',
      email: 'admin@transitchain.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true
    });
    await UserPreference.create({ userId: admin._id });
    console.log('[Seed] Admin user created: admin@transitchain.com');
  }

  // Passenger User
  let passenger = await User.findOne({ email: 'passenger@transitchain.com' });
  if (!passenger) {
    passenger = await User.create({
      name: 'Ravi Kumar (Passenger)',
      email: 'passenger@transitchain.com',
      passwordHash: passengerPasswordHash,
      role: 'passenger',
      isVerified: true
    });
    await UserPreference.create({ userId: passenger._id });
    console.log('[Seed] Passenger created: passenger@transitchain.com');
  }

  // Also support user@transitchain.com
  let userDemo = await User.findOne({ email: 'user@transitchain.com' });
  if (!userDemo) {
    userDemo = await User.create({
      name: 'Demo Passenger',
      email: 'user@transitchain.com',
      passwordHash: passengerPasswordHash,
      role: 'passenger',
      isVerified: true
    });
    await UserPreference.create({ userId: userDemo._id });
  }

  console.log('[Seed] Seeding Pan-India States & Major Cities...');
  const nationwideCities = [
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
    { name: 'Chandigarh', state: 'Punjab & Haryana', lat: 30.7333, lon: 76.7794 },
    { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
    { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 }
  ];

  const cityMap = {};
  for (const c of nationwideCities) {
    let city = await City.findOne({ name: c.name });
    if (!city) {
      city = await City.create({
        name: c.name,
        state: c.state,
        country: 'India',
        centerCoordinates: { lat: c.lat, lon: c.lon },
        active: true
      });
    }
    cityMap[c.name] = city;
  }

  console.log('[Seed] Seeding State Transport Corporations & Metro Operators...');
  const nationwideProviders = [
    // Telangana
    {
      name: 'Telangana State Road Transport Corporation',
      code: 'TGSRTC',
      transportModes: ['bus'],
      contactEmail: 'support@tgsrtc.telangana.gov.in',
      coverageArea: 'Telangana & Hyderabad Metropolitan Region',
      feedKey: 'tgsrtc'
    },
    {
      name: 'Hyderabad Metro Rail Limited',
      code: 'HMRL',
      transportModes: ['metro'],
      contactEmail: 'contact@ltmetro.com',
      coverageArea: 'Hyderabad Metro Rail Network',
      feedKey: 'hmrl'
    },
    // Karnataka
    {
      name: 'Bangalore Metropolitan Transport Corporation',
      code: 'BMTC',
      transportModes: ['bus'],
      contactEmail: 'contact@mybmtc.com',
      coverageArea: 'Bengaluru Urban & Rural',
      feedKey: 'bmtc'
    },
    {
      name: 'Bangalore Metro Rail Corporation Limited',
      code: 'BMRCL',
      transportModes: ['metro'],
      contactEmail: 'travelhelp@bmrc.co.in',
      coverageArea: 'Namma Metro Bengaluru Network',
      feedKey: 'bmrcl'
    },
    // Maharashtra
    {
      name: 'Brihanmumbai Electric Supply & Transport',
      code: 'BEST',
      transportModes: ['bus'],
      contactEmail: 'customercare@bestundertaking.com',
      coverageArea: 'Mumbai, Thane & Navi Mumbai',
      feedKey: 'best'
    },
    {
      name: 'Mumbai Metro Rail Corporation',
      code: 'MMRC',
      transportModes: ['metro'],
      contactEmail: 'contact@mmrcl.com',
      coverageArea: 'Mumbai Metropolitan Region Metro Lines',
      feedKey: 'mmrc'
    },
    // Delhi NCR
    {
      name: 'Delhi Transport Corporation',
      code: 'DTC',
      transportModes: ['bus'],
      contactEmail: 'support@dtc.delhi.gov.in',
      coverageArea: 'National Capital Territory of Delhi',
      feedKey: 'dtc'
    },
    {
      name: 'Delhi Metro Rail Corporation',
      code: 'DMRC',
      transportModes: ['metro'],
      contactEmail: 'helpline@dmrc.org',
      coverageArea: 'Delhi, Noida, Gurgaon, Ghaziabad & Faridabad',
      feedKey: 'dmrc'
    },
    // Tamil Nadu
    {
      name: 'Metropolitan Transport Corporation Chennai',
      code: 'MTC',
      transportModes: ['bus'],
      contactEmail: 'helpdesk@mtcbus.org',
      coverageArea: 'Chennai Metropolitan Area',
      feedKey: 'mtc'
    },
    {
      name: 'Chennai Metro Rail Limited',
      code: 'CMRL',
      transportModes: ['metro'],
      contactEmail: 'feedback@cmrl.in',
      coverageArea: 'Chennai Metro Corridors',
      feedKey: 'cmrl'
    },
    // West Bengal
    {
      name: 'West Bengal Transport Corporation',
      code: 'WBTC',
      transportModes: ['bus', 'tram'],
      contactEmail: 'feedback@wbtc.co.in',
      coverageArea: 'Kolkata & Howrah',
      feedKey: 'wbtc'
    },
    {
      name: 'Kolkata Metro Rail Corporation',
      code: 'KMRC',
      transportModes: ['metro'],
      contactEmail: 'contact@kmrc.in',
      coverageArea: 'Kolkata Metro East-West & North-South',
      feedKey: 'kmrc'
    },
    // Kerala
    {
      name: 'Kerala State Road Transport Corporation',
      code: 'KSRTC_KL',
      transportModes: ['bus'],
      contactEmail: 'controlroom@keralartc.com',
      coverageArea: 'Kerala State Network & Inter-City',
      feedKey: 'ksrtc_kl'
    },
    {
      name: 'Kochi Metro Rail Limited',
      code: 'KMRL',
      transportModes: ['metro'],
      contactEmail: 'contact@kochimetro.org',
      coverageArea: 'Kochi Urban Water & Rail Transit',
      feedKey: 'kmrl'
    },
    // Gujarat
    {
      name: 'Ahmedabad Municipal Transport Service',
      code: 'AMTS',
      transportModes: ['bus'],
      contactEmail: 'amts@ahmedabadcity.gov.in',
      coverageArea: 'Ahmedabad City',
      feedKey: 'amts'
    },
    {
      name: 'Gujarat Metro Rail Corporation',
      code: 'GMRC',
      transportModes: ['metro'],
      contactEmail: 'contact@gujaratmetrorail.com',
      coverageArea: 'Ahmedabad & Gandhinagar Metro',
      feedKey: 'gmrc'
    },
    // Uttar Pradesh
    {
      name: 'Uttar Pradesh State Road Transport Corporation',
      code: 'UPSRTC',
      transportModes: ['bus'],
      contactEmail: 'info@upsrtc.com',
      coverageArea: 'Uttar Pradesh & Inter-State Corridors',
      feedKey: 'upsrtc'
    },
    {
      name: 'Uttar Pradesh Metro Rail Corporation',
      code: 'UPMRC',
      transportModes: ['metro'],
      contactEmail: 'feedback@upmetrorail.com',
      coverageArea: 'Lucknow, Kanpur & Agra Metro',
      feedKey: 'upmrc'
    },
    // Rajasthan
    {
      name: 'Rajasthan State Road Transport Corporation',
      code: 'RSRTC',
      transportModes: ['bus'],
      contactEmail: 'helpdesk.rsrtc@rajasthan.gov.in',
      coverageArea: 'Rajasthan & National Capital Routes',
      feedKey: 'rsrtc'
    },
    // Andhra Pradesh
    {
      name: 'Andhra Pradesh State Road Transport Corporation',
      code: 'APSRTC',
      transportModes: ['bus'],
      contactEmail: 'online.support@apsrtc.gov.in',
      coverageArea: 'Andhra Pradesh State Network',
      feedKey: 'apsrtc'
    }
  ];

  const providerMap = {};
  for (const p of nationwideProviders) {
    let prov = await Provider.findOne({ code: p.code });
    if (!prov) {
      prov = await Provider.create({
        ...p,
        status: 'active',
        bookingSupported: true,
        trackingSupported: true
      });
    }
    providerMap[p.code] = prov;
  }

  // Feeds registration
  for (const p of nationwideProviders) {
    let feed = await GtfsFeed.findOne({ feedKey: p.feedKey });
    if (!feed) {
      await GtfsFeed.create({
        feedKey: p.feedKey,
        providerName: p.name,
        feedVersion: 'v2026.1',
        feedStartDate: '20260101',
        feedEndDate: '20261231',
        feedPublisherName: `${p.code} Authority`,
        status: 'active',
        isActive: true,
        recordCounts: { stops: 25, routes: 6, trips: 350, stopTimes: 2800, transfers: 12 }
      });
    }
  }

  // Stops for Hyderabad initial launch
  const initialStops = [
    { externalStopId: 'tgsrtc_indiranagar', name: 'Indira Nagar - Gachibowli Bus Stop', feedKey: 'tgsrtc', mode: 'bus', coordinates: { lat: 17.4435, lon: 78.3582 } },
    { externalStopId: 'tgsrtc_gachibowli_orr', name: 'Gachibowli ORR Junction Bus Stop', feedKey: 'tgsrtc', mode: 'bus', coordinates: { lat: 17.4401, lon: 78.3615 } },
    { externalStopId: 'tgsrtc_biodiversity', name: 'Biodiversity Park Bus Stop', feedKey: 'tgsrtc', mode: 'bus', coordinates: { lat: 17.4385, lon: 78.3789 } },
    { externalStopId: 'tgsrtc_raidurg_bus', name: 'Raidurg Bus Stop', feedKey: 'tgsrtc', mode: 'bus', coordinates: { lat: 17.4362, lon: 78.3772 } },
    { externalStopId: 'hmrl_raidurg', name: 'Raidurg Metro Station', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4374, lon: 78.3798 } },
    { externalStopId: 'hmrl_hiteccity', name: 'Hitec City Metro Station', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4474, lon: 78.3768 } },
    { externalStopId: 'hmrl_ameerpet_b', name: 'Ameerpet Metro Station (Blue Line)', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4344, lon: 78.4482 } },
    { externalStopId: 'hmrl_ameerpet_r', name: 'Ameerpet Metro Station (Red Line)', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4344, lon: 78.4482 } },
    { externalStopId: 'hmrl_kphb', name: 'KPHB Colony Metro Station', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4975, lon: 78.4014 } },
    { externalStopId: 'tgsrtc_kphb_bus', name: 'KPHB Colony Bus Stop', feedKey: 'tgsrtc', mode: 'bus', coordinates: { lat: 17.4968, lon: 78.4005 } },
    { externalStopId: 'hmrl_jntu', name: 'JNTU College Metro Station', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.5025, lon: 78.3921 } },
    { externalStopId: 'hmrl_secunderabad', name: 'Secunderabad East Metro Station', feedKey: 'hmrl', mode: 'metro', coordinates: { lat: 17.4399, lon: 78.5032 } }
  ];

  for (const s of initialStops) {
    const exists = await Stop.findOne({ feedKey: s.feedKey, externalStopId: s.externalStopId });
    if (!exists) {
      await Stop.create({
        ...s,
        providerId: s.feedKey === 'tgsrtc' ? providerMap['TGSRTC']._id : providerMap['HMRL']._id
      });
    }
  }

  // Key Locations
  const keyLocations = [
    { name: 'Indira Nagar - Gachibowli', category: 'residential', coordinates: { lat: 17.4435, lon: 78.3582 }, address: 'Near Gachibowli Stadium Road, Hyderabad, Telangana' },
    { name: 'KPHB Colony', category: 'commercial', coordinates: { lat: 17.4975, lon: 78.4014 }, address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana' },
    { name: 'Raidurg Metro Station', category: 'station', coordinates: { lat: 17.4374, lon: 78.3798 }, address: 'Hitec City Phase 2, Hyderabad, Telangana' },
    { name: 'Ameerpet Interchange Station', category: 'station', coordinates: { lat: 17.4344, lon: 78.4482 }, address: 'Ameerpet Junction, Hyderabad, Telangana' },
    { name: 'Majestic Transit Hub', category: 'transit_hub', coordinates: { lat: 12.9767, lon: 77.5713 }, address: 'Kempegowda Bus Station, Bengaluru, Karnataka' },
    { name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', category: 'transit_hub', coordinates: { lat: 18.9401, lon: 72.8354 }, address: 'Fort, Mumbai, Maharashtra' },
    { name: 'Connaught Place / Rajiv Chowk', category: 'station', coordinates: { lat: 28.6328, lon: 77.2195 }, address: 'Central Delhi, Delhi NCR' },
    { name: 'Chennai Central Station', category: 'transit_hub', coordinates: { lat: 13.0827, lon: 80.2755 }, address: 'Park Town, Chennai, Tamil Nadu' }
  ];

  for (const l of keyLocations) {
    const exists = await Location.findOne({ name: l.name });
    if (!exists) {
      await Location.create(l);
    }
  }

  // Seed sample fleet vehicles
  const initialVehicles = [
    { vehicleNumber: 'TS09-UA-1951', mode: 'bus', feedKey: 'tgsrtc', currentRouteId: 'TGSRTC-195W', status: 'in_service', lastCoordinates: { lat: 17.4421, lon: 78.3601 }, lastSpeedKmph: 34 },
    { vehicleNumber: 'TS09-UB-1952', mode: 'bus', feedKey: 'tgsrtc', currentRouteId: 'TGSRTC-195W', status: 'in_service', lastCoordinates: { lat: 17.4782, lon: 78.3912 }, lastSpeedKmph: 42 },
    { vehicleNumber: 'TS09-UC-1131', mode: 'bus', feedKey: 'tgsrtc', currentRouteId: 'TGSRTC-113', status: 'in_service', lastCoordinates: { lat: 17.4390, lon: 78.3750 }, lastSpeedKmph: 28 },
    { vehicleNumber: 'HMRL-BL-04', mode: 'metro', feedKey: 'hmrl', currentRouteId: 'HMRL-BLUE', status: 'in_service', lastCoordinates: { lat: 17.4474, lon: 78.3768 }, lastSpeedKmph: 62 },
    { vehicleNumber: 'HMRL-BL-08', mode: 'metro', feedKey: 'hmrl', currentRouteId: 'HMRL-BLUE', status: 'in_service', lastCoordinates: { lat: 17.4352, lon: 78.4410 }, lastSpeedKmph: 58 },
    { vehicleNumber: 'HMRL-RL-12', mode: 'metro', feedKey: 'hmrl', currentRouteId: 'HMRL-RED', status: 'in_service', lastCoordinates: { lat: 17.4710, lon: 78.4230 }, lastSpeedKmph: 60 }
  ];

  for (const v of initialVehicles) {
    const exists = await Vehicle.findOne({ vehicleNumber: v.vehicleNumber });
    if (!exists) {
      await Vehicle.create(v);
    }
  }

  // Seed sample bookings if none exist
  const existingBookings = await Booking.countDocuments();
  if (existingBookings === 0 && passenger) {
    await Booking.create([
      {
        bookingReference: 'TC-2026-TGSRTC-001',
        userId: passenger._id,
        providerCode: 'TGSRTC',
        routeShortName: '195W Express',
        fromStopName: 'Indira Nagar - Gachibowli Bus Stop',
        toStopName: 'KPHB Colony Bus Stop',
        departureTime: '08:30:00',
        arrivalTime: '09:12:00',
        passengerCount: 1,
        totalFare: 35,
        status: 'ticket_issued',
        ticketNumber: 'TKT-TGSRTC-88912',
        qrPayload: 'TRANSITCHAIN:TC-2026-TGSRTC-001:VERIFIED'
      },
      {
        bookingReference: 'TC-2026-HMRL-002',
        userId: passenger._id,
        providerCode: 'HMRL',
        routeShortName: 'HMRL Blue Line',
        fromStopName: 'Raidurg Metro Station',
        toStopName: 'Ameerpet Metro Station',
        departureTime: '09:45:00',
        arrivalTime: '10:05:00',
        passengerCount: 2,
        totalFare: 90,
        status: 'confirmed',
        ticketNumber: 'TKT-HMRL-44102',
        qrPayload: 'TRANSITCHAIN:TC-2026-HMRL-002:VERIFIED'
      }
    ]);
  }

  console.log('[Seed] Database initialization and Pan-India seed completed successfully!');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
