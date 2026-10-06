"use client";
import React, { useState } from 'react';
import { apiPost, apiGet } from '../lib/api';
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Ellipsis, FileSignature, Flag, Gavel, Globe, House,
  Info, Landmark, Loader2, MapPin, Plus, Scale, ShieldCheck, User, Users, X, type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

type MatterType = 'civil' | 'criminal' | 'family' | 'contract' | 'real_estate' | 'probate' | 'other';
type JurisdictionType = 'state' | 'federal' | 'international' | '';
type ClientRole = 'plaintiff' | 'defendant' | 'witness' | 'third_party' | '';
type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  matterType: MatterType | '';
  description: string;
  parties: string[];
  jurisdictionType: JurisdictionType;
  jurisdictionState: string;
  clientRole: ClientRole;
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
    jurisdictionType: '',
    jurisdictionState: '',
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
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'probate', label: 'Probate' },
    { value: 'other', label: 'Other' },
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const clientRoles: Array<{ value: ClientRole; label: string }> = [
    { value: 'plaintiff', label: 'Plaintiff' },
    { value: 'defendant', label: 'Defendant' },
    { value: 'witness', label: 'Witness' },
    { value: 'third_party', label: 'Third Party' },
  ];

  async function createDraftMatterIfMissing() {
    if (currentMatterId) return currentMatterId;
    try {
      // Generate a title from matter type and description if not provided
      const descSnippet = (formData.description || '').trim().split('\n')[0].substring(0, 50);
      const generatedTitle = `${formData.matterType || 'Matter'}: ${descSnippet || 'Intake'}`;
      
      const payload: any = {
        title: generatedTitle,
        matter_type: formData.matterType,
        description: formData.description,
        parties: formData.parties.filter(p => p).map(name => ({ name })),
        jurisdiction_type: formData.jurisdictionType,
        jurisdiction_state: formData.jurisdictionState,
        client_role: formData.clientRole
      };
      
      console.log('Creating matter with payload:', payload);
      
      const matterData = await apiPost('/api/v1/matters/', payload);
      const id = matterData?.id;
      setCurrentMatterId(id || null);
      return id;
    } catch (e: any) {
      console.error('Error creating draft matter', e, e?.data);
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
        const descSnippet = (formData.description || '').trim().split('\n')[0].substring(0, 50);
        const generatedTitle = `${formData.matterType || 'Matter'}: ${descSnippet || 'Intake'}`;
        
        const payload: any = {
          title: generatedTitle,
          matter_type: formData.matterType,
          description: formData.description,
          parties: formData.parties.filter(p => p).map(name => ({ name })),
          jurisdiction_type: formData.jurisdictionType,
          jurisdiction_state: formData.jurisdictionState,
          client_role: formData.clientRole
        };
        
        const matterData = await apiPost('/api/v1/matters/', payload);
        setCurrentMatterId(matterData?.id || null);
        console.log('Matter created:', matterData);
      }
    } catch (e: any) {
      console.error('Error creating/submitting matter', e);
    }
  }

  async function nextStep() {
    if (step === 1 && !formData.matterType) {
      setErrors({ matterType: 'Please select a matter type' });
      return;
    }
    if (step === 2 && formData.description.length < 10) {
      setErrors({ description: 'Please provide at least 10 characters' });
      return;
    }
    if (step === 3 && !formData.jurisdictionType) {
      setErrors({ jurisdictionType: 'Please select a jurisdiction type' });
      return;
    }
    if (step === 3 && formData.jurisdictionType === 'state' && !formData.jurisdictionState) {
      setErrors({ jurisdictionState: 'Please select a state' });
      return;
    }
    if (step === 3 && !formData.clientRole) {
      setErrors({ clientRole: 'Please select your role' });
      return;
    }
    setErrors({});
    
    // For step 3, run conflict check and wait for it before moving on
    if (step === 3) {
      await handleConflictCheck();
    } else if (step === 4 && !conflictResult?.hasConflict) {
      // For step 4, fetch attorneys
      await handleFetchAttorneys();
    }
    
    // Only advance if we completed the async operations successfully
    if (step === 3 && conflictResult?.hasConflict) {
      // Don't advance if there's a conflict
      return;
    }
    if (step === 4 && availableAttorneys.length === 0) {
      // Allow advance even if no attorneys (show "no attorneys available" message)
    }
    
    if (step < 5) setStep((step + 1) as Step);
  }

  function prevStep() {
    if (step > 1) setStep((step - 1) as Step);
  }

  const stageLabels = ['Matter', 'Describe', 'Parties', 'Conflicts', 'Match'];
  const matterIcons: Record<MatterType, LucideIcon> = {
    civil: Scale,
    criminal: Gavel,
    family: Users,
    contract: FileSignature,
    real_estate: House,
    probate: Landmark,
    other: Ellipsis,
  };
  const jurisdictionIcons: Record<string, LucideIcon> = { state: Landmark, federal: Flag, international: Globe };
  const whyAsk: Partial<Record<Step, string>> = {
    2: 'We use this to find attorneys who handle matters like yours. You can go back and change it.',
    3: 'Parties are needed for conflict screening, so an attorney who already acts for someone involved is never matched with you. Names are protected before they are compared.',
  };

  const matterLabel = matterTypes.find((m) => m.value === formData.matterType)?.label;
  const roleLabel = clientRoles.find((r) => r.value === formData.clientRole)?.label;
  const partyCount = formData.parties.filter((p) => p.trim()).length;
  const where =
    formData.jurisdictionType === 'state'
      ? formData.jurisdictionState || 'State'
      : formData.jurisdictionType
        ? formData.jurisdictionType.charAt(0).toUpperCase() + formData.jurisdictionType.slice(1)
        : '';

  const summary = [
    { label: 'Matter type', value: matterLabel, icon: Scale },
    { label: 'Jurisdiction', value: where, icon: MapPin },
    { label: 'Your role', value: roleLabel, icon: User },
    { label: 'Parties listed', value: partyCount ? String(partyCount) : '', icon: Users },
  ];

  function FieldError({ id, msg }: { id: string; msg?: string }) {
    if (!msg) return null;
    return (
      <p id={id} role="alert" className="mt-3 flex items-center gap-2 text-sm font-medium text-[#b42318]">
        <AlertCircle size={16} className="flex-none" /> {msg}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 text-ink lg:pb-0">
      <header className="border-b border-hairline bg-white">
        <div className="site-container flex items-center justify-between" style={{ height: 'var(--header-h)' }}>
          <Logo />
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-mute transition-colors hover:text-ink">
            <ArrowLeft size={16} /> Exit intake
          </Link>
        </div>
      </header>

      <main className="site-container py-8 md:py-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <div>
            <nav aria-label="Progress" className="mb-8">
              <p className="text-sm font-semibold text-blue-600 lg:hidden">
                Step {step} of 5 · {stageLabels[step - 1]}
              </p>
              <ol className="mt-3 grid grid-cols-5 gap-2 lg:mt-0">
                {stageLabels.map((label, i) => {
                  const n = i + 1;
                  const done = n < step;
                  const on = n === step;
                  return (
                    <li key={label} aria-current={on ? 'step' : undefined}>
                      <span className={`block h-1.5 rounded-full transition-colors duration-300 ${done || on ? 'bg-green-600' : 'bg-hairline'}`} />
                      <span className={`mt-2 hidden items-center gap-1.5 text-[0.82rem] lg:flex ${on ? 'font-semibold text-ink' : done ? 'text-green-700' : 'text-mute'}`}>
                        {done && <Check size={14} strokeWidth={3} />}
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="mb-8">
              <h1 className="title-2">{stepTitles[step]}</h1>
              {whyAsk[step] && (
                <p className="mt-3 flex max-w-xl items-start gap-2.5 text-[0.95rem] leading-relaxed text-mute">
                  <Info size={18} className="mt-0.5 flex-none text-blue-600" />
                  <span>
                    <span className="font-semibold text-ink">Why we ask. </span>
                    {whyAsk[step]}
                  </span>
                </p>
              )}
            </div>

            <div className="card p-6 sm:p-9">
              {step === 1 && (
                <fieldset aria-describedby={errors.matterType ? 'err-matter' : undefined}>
                  <legend className="mb-5 text-lg font-semibold">Which type of legal matter do you need help with?</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {matterTypes.map((mt) => (
                      <label key={mt.value} className="choice">
                        <input
                          type="radio"
                          name="matterType"
                          value={mt.value}
                          checked={formData.matterType === mt.value}
                          onChange={(e) => setFormData({ ...formData, matterType: e.target.value as MatterType })}
                        />
                        {(() => {
                          const Icon = matterIcons[mt.value];
                          return <Icon size={20} strokeWidth={1.75} className="flex-none text-mute" />;
                        })()}
                        <span>{mt.label}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError id="err-matter" msg={errors.matterType} />
                </fieldset>
              )}

              {step === 2 && (
                <div>
                  <label htmlFor="description" className="text-lg font-semibold">Tell us about your legal issue</label>
                  <p className="mb-5 mt-2 text-[0.97rem] leading-relaxed text-mute">
                    Be as detailed as possible so we can match you with the best attorney. Your information is encrypted and completely private.
                  </p>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your situation, timeline, and what you're hoping to achieve..."
                    rows={9}
                    maxLength={5000}
                    aria-describedby={errors.description ? 'err-desc' : undefined}
                    className="field"
                  />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="text-mute tnum">{formData.description.length} / 5000</p>
                    {formData.description.length >= 10 && (
                      <p className="inline-flex items-center gap-1.5 font-medium text-green-700"><CheckCircle2 size={16} /> Enough to start</p>
                    )}
                  </div>
                  <FieldError id="err-desc" msg={errors.description} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <p className="mb-4 text-lg font-semibold">Who else is involved in this matter?</p>
                    <div className="space-y-3">
                      {formData.parties.map((party, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            aria-label={`Party ${i + 1}`}
                            value={party}
                            onChange={(e) => {
                              const newParties = [...formData.parties];
                              newParties[i] = e.target.value;
                              setFormData({ ...formData, parties: newParties });
                            }}
                            placeholder={`Party ${i + 1} (optional)`}
                            className="field flex-1"
                          />
                          {i > 0 && (
                            <button
                              type="button"
                              aria-label={`Remove party ${i + 1}`}
                              onClick={() => setFormData({ ...formData, parties: formData.parties.filter((_, idx) => idx !== i) })}
                              className="grid h-12 w-12 flex-none place-items-center rounded-xl text-[#b42318] transition-colors hover:bg-[#fef3f2]"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, parties: [...formData.parties, ''] })}
                      className="btn btn-ghost btn-sm mt-3"
                    >
                      <Plus size={16} /> Add another party
                    </button>
                  </div>

                  <fieldset className="border-t border-hairline pt-8">
                    <legend className="mb-4 text-lg font-semibold">What is your jurisdiction type?</legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {['state', 'federal', 'international'].map((type) => (
                        <label key={type} className="choice capitalize">
                          <input
                            type="radio"
                            name="jurisdictionType"
                            value={type}
                            checked={formData.jurisdictionType === (type as JurisdictionType)}
                            onChange={(e) => setFormData({ ...formData, jurisdictionType: e.target.value as JurisdictionType, jurisdictionState: '' })}
                          />
                          {(() => {
                            const Icon = jurisdictionIcons[type];
                            return <Icon size={20} strokeWidth={1.75} className="flex-none text-mute" />;
                          })()}
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    <FieldError id="err-jt" msg={errors.jurisdictionType} />
                  </fieldset>

                  {formData.jurisdictionType === 'state' && (
                    <div className="border-t border-hairline pt-8">
                      <label htmlFor="state" className="mb-4 block text-lg font-semibold">Which state?</label>
                      <select
                        id="state"
                        value={formData.jurisdictionState}
                        onChange={(e) => setFormData({ ...formData, jurisdictionState: e.target.value })}
                        className="field"
                      >
                        <option value="">Select a state…</option>
                        {usStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <FieldError id="err-js" msg={errors.jurisdictionState} />
                    </div>
                  )}

                  <div className="border-t border-hairline pt-8">
                    <label htmlFor="role" className="mb-4 block text-lg font-semibold">What is your role in this matter?</label>
                    <select
                      id="role"
                      value={formData.clientRole}
                      onChange={(e) => setFormData({ ...formData, clientRole: e.target.value as ClientRole })}
                      className="field"
                    >
                      <option value="">Select your role…</option>
                      {clientRoles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                    <FieldError id="err-role" msg={errors.clientRole} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div aria-live="polite" className="py-4 text-center sm:py-8">
                  {conflictLoading ? (
                    <div className="flex flex-col items-center">
                      <span className="text-blue-600">
                        <Loader2 size={30} className="animate-spin" />
                      </span>
                      <h2 className="title-3 mt-6">Checking for conflicts of interest</h2>
                      <p className="mt-2 text-mute">Verifying conflict information. This usually takes just a moment.</p>
                    </div>
                  ) : conflictResult ? (
                    conflictResult.hasConflict ? (
                      <div className="notice notice-error mx-auto max-w-md !flex-col !items-center !p-6 text-center">
                        <AlertCircle size={32} />
                        <p className="text-xl font-semibold">Conflict detected</p>
                        <p>{conflictResult.reason}</p>
                      </div>
                    ) : (
                      <div className="notice notice-success mx-auto max-w-md !flex-col !items-center !p-6 text-center">
                        <ShieldCheck size={32} />
                        <p className="text-xl font-semibold">Clear at platform level</p>
                        <p>No conflicts found. Let&apos;s find you an attorney.</p>
                        <p className="text-sm opacity-80">Each attorney still completes their own conflict review before accepting.</p>
                      </div>
                    )
                  ) : (
                    <p className="text-mute">Select Next to run the conflict check.</p>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="title-3 mb-5">Available attorneys</h2>
                  {attorneysLoading ? (
                    <div className="flex items-center justify-center py-14 text-blue-600">
                      <Loader2 size={34} className="animate-spin" />
                    </div>
                  ) : availableAttorneys.length > 0 ? (
                    <ul className="space-y-4">
                      {availableAttorneys.map((atty: any) => (
                        <li key={atty.id} className="rounded-2xl bg-white p-5">
                          <div className="flex items-start gap-4">
                            <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-ink text-sm font-semibold text-white">
                              {(atty.name || 'A').trim().charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-lg font-semibold">{atty.name || 'Attorney'}</p>
                              <p className="text-[0.95rem] text-mute">{atty.practice_area || 'General Practice'}</p>
                            </div>
                            <div className="flex-none text-right">
                              <p className="font-semibold text-green-700 tnum">{atty.experience_years || 'N/A'} yrs</p>
                              <p className="text-xs text-mute">Experience</p>
                            </div>
                          </div>
                          <button className="btn btn-primary mt-5 w-full">Select attorney</button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-2xl bg-white px-6 py-12 text-center">
                      <span className="mx-auto block text-mute">
                        <Users size={26} strokeWidth={1.6} />
                      </span>
                      <p className="mt-5 text-lg font-semibold">No attorneys are available for your matter type right now.</p>
                      <p className="mt-2 text-mute">Please try again soon or contact support.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
                <button type="button" onClick={prevStep} disabled={step === 1} className="btn btn-outline">
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  type="button"
                  onClick={step === 5 ? handleSubmitMatter : nextStep}
                  disabled={step === 4 && conflictLoading}
                  className="btn btn-primary min-w-[9.5rem]"
                >
                  {step === 5 ? (
                    submitted ? (
                      <>
                        <Check size={18} /> Submitted
                      </>
                    ) : (
                      'Submit and match'
                    )
                  ) : (
                    <>
                      Next <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="card sticky top-8 p-6">
              <h2 className="title-3">Your matter so far</h2>
              <dl className="mt-5 space-y-4 text-[0.95rem]">
                {summary.map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <row.icon size={18} strokeWidth={1.75} className="mt-0.5 flex-none text-mute" />
                    <div>
                      <dt className="text-xs font-medium text-mute">{row.label}</dt>
                      <dd className={row.value ? 'mt-0.5 font-semibold text-ink' : 'mt-0.5 text-[#aeaeb2]'}>{row.value || 'Not added yet'}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-6 flex items-start gap-2 border-t border-hairline pt-5 text-[0.85rem] leading-relaxed text-mute">
                <ShieldCheck size={16} className="mt-0.5 flex-none text-green-600" />
                You can go back and change any answer.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
