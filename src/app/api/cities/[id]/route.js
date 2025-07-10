// src/app/api/cities/[id]/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import City from '@/app/models/City';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        status: 400,
        message: 'ID inválido'
      }, { status: 400 });
    }
    
    const city = await City.findById(id);
    
    if (!city) {
      return NextResponse.json({
        status: 404,
        message: 'Cidade não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 200,
      data: city
    });
    
  } catch (error) {
    console.error('Erro ao buscar cidade:', error);
    return NextResponse.json({
      status: 500,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        status: 400,
        message: 'ID inválido'
      }, { status: 400 });
    }
    
    const { name, state, region, isActive, priority, seoTitle, seoDescription, seoKeywords } = body;
    
    // Find existing city
    const city = await City.findById(id);
    if (!city) {
      return NextResponse.json({
        status: 404,
        message: 'Cidade não encontrada'
      }, { status: 404 });
    }
    
    // Update fields
    if (name !== undefined) {
      city.name = name.trim();
      // Regenerate slug if name changed
      city.slug = city.generateSlug();
    }
    if (state !== undefined) city.state = state.trim().toUpperCase();
    if (region !== undefined) city.region = region?.trim();
    if (isActive !== undefined) city.isActive = isActive;
    if (priority !== undefined) city.priority = priority;
    if (seoTitle !== undefined) city.seoTitle = seoTitle;
    if (seoDescription !== undefined) city.seoDescription = seoDescription;
    if (seoKeywords !== undefined) city.seoKeywords = seoKeywords;
    
    await city.save();
    
    return NextResponse.json({
      status: 200,
      message: 'Cidade atualizada com sucesso',
      data: city
    });
    
  } catch (error) {
    console.error('Erro ao atualizar cidade:', error);
    
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

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        status: 400,
        message: 'ID inválido'
      }, { status: 400 });
    }
    
    // Instead of deleting, we deactivate the city
    const city = await City.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!city) {
      return NextResponse.json({
        status: 404,
        message: 'Cidade não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 200,
      message: 'Cidade desativada com sucesso',
      data: city
    });
    
  } catch (error) {
    console.error('Erro ao desativar cidade:', error);
    return NextResponse.json({
      status: 500,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}