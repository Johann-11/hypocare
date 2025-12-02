"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

// Lightweight wavy background using layered gradients to keep the soft look
export function WavyBackgroundDemo(): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layer (keeps existing feel without changing global styles) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at -10% 10%, hsl(200 100% 95%) 0%, transparent 60%), radial-gradient(900px 500px at 110% 0%, hsl(190 80% 92%) 0%, transparent 60%), radial-gradient(800px 600px at 60% 120%, hsl(210 90% 96%) 0%, transparent 65%)",
        }}
      />

      {/* Top navigation */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold tracking-tight">HOWEGGE</span>
          <span className="text-xs font-semibold tracking-wide text-neutral-500">HYPOCARE</span>
        </div>
        <nav className="hidden gap-8 text-sm font-medium text-neutral-700 md:flex">
          <Link href="#home" className="hover:text-neutral-900">Home</Link>
          <Link href="#about" className="hover:text-neutral-900">Über Uns</Link>
          <Link href="#diagnostik" className="hover:text-neutral-900">Diagnostik</Link>
          <Link href="#review" className="hover:text-neutral-900">Review</Link>
          <Link href="#kontakt" className="hover:text-neutral-900">Kontakt</Link>
        </nav>
      </header>

      {/* Hero section */}
      <section id="home" className="mx-auto w-full max-w-7xl px-6 pb-10 pt-6 md:pb-16 md:pt-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Bridging institutional capital with alternative investment discovery
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-600 md:text-lg">
              Turning interest into investment by transforming how fund managers and allocators find each other.
            </p>
            <div className="mt-6">
              <Link
                href="#services"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Browse Services
              </Link>
            </div>
          </div>

          {/* Imagery circles */}
          <div className="relative mx-auto grid w-full max-w-lg grid-cols-3 grid-rows-3 gap-4 md:max-w-none">
            <div className="col-start-2 row-start-1 aspect-square rounded-full bg-teal-200/70" />
            <div className="col-start-1 row-start-2 aspect-square rounded-full bg-teal-700" />
            <div className="col-start-2 row-start-2 aspect-square rounded-full ring-8 ring-white">
              <Image
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop"
                alt="Owl"
                fill
                sizes="(min-width: 768px) 300px, 45vw"
                className="rounded-full object-cover"
              />
            </div>
            <div className="col-start-3 row-start-2 aspect-square ring-8 ring-white">
              <Image
                src="https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2?q=80&w=1200&auto=format&fit=crop"
                alt="People"
                fill
                sizes="(min-width: 768px) 300px, 45vw"
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-white/70 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-4">
          <div>
            <div className="text-4xl font-extrabold">$4B+</div>
            <div className="mt-2 text-sm text-neutral-600">
              Capital facilitated for alternative Fund
            </div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">900+</div>
            <div className="mt-2 text-sm text-neutral-600">Global Investment firms</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">45M+</div>
            <div className="mt-2 text-sm text-neutral-600">Average Ticket size</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">110+</div>
            <div className="mt-2 text-sm text-neutral-600">Cumulative years of experience</div>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section id="about" className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <h2 className="text-3xl font-extrabold tracking-tight">About the Project</h2>
        <p className="mt-4 max-w-3xl text-neutral-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </section>
    </div>
  );
}


