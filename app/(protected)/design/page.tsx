'use client';

import { useState } from 'react';
import designTokens from '@/lib/design-tokens.json';

export default function DesignSystemPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const colors = theme === 'light' ? designTokens.color.light : designTokens.color.dark;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold font-serif text-foreground mb-2">
                MathCraft Design System
              </h1>
              <p className="text-mutedForeground">
                A comprehensive showcase of our design tokens and visual language
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-4 py-2 bg-primary text-primaryForeground rounded-md hover:opacity-90 transition-all duration-200"
            >
              Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
        </header>

        {/* Color Palette Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Color System</h2>
            <p className="text-mutedForeground">
              Cool academic blues with neutral grays, designed to emulate worksheet paper
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(colors).map(([name, color]) => (
              <div key={name} className="rounded-lg overflow-hidden border border-border shadow-sm">
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: color.value }}
                />
                <div className="p-4 bg-card">
                  <h3 className="font-medium text-cardForeground capitalize mb-1">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-mutedForeground font-mono">{color.value}</p>
                  <p className="text-xs text-mutedForeground font-mono">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Diagram Colors */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Diagram Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(designTokens.color.diagram).map(([name, color]) => (
                <div key={name} className="rounded-lg overflow-hidden border border-border shadow-sm">
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="p-4 bg-card">
                    <h3 className="font-medium text-cardForeground capitalize">
                      {name}
                    </h3>
                    <p className="text-sm text-mutedForeground font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Typography</h2>
            <p className="text-mutedForeground">
              Type scale and font families for UI chrome, worksheets, and diagrams
            </p>
          </div>

          {/* Font Families */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Font Families</h3>
            <div className="grid gap-4">
              <div className="p-6 bg-card border border-border rounded-lg">
                <p className="text-sm text-mutedForeground mb-2">Sans (UI & Body)</p>
                <p className="text-2xl" style={{ fontFamily: designTokens.typography.fontFamily.sans }}>
                  {designTokens.typography.fontFamily.sans}
                </p>
                <p className="text-base mt-4" style={{ fontFamily: designTokens.typography.fontFamily.sans }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg">
                <p className="text-sm text-mutedForeground mb-2">Serif (Worksheets & Headings)</p>
                <p className="text-2xl font-serif">
                  {designTokens.typography.fontFamily.serif}
                </p>
                <p className="text-base mt-4 font-serif">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg">
                <p className="text-sm text-mutedForeground mb-2">Mono (Code & Diagrams)</p>
                <p className="text-2xl font-mono">
                  {designTokens.typography.fontFamily.mono}
                </p>
                <p className="text-base mt-4 font-mono">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Type Scale</h3>
            <div className="p-6 bg-card border border-border rounded-lg space-y-4">
              {Object.entries(designTokens.typography.fontSize).map(([size, value]) => (
                <div key={size} className="flex items-baseline gap-4">
                  <span className="text-sm text-mutedForeground font-mono w-12">{size}</span>
                  <span
                    className="text-foreground"
                    style={{ fontSize: value.value }}
                  >
                    The quick brown fox ({value.value} / {value.px}px)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Font Weights */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Font Weights</h3>
            <div className="p-6 bg-card border border-border rounded-lg space-y-4">
              {Object.entries(designTokens.typography.fontWeight).map(([weight, value]) => (
                <div key={weight} className="flex items-baseline gap-4">
                  <span className="text-sm text-mutedForeground font-mono w-24 capitalize">{weight}</span>
                  <span
                    className="text-foreground text-lg"
                    style={{ fontWeight: value }}
                  >
                    {value} - The quick brown fox jumps over the lazy dog
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Spacing</h2>
            <p className="text-mutedForeground">
              4px increments for consistent rhythm and alignment
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg space-y-3">
            {Object.entries(designTokens.spacing).map(([token, value]) => (
              <div key={token} className="flex items-center gap-4">
                <span className="text-sm text-mutedForeground font-mono w-12">
                  {token}
                </span>
                <div
                  className="bg-primary h-8"
                  style={{ width: value.value }}
                />
                <span className="text-sm text-mutedForeground">
                  {value.value} ({value.px}px)
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Border Radius</h2>
            <p className="text-mutedForeground">
              Rounded corners for cards, buttons, and components
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(designTokens.radius).map(([token, value]) => (
              <div key={token} className="text-center">
                <div
                  className="w-24 h-24 bg-primary mx-auto mb-2"
                  style={{ borderRadius: value.value }}
                />
                <p className="text-sm font-medium capitalize">{token}</p>
                <p className="text-xs text-mutedForeground">{value.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Elevation Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Elevation</h2>
            <p className="text-mutedForeground">
              Shadow system for visual hierarchy and depth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(designTokens.elevation).map(([level, shadow]) => (
              <div key={level}>
                <div
                  className="p-8 bg-card rounded-lg border border-border"
                  style={{ boxShadow: shadow }}
                >
                  <p className="text-center font-medium capitalize">{level}</p>
                </div>
                <p className="text-xs text-mutedForeground mt-2 font-mono break-all">
                  {shadow}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Motion Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Motion</h2>
            <p className="text-mutedForeground">
              Transition timing and easing for subtle, calm interactions
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(designTokens.motion.duration).map(([speed, timing]) => (
                  <div key={speed} className="space-y-3">
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-mutedForeground mb-2 capitalize">{speed}</p>
                      <p className="font-mono text-sm">{timing.value} ({timing.ms}ms)</p>
                    </div>
                    <div
                      className="h-12 bg-primary rounded-lg hover:translate-x-4 cursor-pointer"
                      style={{
                        transition: `transform ${timing.value} ${designTokens.motion.easing.standard}`
                      }}
                    />
                    <p className="text-xs text-mutedForeground text-center">Hover to test</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Easing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(designTokens.motion.easing).map(([type, curve]) => (
                  <div key={type} className="space-y-3">
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-mutedForeground mb-2 capitalize">{type}</p>
                      <p className="font-mono text-xs break-all">{curve}</p>
                    </div>
                    <div
                      className="h-12 bg-secondary rounded-lg hover:scale-110 cursor-pointer"
                      style={{
                        transition: `transform ${designTokens.motion.duration.base.value} ${curve}`
                      }}
                    />
                    <p className="text-xs text-mutedForeground text-center">Hover to test</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Breakpoints Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Breakpoints</h2>
            <p className="text-mutedForeground">
              Responsive design breakpoints for different device sizes
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg space-y-3">
            {Object.entries(designTokens.breakpoints).map(([size, value]) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-sm text-mutedForeground font-mono w-12">
                  {size}
                </span>
                <div className="flex-1 bg-muted rounded overflow-hidden">
                  <div
                    className="bg-primary h-8 transition-all"
                    style={{
                      width: `${Math.min((value.px / 1536) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="text-sm text-mutedForeground w-24">
                  {value.value} ({value.px}px)
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Layout Tokens Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold font-serif mb-2">Layout Constraints</h2>
            <p className="text-mutedForeground">
              Special layout measurements for worksheets and sidebars
            </p>
          </div>

          <div className="grid gap-4">
            {Object.entries(designTokens.layout).map(([name, value]) => (
              <div key={name} className="p-6 bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span className="text-sm text-mutedForeground font-mono">
                    {value.value} ({value.px}px)
                  </span>
                </div>
                {('description' in value) && value.description && (
                  <p className="text-sm text-mutedForeground">{value.description}</p>
                )}
                <div className="mt-4">
                  <div
                    className="bg-muted h-24 rounded border-2 border-dashed border-border mx-auto"
                    style={{ maxWidth: value.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border text-center text-mutedForeground text-sm">
          <p>
            MathCraft Design System • Built with shadcn/ui • Powered by design tokens
          </p>
        </footer>
      </div>
    </div>
  );
}
