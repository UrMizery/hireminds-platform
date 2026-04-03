'use client'

import { useState } from 'react'

type FormState = {
  organization_name: string
  contact_name: string
  title: string
  email: string
  phone: string
  organization_type: string
  population_served: string
  estimated_participant_volume: string
  needs: string
  wants_dashboard: boolean
  wants_workshops: boolean
  message: string
}

const initialState: FormState = {
  organization_name: '',
  contact_name: '',
  title: '',
  email: '',
  phone: '',
  organization_type: '',
  population_served: '',
  estimated_participant_volume: '',
  needs: '',
  wants_dashboard: false,
  wants_workshops: false,
  message: '',
}

export default function PartnerInquiryForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/partner-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit form.')
      }

      setSuccess(true)
      setForm(initialState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book a Partner Demo</h2>
        <p className="mt-2 text-sm text-gray-600">
          Tell us a little about your organization and how you’d like to use HireMinds.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Thank you. Your partner inquiry was submitted successfully.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Organization Name *
          </label>
          <input
            type="text"
            name="organization_name"
            value={form.organization_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contact Name *
          </label>
          <input
            type="text"
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Organization Type
          </label>
          <select
            name="organization_type"
            value={form.organization_type}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          >
            <option value="">Select one</option>
            <option value="Workforce Development Organization">Workforce Development Organization</option>
            <option value="Nonprofit">Nonprofit</option>
            <option value="School or College">School or College</option>
            <option value="Reentry Program">Reentry Program</option>
            <option value="Veteran-Serving Organization">Veteran-Serving Organization</option>
            <option value="Community-Based
