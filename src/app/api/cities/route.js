// src/app/api/cities/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import City from '@/app/models/City';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
    
    // Build query
    const query = includeInactive ? {} : { isActive: true };
    
    // Count total documents
    const totalItems = await City.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;
    
    // If sorting by priority, add name as secondary sort
    if (sortBy === 'priority') {
      sort.name = 1;
    }
    
    // Execute query
    const cities = await City.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('name slug state region isActive priority totalProperties totalActiveProperties createdAt updatedAt');
    
    return NextResponse.json({
      status: 200,
      data: cities,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return NextResponse.json({
      status: 500,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, state, region, priority, seoTitle, seoDescription, seoKeywords } = body;
    
    if (!name || !state) {
      return NextResponse.json({
        status: 400,
        message: 'Nome e estado são obrigatórios'
      }, { status: 400 });
    }
    
    // Check if city already exists
    const existingCity = await City.findOne({ name: name.trim() });
    if (existingCity) {
      return NextResponse.json({
        status: 409,
        message: 'Cidade já existe'
      }, { status: 409 });
    }
    
    // Create new city
    const newCity = new City({
      name: name.trim(),
      state: state.trim().toUpperCase(),
      region: region?.trim(),
      priority: priority || 0,
      seoTitle,
      seoDescription,
      seoKeywords
    });
    
    // Generate slug automatically via pre-save middleware
    await newCity.save();
    
    return NextResponse.json({
      status: 201,
      message: 'Cidade criada com sucesso',
      data: newCity
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erro ao criar cidade:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        status: 409,
        message: `${field === 'slug' ? 'Slug' : 'Nome'} já existe`
      }, { status: 409 });
    }
    
    return NextResponse.json({
      status: 500,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}