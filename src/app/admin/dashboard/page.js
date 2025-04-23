"use client";

import { useState, useEffect } from "react";
import AuthCheck from "../components/auth-check";
import Card from "../components/card";
import { getDashboard } from "../services";

export default function AdminDashboard() {


  return (
    <AuthCheck>
      <h1>Admin Dashboard</h1>
    </AuthCheck>
  );
}
