"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type AccessMethod = "subscription" | "referral";

export default function SignupPage() {
  const [accessMethod, setAccessMethod] =
    useState<AccessMethod | null>(null);

  const [referralCode, setReferralCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function clearMessage() {
    setMessage("");
  }

  function chooseAccess(method: AccessMethod) {
    clearMessage();
    setAccessMethod(method);
  }

  async function validateReferralCode(code: string) {
    const response = await fetch(
      "/api/access/validate-referral",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      }
    );

    const raw = await response.text();

    let data: {
      valid?: boolean;
      code?: string;
      expiresAt?: string | null;
      message?: string;
    } = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data.valid) {
      throw new Error(
        data.message ||
          "This referral code is not active or available. Please check the code and try again."
      );
    }

    return data;
  }

  async function createReferralAccount({
    normalizedReferralCode,
    firstName: submittedFirstName,
    lastName: submittedLastName,
    phone: submittedPhone,
    city: submittedCity,
    stateName: submittedStateName,
    email: submittedEmail,
    password: submittedPassword,
  }: {
    normalizedReferralCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    stateName: string;
    email: string;
    password: string;
