"use client";
import React, { useState } from 'react';
import { apiPost, apiGet } from '../lib/api';
import { FileText, Briefcase, Users, Shield, AlertCircle, Loader, CheckCircle2, Check, Circle } from 'lucide-react';

type MatterType = 'civil' | 'criminal' | 'family' | 'contract' | 'other';
type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  matterType: MatterType | '';
  description: string;
  parties: string[];
  jurisdiction: string;
  clientRole: string;
}

interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
}

export function IntakeWizard(): React.ReactNode {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    matterType: '',
    description: '',
    parties: [''],
    jurisdiction: '',
    clientRole: '',
  });
  const [conflictLoading, setConflictLoading] = useState(false);
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
  const [currentMatterId, setCurrentMatterId] = useState<string | null>(null);
  const [availableAttorneys, setAvailableAttorneys] = useState<any[]>([]);
  const [attorneysLoading, setAttorneysLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const stepTitles: Record<Step, string> = {
    1: 'Matter Type',
    2: 'Describe Your Issue',
    3: 'Party Identification',
    4: 'Conflict Screening',
    5: 'Attorney Matching',
  };

  const matterTypes: Array<{ value: MatterType; label: string }> = [
    { value: 'civil', label: 'Civil' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'family', label: 'Family' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
  ];

  async function createDraftMatterIfMissing() {
    if (currentMatterId) return currentMatterId;
    try {
      const matterData = await apiPost('/api/v1/matters/', {
        title: '',
        matter_type: formData.matterType,
        description: formData.description,
        jurisdiction: formData.jurisdiction,
        parties: formData.parties.filter(p => p).map(name => ({ name }))
      });
      const id = matterData?.id;
      setCurrentMatterId(id || null);
      return id;
    } catch (e) {
      console.error('Error creating draft matter', e);
      return null;
    }
  }

  async function handleConflictCheck() {
    setConflictLoading(true);
    setConflictResult(null);
    try {
      const matterId = await createDraftMatterIfMissing();
      if (!matterId) throw new Error('Could not create matter');
      const result = await apiPost('/api/v1/conflicts/check/', {
        matter_id: matterId,
      });
      setConflictResult(result);
    } catch (e: any) {
      setConflictResult({ hasConflict: true, reason: 'Error checking conflicts' });
      console.error('Conflict check failed', e);
    } finally {
      setConflictLoading(false);
    }
  }

  async function handleFetchAttorneys() {
    setAttorneysLoading(true);
    setAvailableAttorneys([]);
    try {
      const matterId = currentMatterId || (await createDraftMatterIfMissing());
      if (!matterId) throw new Error('Missing matter id');
      const result = await apiGet(`/api/v1/conflicts/matter/${matterId}/available-attorneys/`);
      setAvailableAttorneys(result.attorneys || []);
    } catch (e: any) {
      console.error('Error fetching attorneys', e);
    } finally {
      setAttorneysLoading(false);
    }
  }

  async function handleSubmitMatter() {
    setSubmitted(true);
    try {
      // If a draft exists, attempt to submit it; otherwise create one
      if (currentMatterId) {
        try {
          await apiPost(`/api/v1/matters/${currentMatterId}/submit/`);
          console.log('Matter submitted:', currentMatterId);
        } catch (err) {
          // Submission may require authentication; keep the draft and log
          console.warn('Submit failed (possibly unauthenticated). Draft saved as', currentMatterId);
        }
      } else {
        const matterData = await apiPost('/api/v1/matters/', {
          title: '',
          matter_type: formData.matterType,
          description: formData.description,
          jurisdiction: formData.jurisdiction,
          parties: formData.parties.filter(p => p).map(name => ({ name }))
        });
        setCurrentMatterId(matterData?.id || null);
        console.log('Matter created:', matterData);
      }
    } catch (e: any) {
      console.error('Error creating/submitting matter', e);
    }
  }

  function nextStep() {
    if (step === 1 && !formData.matterType) {
      setErrors({ matterType: 'Please select a matter type' });
      return;
    }
    if (step === 2 && formData.description.length < 10) {
      setErrors({ description: 'Please provide at least 10 characters' });
      return;
    }
    if (step === 3 && !formData.jurisdiction) {
      setErrors({ jurisdiction: 'Please select jurisdiction' });
      return;
    }
    setErrors({});
    if (step === 3) {
      handleConflictCheck();
    } else if (step === 4 && !conflictResult?.hasConflict) {
      handleFetchAttorneys();
    }
    if (step < 5) setStep((step + 1) as Step);
  }

  function prevStep() {
    if (step > 1) setStep((step - 1) as Step);
  }

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="site-container pt-6">
        <nav className="flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 font-semibold hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
            <span>Legal Connect</span>
          </a>
          <a href="/" className="text-lctextsecondary">← Back to Home</a>
        </nav>
      </header>

      <main className="site-container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition`}
                    style={{
                      backgroundColor: s < step ? '#065F46' : s === step ? '#065F46' : '#E5E7EB',
                      color: s < step ? 'white' : s === step ? 'white' : '#4B5563'
                    }}
                  >
                    {s < step ? <Check size={20} /> : s === step ? <Circle size={20} /> : s}
                  </div>
                  <p className={`text-xs mt-2 text-center ${s === step ? 'font-semibold text-lctextprimary' : 'text-lctextsecondary'}`}>
                    {['Matter', 'Describe', 'Parties', 'Conflict', 'Match'][s - 1]}
                  </p>
                  {s < 5 && <div className="h-0.5 flex-1 mx-2 mt-6" style={{ backgroundColor: s < step ? '#065F46' : '#E5E7EB' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">{stepTitles[step]}</h1>
            <p className="text-lg text-lctextsecondary">Step {step} of 5 · Complete this step to proceed</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 h-2 bg-lcborder rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%`, backgroundColor: '#065F46' }}
            />
          </div>

          <div className="bg-white border border-lcborder rounded-lg p-10 mb-10 shadow-sm">
            {step === 1 && (
              <div>
                <label className="block text-lg font-semibold mb-6">Which type of legal matter do you need help with?</label>
                <div className="grid grid-cols-2 gap-4">
                  {matterTypes.map(mt => (
                    <label key={mt.value} className={`flex items-center cursor-pointer p-4 border-2 rounded-lg transition ${
                      formData.matterType === mt.value
                        ? 'border-lcaccentclient bg-blue-50'
                        : 'border-lcborder hover:border-lcaccentclient hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="matterType"
                        value={mt.value}
                        checked={formData.matterType === mt.value}
                        onChange={(e) => setFormData({ ...formData, matterType: e.target.value as MatterType })}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="font-medium text-lctextprimary">{mt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.matterType && <p className="text-red-600 mt-4 font-medium">✗ {errors.matterType}</p>}
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-lg font-semibold mb-2">Tell us about your legal issue</label>
                <p className="text-lctextsecondary text-base mb-6">Be as detailed as possible so we can match you with the best attorney. Your information is encrypted and completely private.</p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your situation, timeline, and what you're hoping to achieve..."
                  rows={8}
                  maxLength={5000}
                  className="w-full border border-lcborder rounded-lg p-4 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient font-base resize-none" 
                  style={{ outlineColor: '#065F46' }}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-lctextsecondary">{formData.description.length} / 5000 characters</p>
                  {formData.description.length >= 10 && <p className="text-sm text-green-600 font-medium">✓ Good</p>}
                </div>
                {errors.description && <p className="text-red-600 mt-3 font-medium">✗ {errors.description}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-4">Who else is involved in this matter?</label>
                  <div className="space-y-3">
                    {formData.parties.map((party, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={party}
                          onChange={(e) => {
                            const newParties = [...formData.parties];
                            newParties[i] = e.target.value;
                            setFormData({ ...formData, parties: newParties });
                          }}
                          placeholder={`Party ${i + 1} (optional)`}
                          className="flex-1 border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient" 
                          style={{ outlineColor: '#065F46' }}
                        />
                        {i > 0 && (
                          <button
                            onClick={() => setFormData({ ...formData, parties: formData.parties.filter((_, idx) => idx !== i) })}
                            className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, parties: [...formData.parties, ''] })}
                    className="mt-3 px-4 py-2 text-lcaccentclient bg-blue-50 rounded-lg font-medium hover:bg-blue-100 transition text-sm"
                  >
                    + Add Another Party
                  </button>
                </div>

                <div className="border-t border-lcborder pt-6">
                  <label className="block text-lg font-semibold mb-4">What's your jurisdiction?</label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient" 
                    style={{ outlineColor: '#065F46' }}
                  >
                    <option value="">Select a state or jurisdiction...</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.jurisdiction && <p className="text-red-600 mt-2 font-medium">✗ {errors.jurisdiction}</p>}
                </div>

                <div className="border-t border-lcborder pt-6">
                  <label className="block text-lg font-semibold mb-4">What's your role in this matter?</label>
                  <input
                    type="text"
                    value={formData.clientRole}
                    onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                    placeholder="e.g., Plaintiff, Defendant, Complainant, Parent..."
                    className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient" 
                    style={{ outlineColor: '#065F46' }}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold mb-4">Checking for Conflicts of Interest</h2>
                {conflictLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lcaccent mb-6 animate-spin"><Loader size={48} strokeWidth={2} /></div>
                    <p className="text-lctextsecondary text-lg">Verifying conflict information...</p>
                    <p className="text-lctextsecondary text-sm mt-2">This usually takes just a moment.</p>
                  </div>
                ) : conflictResult ? (
                  <div className={`p-6 rounded-lg border-2 ${conflictResult.hasConflict ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                    {conflictResult.hasConflict ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <AlertCircle size={28} className="text-red-800" />
                          <p className="text-2xl font-semibold text-red-800">Conflict Detected</p>
                        </div>
                        <p className="text-red-700">{conflictResult.reason}</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CheckCircle2 size={28} className="text-green-800" />
                          <p className="text-2xl font-semibold text-green-800">All Clear</p>
                        </div>
                       
                        </div>
                        <p className="text-green-700">No conflicts found. Let's find you an attorney!</p>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Available Attorneys</h2>
                {attorneysLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-lcaccent animate-spin"><Loader size={40} strokeWidth={2} /></div>
                  </div>
                ) : availableAttorneys.length > 0 ? (
                  <div className="grid gap-4">
                    {availableAttorneys.map((atty: any) => (
                      <div key={atty.id} className="p-6 border-2 border-lcborder rounded-lg hover:border-lcaccentclient hover:shadow-md transition cursor-pointer bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg text-lctextprimary">{atty.name || 'Attorney'}</p>
                            <p className="text-lctextsecondary text-sm">{atty.practice_area || 'General Practice'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lcaccentclient">{atty.experience_years || 'N/A'} yrs</p>
                            <p className="text-xs text-lctextsecondary">Experience</p>
                          </div>
                        </div>
                        <button className="w-full mt-4 py-2 px-4 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition">
                          Select Attorney
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-4 text-lctextsecondary"><Users size={40} strokeWidth={1.5} /></div>
                    <p className="text-lctextsecondary text-lg">No attorneys currently available for your matter type.</p>
                    <p className="text-lctextsecondary text-sm mt-2">Please try again soon or contact support.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-8 py-3 border-2 border-lcborder rounded-lg text-lctextprimary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
            <button
              onClick={step === 5 ? handleSubmitMatter : nextStep}
              style={{
                backgroundColor: '#065F46',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                opacity: 1,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {step === 5 ? (submitted ? '✓ Submitted' : 'Submit & Match') : 'Next →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
