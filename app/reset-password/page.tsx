"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault();
    set
