import Link from "next/link";

export default function PartnersPage() {
return (
<main className="min-h-screen bg-white text-black">
<section className="px-6 py-16 md:px-12 lg:px-20">
<div className="mx-auto max-w-6xl">
<div className="max-w-3xl">
<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
HireMinds for Partners
</p>

<h1 className="text-4xl font-bold leading-tight md:text-5xl">
Workforce infrastructure built for partners
</h1>

<p className="mt-6 text-lg leading-8 text-gray-700">
HireMinds helps organizations support job seekers with practical
career tools, stronger visibility into participant engagement, and
a clearer path from readiness to opportunity.
</p>

<Link
href="/partner-with-hireminds"
className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
>
Book a Demo
</Link>

<Link
href="/"
className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
>
Back to Home
</Link>
</div>
</div>
</div>
</section>

<section className="border-t border-gray-200 px-6 py-14 md:px-12 lg:px-20">
<div className="mx-auto max-w-6xl">
<h2 className="text-2xl font-bold">Who HireMinds supports</h2>
<div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
{[
"Workforce development organizations",
"Nonprofits and community-based programs",
"Reentry and justice-impacted programs",
"Veteran-serving organizations",
"Schools, colleges, and training providers",
"Career coaches, case teams, and program staff",
].map((item) => (
<div
key={item}
className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
>
<p className="font-medium">{item}</p>
</div>
))}
</div>
</div>
</section>

<section className="border-t border-gray-200 px-6 py-14 md:px-12 lg:px-20">
<div className="mx-auto max-w-6xl">
<h2 className="text-2xl font-bold">What partners gain</h2>
<div className="mt-8 grid gap-6 md:grid-cols-2">
{[
"Visibility into participant progress and engagement",
"Access to practical career tools participants can use beyond office hours",
"A stronger structure for workshops, referrals, and follow-up",
"A clearer bridge between workforce preparation and opportunity",
"Support for multilingual access and broader participant reach",
"A future-ready foundation for dashboard reporting and measurable outcomes",
].map((item) => (
<div
key={item}
className="rounded-2xl border border-gray-200 p-6 shadow-sm"
>
<p className="text-gray-800">{item}</p>
</div>
))}
</div>
</div>
</section>

<section className="border-t border-gray-200 px-6 py-14 md:px-12 lg:px-20">
<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
<div>
<h2 className="text-2xl font-bold">How HireMinds supports participants</h2>
<p className="mt-4 leading-8 text-gray-700">
Through HireMinds, participants can create a Career Passport,
build or update resumes, explore career readiness tools, and
strengthen their visibility in a way that feels practical,
flexible, and accessible.
</p>
</div>

<div>
<h2 className="text-2xl font-bold">Why HireMinds is different</h2>
<p className="mt-4 leading-8 text-gray-700">
HireMinds is more than a resume builder or a list of resources.
It is a workforce infrastructure platform designed to support
participant readiness while giving organizations better visibility
into engagement and progress.
</p>
</div>
</div>
</section>

<section className="border-t border-gray-200 px-6 py-16 md:px-12 lg:px-20">
<div className="mx-auto max-w-4xl rounded-3xl bg-blue-50 p-8 text-center md:p-12">
<h2 className="text-3xl font-bold">Ready to explore HireMinds for your organization?</h2>
<p className="mt-4 text-lg leading-8 text-gray-700">
See how HireMinds can support your participants, strengthen
visibility, and help your program extend workforce support beyond
static resources.
</p>

<div className="mt-8">
<Link
href="/contact"
className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
>
Book a Partner Demo
</Link>
</div>
</div>
</section>
</main>
);
}
