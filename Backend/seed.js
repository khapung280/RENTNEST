require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rentnest';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample properties data
const sampleProperties = [
  {
    title: 'Modern 3 BHK House in Thamel, Kathmandu',
    type: 'house',
    location: 'Kathmandu',
    price: 25000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 2000,
    description: 'Beautiful modern house in the heart of Thamel. Perfect for families. Fully furnished with modern amenities. Close to schools, hospitals, and shopping centers. Parking available.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1568605117032-0c0316b5b0c4?w=800'
    ],
    verified: true,
    status: 'approved',
    isActive: true,
    amenities: ['Parking', 'Garden', 'Security', 'Water Supply', 'Electricity'],
    utilities: {
      water: true,
      electricity: true,
      internet: false,
      maintenance: true
    },
    houseRules: {
      petsAllowed: true,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: '10 PM - 7 AM'
    },
    nearbyPlaces: [
      { name: 'Thamel Market', type: 'market', distance: '200m' },
      { name: 'Kathmandu Hospital', type: 'hospital', distance: '1km' },
      { name: 'International School', type: 'school', distance: '500m' }
    ]
  },
  {
    title: 'Cozy 2 BHK Flat in Lakeside, Pokhara',
    type: 'flat_apartment',
    location: 'Pokhara',
    price: 18000,
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 1200,
    description: 'Spacious 2 bedroom flat with lake view. Ideal for professionals or small families. Fully furnished, modern kitchen, and balcony. Peaceful neighborhood with easy access to restaurants and shops.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    verified: true,
    status: 'approved',
    isActive: true,
    amenities: ['Balcony', 'Lake View', 'Security', 'Parking'],
    utilities: {
      water: true,
      electricity: true,
      internet: true,
      maintenance: false
    },
    houseRules: {
      petsAllowed: false,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: '11 PM - 7 AM'
    },
    nearbyPlaces: [
      { name: 'Phewa Lake', type: 'restaurant', distance: '100m' },
      { name: 'Lakeside Market', type: 'market', distance: '300m' },
      { name: 'Bus Stop', type: 'bus_stop', distance: '200m' }
    ]
  },
  {
    title: 'Affordable 1 BHK Studio in Baneshwor, Kathmandu',
    type: 'flat_apartment',
    location: 'Kathmandu',
    price: 12000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 800,
    description: 'Compact and affordable studio apartment perfect for students or working professionals. Fully furnished, includes basic amenities. Close to public transport and educational institutions.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    verified: false,
    status: 'approved',
    isActive: true,
    amenities: ['Security', 'Water Supply'],
    utilities: {
      water: true,
      electricity: true,
      internet: false,
      maintenance: false
    },
    houseRules: {
      petsAllowed: false,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: ''
    },
    nearbyPlaces: [
      { name: 'Baneshwor Bus Park', type: 'bus_stop', distance: '500m' },
      { name: 'College', type: 'school', distance: '1km' }
    ]
  },
  {
    title: 'Luxury 4 BHK House in Patan, Lalitpur',
    type: 'house',
    location: 'Lalitpur',
    price: 35000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2800,
    description: 'Spacious luxury house with modern design. Perfect for large families. Includes garden, parking for 2 cars, and all modern amenities. Located in a premium residential area.',
    image: 'https://images.unsplash.com/photo-1568605117032-0c0316b5b0c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1568605117032-0c0316b5b0c4?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    ],
    verified: true,
    status: 'approved',
    isActive: true,
    amenities: ['Parking', 'Garden', 'Security', 'Water Supply', 'Electricity', 'Internet'],
    utilities: {
      water: true,
      electricity: true,
      internet: true,
      maintenance: true
    },
    houseRules: {
      petsAllowed: true,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: '10 PM - 7 AM'
    },
    nearbyPlaces: [
      { name: 'Patan Durbar Square', type: 'restaurant', distance: '1km' },
      { name: 'Patan Hospital', type: 'hospital', distance: '2km' },
      { name: 'International School', type: 'school', distance: '1.5km' }
    ]
  },
  {
    title: 'Budget-Friendly 2 BHK Flat in Chitwan',
    type: 'flat_apartment',
    location: 'Chitwan',
    price: 15000,
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 1000,
    description: 'Affordable 2 bedroom flat in peaceful Chitwan. Great for families or professionals. Basic amenities included. Quiet neighborhood with good connectivity.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    verified: false,
    status: 'approved',
    isActive: true,
    amenities: ['Security', 'Parking'],
    utilities: {
      water: true,
      electricity: true,
      internet: false,
      maintenance: false
    },
    houseRules: {
      petsAllowed: true,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: ''
    },
    nearbyPlaces: [
      { name: 'Local Market', type: 'market', distance: '500m' },
      { name: 'Bus Stop', type: 'bus_stop', distance: '300m' }
    ]
  },
  {
    title: 'Spacious 3 BHK House in Lazimpat, Kathmandu',
    type: 'house',
    location: 'Kathmandu',
    price: 28000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 2200,
    description: 'Beautiful 3 bedroom house in prime Lazimpat area. Well-maintained, fully furnished. Perfect location with easy access to embassies, restaurants, and shopping. Secure compound with parking.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    ],
    verified: true,
    status: 'approved',
    isActive: true,
    amenities: ['Parking', 'Garden', 'Security', 'Water Supply', 'Electricity'],
    utilities: {
      water: true,
      electricity: true,
      internet: true,
      maintenance: true
    },
    houseRules: {
      petsAllowed: true,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: '10 PM - 7 AM'
    },
    nearbyPlaces: [
      { name: 'Lazimpat Market', type: 'market', distance: '300m' },
      { name: 'Hospital', type: 'hospital', distance: '1.5km' }
    ]
  }
];

// Seed function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find or create a default owner user
    let owner = await User.findOne({ email: 'owner@rentnest.com' });
    
    if (!owner) {
      owner = await User.create({
        name: 'Property Owner',
        email: 'owner@rentnest.com',
        password: 'owner123',
        accountType: 'owner',
        phone: '9841234567',
        isVerified: true,
        isActive: true
      });
    }

    // Delete all existing properties
    await Property.deleteMany({});
    console.log('Deleted existing properties');

    // Create properties one by one to ensure proper validation
    const propertiesWithOwner = sampleProperties.map(prop => {
      const propertyData = {
        title: prop.title,
        type: prop.type,
        location: prop.location,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        areaSqft: prop.areaSqft,
        description: prop.description,
        image: prop.image,
        images: prop.images,
        verified: prop.verified,
        status: prop.status,
        isActive: prop.isActive,
        amenities: prop.amenities,
        utilities: prop.utilities,
        houseRules: prop.houseRules,
        owner: owner._id,
        ownerName: owner.name,
        nearbyPlaces: prop.nearbyPlaces.map(place => ({
          name: place.name,
          type: place.type,
          distance: place.distance
        }))
      };
      return propertyData;
    });

    // Insert properties using create() for better error handling
    for (const propData of propertiesWithOwner) {
      await Property.create(propData);
    }
    
    console.log('Data Seeded Successfully');

    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seedData();
