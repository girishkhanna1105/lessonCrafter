import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";
import { safeJsonParse } from "./safeJson";
import { PedagogyBrief } from "./pedagogyAgent";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface InteractiveElement {
  type: "code_demo" | "visualization" | "diagram" | "animation";
  section_title: string;
  description: string;
  jsx_code: string; // Self-contained JSX/React code for the element
}

export interface InteractiveOutput {
  elements: InteractiveElement[];
}

export async function runInteractiveAgent(
  content: LessonContent,
  pedagogyBrief?: PedagogyBrief
): Promise<InteractiveOutput> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const sectionsOverview = content.sections
    .map((s, i) => `Section ${i + 1}: "${s.title}" — Key: ${s.key_points.slice(0, 2).join(", ")}`)
    .join("\n");

  const simTarget = pedagogyBrief?.simulationGoal
    ? `SPECIFIC SIMULATION GOAL: "${pedagogyBrief.simulationGoal}"`
    : "";

  const prompt = `You are the Lead Interactive Simulation Engineer.
Your job is to design a gorgeous, responsive, instrument-grade interactive laboratory for: "${content.title}".
${simTarget}

SECTIONS CONTEXT:
${sectionsOverview}

DESIGN & ARCHITECTURE REQUIREMENTS:
1. RESPONSIBILITY & FIT:
   - The interactive module MUST fit 100% seamlessly inside its parent card container without overflowing or being indented.
   - Root element: <div style={{ width: "100%", boxSizing: "border-box" }}>...</div> (DO NOT add redundant outer margins or fixed max-width).
   - The SVG visualizer MUST use responsive attributes: viewBox="0 0 860 340", width="100%", height="auto", style={{ display: "block", borderRadius: 12 }}.
   - Controls and readouts MUST use responsive flex/grid layouts with style={{ width: "100%", boxSizing: "border-box" }}. NEVER use fixed pixel widths > 100%.

2. INSTRUMENT-GRADE VISUAL DESIGN:
   - Palette: Cobalt (#2563eb), Marine Cyan (#06b6d4), Emerald (#10b981), Solar Amber (#f59e0b). NEVER purple or violet.
   - Clean dark-slate instrument frame with subtle border and status header:
     - Header bar with title, model status pill ("Active Simulation", "60 FPS"), and preset buttons.
     - Centerpiece SVG visualizer with coordinate axes, soft gridlines, glowing dynamic paths (using linearGradient or drop-shadow), and animated or parameterized markers.
   - Dedicated Control Dock beneath the canvas:
     - 2 to 3 labeled parameter sliders (e.g. Frequency, Damping, Amplitude, or Phase) with real-time numeric readouts.
     - 2 to 3 Quick Preset buttons (e.g. "Baseline State", "Critical Resonance", "Damped Equilibrium").
   - Live Telemetry Readout Grid:
     - 3 to 4 computed metric pills (e.g. "Total Energy", "Q-Factor", "System Entropy", "Phase Shift") calculated dynamically from the current slider states.

3. REACT FORMAT:
   - Valid self-contained React functional component snippet:
     () => {
       const [paramA, setParamA] = useState(50);
       const [paramB, setParamB] = useState(25);
       ...
       return (
         <div style={{ ... }}>
           ...
         </div>
       );
     }
   - NO import or export statements.
   - Only React hooks (useState, useEffect, useMemo).
   - Only inline style={{ ... }}.

Return ONLY valid JSON matching this schema:
{
  "elements": [
    {
      "type": "visualization",
      "section_title": "Interactive Laboratory: Dynamic State Simulation",
      "description": "Instrument-grade parameter simulator with real-time telemetry and state visualization",
      "jsx_code": "() => { ... }"
    }
  ]
}

Return ONLY valid JSON.`;

  const fallback: InteractiveOutput = {
    elements: [
      {
        type: "visualization",
        section_title: content.sections[0]?.title || "Interactive Simulation Lab",
        description: `Dynamic parameter sandbox for ${content.title}`,
        jsx_code: `() => {
          const [frequency, setFrequency] = useState(4);
          const [damping, setDamping] = useState(25);
          const [mode, setMode] = useState('harmonic');

          // Generate dynamic wave path
          const points = [];
          const width = 760;
          const height = 300;
          const midY = height / 2;
          for (let x = 0; x <= width; x += 10) {
            const decay = Math.exp((-damping / 100) * (x / width) * 2.5);
            const y = midY + Math.sin((x / 50) * (frequency / 2)) * 80 * decay;
            points.push(x + ',' + y.toFixed(1));
          }
          const pathD = 'M ' + points.join(' L ');

          const energy = ((frequency * 1.5) * (1 - damping / 200)).toFixed(2);
          const stability = damping > 40 ? 'High Damping' : damping > 15 ? 'Critical Damping' : 'Underdamped';

          return (
            <div style={{ width: '100%', boxSizing: 'border-box', background: '#0a101d', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 16, padding: 20, color: '#f8fafc', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
              
              {/* Header Telemetry Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'between', gap: 12, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }}></div>
                  <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#93c5fd' }}>
                    Interactive System State Lab
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  <button onClick={() => { setFrequency(3); setDamping(15); setMode('harmonic'); }} style={{ background: mode === 'harmonic' ? '#2563eb' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    Resonant Mode
                  </button>
                  <button onClick={() => { setFrequency(6); setDamping(65); setMode('damped'); }} style={{ background: mode === 'damped' ? '#2563eb' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    Critical Damped
                  </button>
                  <button onClick={() => { setFrequency(4); setDamping(25); setMode('custom'); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Responsive Visualizer Canvas */}
              <div style={{ width: '100%', background: '#060b14', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
                <svg viewBox="0 0 760 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  
                  {/* Grid background */}
                  <rect width="760" height="300" fill="url(#grid)" />
                  <line x1="0" y1="150" x2="760" y2="150" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
                  
                  {/* Waveform curve */}
                  <path d={pathD} fill="none" stroke="url(#waveGrad)" strokeWidth="3.5" style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.5))' }} />
                  
                  {/* Phase points */}
                  <circle cx="180" cy={midY + Math.sin((180 / 50) * (frequency / 2)) * 80 * Math.exp((-damping / 100) * (180 / width) * 2.5)} r="5" fill="#38bdf8" />
                  <circle cx="380" cy={midY + Math.sin((380 / 50) * (frequency / 2)) * 80 * Math.exp((-damping / 100) * (380 / width) * 2.5)} r="5" fill="#10b981" />
                </svg>
              </div>

              {/* Parameter Control Dock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#cbd5e1' }}>Oscillation Frequency (ω)</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{frequency}.0 Hz</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={frequency} 
                    onChange={(e) => { setFrequency(Number(e.target.value)); setMode('custom'); }} 
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#cbd5e1' }}>Damping Coefficient (γ)</span>
                    <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{damping}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="90" step="5" 
                    value={damping} 
                    onChange={(e) => { setDamping(Number(e.target.value)); setMode('custom'); }} 
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} 
                  />
                </div>
              </div>

              {/* Dynamic Telemetry Metric Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 14 }}>
                <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>State Kinetic Energy</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2, fontFamily: 'monospace' }}>{energy} J</div>
                </div>
                <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#67e8f9', fontWeight: 700 }}>Regime Stability</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 4 }}>{stability}</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 700 }}>Phase Coherence</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2, fontFamily: 'monospace' }}>{(100 - damping)}%</div>
                </div>
              </div>

            </div>
          );
        }`,
      },
    ],
  };

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    return safeJsonParse<InteractiveOutput>(rawText, fallback);
  } catch (e: any) {
    console.error("[InteractiveAgent] Gemini error, using fallback:", e.message);
    return fallback;
  }
}
