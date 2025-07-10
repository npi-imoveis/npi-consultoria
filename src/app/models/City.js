// src/app/models/City.js

import mongoose from 'mongoose';

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  
  // SEO Metadata
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
  
  // Statistics (will be computed)
  totalProperties: {
    type: Number,
    default: 0
  },
  totalActiveProperties: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'cities'
});

// Indexes for better performance (only non-unique ones)
CitySchema.index({ isActive: 1 });
CitySchema.index({ state: 1 });
CitySchema.index({ priority: -1 });

// Methods
CitySchema.methods.generateSlug = function() {
  if (!this.name) return '';
  
  return this.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
    .trim();
};

// Static methods
CitySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, isActive: true });
};

CitySchema.statics.getSlugMapping = function() {
  return this.find({ isActive: true })
    .select('name slug')
    .then(cities => {
      const mapping = {};
      cities.forEach(city => {
        mapping[city.slug] = city.name;
      });
      return mapping;
    });
};

CitySchema.statics.updatePropertyCounts = async function() {
  const cities = await this.find({ isActive: true });
  const Imovel = mongoose.model('Imovel');
  
  for (const city of cities) {
    const totalProperties = await Imovel.countDocuments({ Cidade: city.name });
    const totalActiveProperties = await Imovel.countDocuments({ 
      Cidade: city.name, 
      Status: { $ne: 'Inativo' } 
    });
    
    await this.findByIdAndUpdate(city._id, {
      totalProperties,
      totalActiveProperties
    });
  }
};

// Pre-save middleware to generate slug automatically
CitySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

// Prevent deletion, only deactivation
CitySchema.pre('remove', function(next) {
  this.isActive = false;
  this.save(next);
});

const City = mongoose.models.City || mongoose.model('City', CitySchema);

export default City;